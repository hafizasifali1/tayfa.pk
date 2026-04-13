import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, ShieldCheck, ShieldAlert, Plus, 
  Search, Edit2, Trash2, ChevronRight, 
  CheckCircle2, XCircle, Info, Lock, 
  Eye, Settings, Database, Globe, 
  ShoppingBag, Users, BarChart3
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { rbacService } from '../../services/rbacService';
import { RoleConfig, ModulePermission, Action } from '../../types';

const RoleManagement = () => {
  const { roles: authRoles, refreshRoles, user } = useAuth();
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(null);

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';

  const canModifyRole = (roleId: string) => {
    if (roleId === 'super_admin') return false;
    if (roleId === 'admin') return isSuperAdmin;
    return isSuperAdmin || isAdmin;
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await rbacService.getRoles();
      setRoles(data);
      if (data.length > 0) setSelectedRole(data[0]);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'overview': return <BarChart3 size={16} />;
      case 'orders': return <ShoppingBag size={16} />;
      case 'users': return <Users size={16} />;
      case 'settings': return <Settings size={16} />;
      case 'database': return <Database size={16} />;
      case 'website': return <Globe size={16} />;
      default: return <Shield size={16} />;
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif mb-4">Role & Permissions</h1>
          <p className="text-brand-dark/60 font-sans">Define granular access control for platform modules and actions.</p>
        </div>
        <Button variant="primary" icon={Plus}>
          Create New Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Roles List */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 border-brand-dark/5">
            <div className="relative mb-6">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20" />
              <input 
                type="text" 
                placeholder="Search roles..." 
                className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-brand-gold/10 outline-none"
              />
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="py-10 text-center">
                  <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left group ${
                      selectedRole?.id === role.id 
                        ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/10' 
                        : 'hover:bg-brand-cream/50 text-brand-dark/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedRole?.id === role.id ? 'bg-white/10' : 'bg-brand-dark/5'}`}>
                        <Shield size={16} className={selectedRole?.id === role.id ? 'text-brand-gold' : 'text-brand-dark/40'} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${selectedRole?.id === role.id ? 'text-white' : 'text-brand-dark'}`}>
                          {role.name}
                        </p>
                        <p className={`text-[10px] uppercase tracking-widest opacity-40`}>
                          {Object.keys(role.permissions).length} Modules
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className={`transition-transform ${selectedRole?.id === role.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                  </button>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6 border-brand-dark/5 bg-brand-gold/5 border-brand-gold/10">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/20 flex items-center justify-center text-brand-gold flex-shrink-0">
                <Info size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-dark mb-1">Security Tip</h4>
                <p className="text-xs text-brand-dark/60 leading-relaxed">
                  Always follow the principle of least privilege. Grant users only the permissions they absolutely need.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Permissions Detail */}
        <div className="lg:col-span-8">
          {selectedRole ? (
            <Card className="p-10 border-brand-dark/5 h-full">
              <div className="flex items-start justify-between mb-12">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-serif">{selectedRole.name}</h2>
                    <Badge variant="neutral" className="text-[10px] uppercase tracking-widest border-brand-dark/10">
                      ID: {selectedRole.id}
                    </Badge>
                  </div>
                  <p className="text-brand-dark/40 text-sm">{selectedRole.description}</p>
                </div>
                <div className="flex gap-3">
                  {selectedRole && canModifyRole(selectedRole.id) && (
                    <Button variant="outline" icon={Edit2}>Edit Role</Button>
                  )}
                  {selectedRole && !selectedRole.isSystem && canModifyRole(selectedRole.id) && (
                    <Button variant="outline" className="text-rose-500 hover:bg-rose-500/10 border-rose-500/10" icon={Trash2}>
                      Delete
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-10">
                <div className="flex items-center gap-4 py-4 border-y border-brand-dark/5">
                  <Lock size={18} className="text-brand-gold" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-dark/40 font-serif italic">Module Access Control</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {selectedRole.permissions.map((perm) => (
                    <div key={perm.module} className="p-6 rounded-3xl bg-brand-cream/20 border border-brand-dark/5 hover:border-brand-gold/20 transition-all group">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-dark/40 group-hover:text-brand-gold transition-colors shadow-sm">
                            {getModuleIcon(perm.module)}
                          </div>
                          <h4 className="font-bold text-brand-dark capitalize">{perm.module}</h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[9px] uppercase tracking-widest">Active</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {['view', 'create', 'edit', 'delete'].map((action) => {
                          const hasAction = perm.actions.includes(action as Action);
                          return (
                            <div 
                              key={action}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                hasAction 
                                  ? 'bg-white border-emerald-500/20 text-emerald-700' 
                                  : 'bg-brand-dark/5 border-transparent text-brand-dark/20'
                              }`}
                            >
                              <span className="text-[10px] font-bold uppercase tracking-widest">{action}</span>
                              {hasAction ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-16 p-8 rounded-3xl bg-brand-dark text-white flex items-center justify-between overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-brand-gold/20 transition-all" />
                <div className="relative z-10">
                  <h4 className="text-xl font-serif mb-2">Audit Access Logs</h4>
                  <p className="text-white/40 text-xs">Track every change made to this role's permissions over time.</p>
                </div>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/10 relative z-10" icon={Eye}>
                  View History
                </Button>
              </div>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-brand-dark/5 rounded-[3rem]">
              <ShieldAlert size={64} className="text-brand-dark/10 mb-6" />
              <h3 className="text-2xl font-serif text-brand-dark/40 mb-2">No Role Selected</h3>
              <p className="text-brand-dark/20 text-sm max-w-xs">Select a role from the list on the left to view and manage its permissions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
