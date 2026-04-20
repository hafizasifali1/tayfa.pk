import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Seller, RoleConfig, Action, Module } from '../types';
import { rbacService } from '../services/rbacService';

interface AuthContextType {
  user: User | Seller | null;
  login: (email: string, password: string, role?: string) => Promise<void>;
  socialLogin: (provider: 'google' | 'apple', role: string) => Promise<void>;
  googleLogin: (token: string, role: string) => Promise<void>;
  registerUser: (data: any) => Promise<void>;
  registerSeller: (data: any) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  logout: () => void;
  isAuthReady: boolean;
  hasPermission: (module: Module, action?: Action) => boolean;
  roles: RoleConfig[];
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to handle potentially double-stringified permissions from DB
const safeParsePermissions = (permissions: any): ModulePermission[] => {
  if (!permissions) return [];
  if (Array.isArray(permissions)) return permissions;
  
  if (typeof permissions === 'string') {
    try {
      const parsed = JSON.parse(permissions);
      // If it's still a string after one parse, it was double-stringified
      if (typeof parsed === 'string') {
        return safeParsePermissions(parsed);
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to parse permissions string:', permissions);
      return [];
    }
  }
  
  return [];
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | Seller | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [roles, setRoles] = useState<RoleConfig[]>([]);

  const refreshRoles = async () => {
    try {
      const fetchedRoles = await rbacService.getRoles();
      const processedRoles = (Array.isArray(fetchedRoles) ? fetchedRoles : []).map(role => ({
        ...role,
        permissions: safeParsePermissions(role.permissions)
      }));
      setRoles(processedRoles);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      setRoles([]); // Fallback to empty array on error
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshRoles();
        const savedUser = localStorage.getItem('tayfa_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          // If the user has a role with permissions, we might need to parse them too if they were baked in
          if (parsedUser.permissions) {
            parsedUser.permissions = safeParsePermissions(parsedUser.permissions);
          }
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsAuthReady(true);
      }
    };
    initAuth();
  }, []);

  const hasPermission = (module: Module, action: Action = 'view'): boolean => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'super_admin') return true;

    const rolesArray = Array.isArray(roles) ? roles : [];
    const roleConfig = rolesArray.find(r => r.id === user.role);
    if (!roleConfig) return false;

    let permissions = roleConfig.permissions;
    if (typeof permissions === 'string') {
      try {
        permissions = JSON.parse(permissions);
      } catch (e) {
        permissions = [];
      }
    }
    
    if (!Array.isArray(permissions)) permissions = [];
    
    const modulePermission = (permissions as any[]).find(p => p.module === module);
    return modulePermission?.actions.includes(action) || false;
  };

  const login = async (email: string, password: string, role?: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('tayfa_user', JSON.stringify(userData));
        if (role) localStorage.setItem('tayfa_last_role', role);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Invalid email or password');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const socialLogin = async (provider: 'google' | 'apple', role: string) => {
    // Mock social login
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: `Social User (${provider})`,
      email: `${provider}_user@example.com`,
      role: role as any,
    };
    setUser(newUser);
    localStorage.setItem('tayfa_user', JSON.stringify(newUser));
    localStorage.setItem('tayfa_last_role', role);
  };

  const googleLogin = async (token: string, role: string) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, role })
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Server response was not JSON:", text);
        throw new Error("Invalid response from server. Did you restart the server?");
      }

      if (response.ok) {
        setUser(data);
        localStorage.setItem('tayfa_user', JSON.stringify(data));
        localStorage.setItem('tayfa_last_role', role);
      } else {
        throw new Error(data.error || 'Google login failed');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const registerUser = async (data: any) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role: 'user' })
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('tayfa_user', JSON.stringify(userData));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const registerSeller = async (data: any) => {
    try {
      const { fullName, email, password, phone, ...businessData } = data;
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fullName, 
          email, 
          password, 
          phone, 
          role: 'seller',
          businessData 
        })
      });

      if (response.ok) {
        const userData = await response.json();
        // For sellers, we don't log them in immediately as they are pending
        return userData;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
      }
    } catch (error: any) {
      console.error('Seller registration error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: any) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('tayfa_user', JSON.stringify(updatedUser));
        
        // Update in users list too
        const users = JSON.parse(localStorage.getItem('tayfa_users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          localStorage.setItem('tayfa_users', JSON.stringify(users));
        }
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tayfa_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, socialLogin, googleLogin, registerUser, registerSeller, updateProfile, logout, isAuthReady, hasPermission, roles, refreshRoles }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
