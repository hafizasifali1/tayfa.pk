import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Search, Filter, Plus, MoreVertical, 
  Shield, Mail, Phone, Calendar, CheckCircle2, 
  XCircle, Edit2, Trash2, UserPlus, ShieldCheck,
  X, Save, Lock, ShieldAlert, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EditModal } from '../../components/admin/EditModal';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../../components/common/ConfirmModal';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
}

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    status: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Password Reset State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (data: any) => {
    if (!selectedUser) return;

    try {
      setIsUpdating(true);
      await axios.patch(`/api/admin/users/${selectedUser.id}`, {
        ...data,
        adminId: currentUser?.id
      });
      
      // Update local state
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...data } : u));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    try {
      setIsResetting(true);
      await axios.post(`/api/admin/users/${selectedUser.id}/reset-password`, {
        newPassword,
        adminId: currentUser?.id
      });
      
      setIsResetModalOpen(false);
      setNewPassword('');
      alert('Password has been reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      await axios.delete(`/api/admin/users/${userToDelete.id}`, {
        data: { adminId: currentUser?.id }
      });
      
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = user.fullName || '';
    const email = user.email || '';
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge variant="danger" className="bg-rose-500/10 text-rose-600 border-rose-200">Admin</Badge>;
      case 'seller': return <Badge variant="warning" className="bg-amber-500/10 text-amber-600 border-amber-200">Seller</Badge>;
      case 'delivery_agent': return <Badge variant="info" className="bg-blue-500/10 text-blue-600 border-blue-200">Delivery</Badge>;
      default: return <Badge variant="default" className="bg-slate-500/10 text-slate-600 border-slate-200">Customer</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 size={10} /> Active</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center gap-1"><AlertCircle size={10} /> Pending</Badge>;
      case 'inactive':
      default:
        return <Badge variant="danger" className="flex items-center gap-1"><XCircle size={10} /> Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif mb-4">User Management</h1>
          <p className="text-brand-dark/60 font-sans">Manage platform users, roles, and access permissions.</p>
        </div>
        <Button variant="primary" icon={UserPlus}>
          Add New User
        </Button>
      </div>

      <Card className="p-8 border-brand-dark/5">
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="flex-grow relative group">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-2xl pl-14 pr-8 py-4 text-sm focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 transition-all"
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-brand-dark/5 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 transition-all outline-none min-w-[160px]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="seller">Sellers</option>
              <option value="user">Customers</option>
              <option value="delivery_agent">Delivery Agents</option>
            </select>
            <Button variant="outline" icon={Filter}>
              More Filters
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-brand-dark/5">
                <th className="text-left px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 font-serif italic">User Info</th>
                <th className="text-left px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 font-serif italic">Role</th>
                <th className="text-left px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 font-serif italic">Status</th>
                <th className="text-left px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 font-serif italic">Joined Date</th>
                <th className="text-right px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 font-serif italic">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-brand-dark/40 font-mono uppercase tracking-widest">Loading_User_Database...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Users size={48} className="mx-auto text-brand-dark/10 mb-4" />
                    <p className="text-lg font-serif text-brand-dark/40">No users found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-brand-cream/10 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-bold shadow-lg shadow-brand-dark/10 group-hover:bg-brand-gold transition-all">
                          {user.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-dark">{user.fullName}</p>
                          <div className="flex items-center gap-2 text-[10px] text-brand-dark/40 mt-1">
                            <Mail size={12} />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs text-brand-dark/60">
                        <Calendar size={14} className="text-brand-dark/20" />
                        <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="p-3 text-brand-dark/40 hover:text-brand-gold hover:bg-brand-gold/10 rounded-xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(user)}
                          className="p-3 text-brand-dark/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="p-3 text-brand-dark/40 hover:text-brand-dark hover:bg-brand-dark/5 rounded-xl transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit User Modal */}
      {selectedUser && (
        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit User Profile"
          module="User"
          recordId={selectedUser.id}
          initialData={selectedUser}
          endpoint="/api/admin/users"
          onSuccess={(updated) => {
            setUsers(users.map(u => u.id === updated.id ? updated : u));
          }}
          fields={[
            { name: 'fullName', label: 'Full Name', type: 'text', required: true },
            { name: 'email', label: 'Email Address', type: 'email', required: true },
            { name: 'phone', label: 'Phone Number', type: 'text' },
            { 
              name: 'role', 
              label: 'User Role', 
              type: 'select', 
              options: [
                { label: 'Customer', value: 'user' },
                { label: 'Seller', value: 'seller' },
                { label: 'Administrator', value: 'admin' },
                { label: 'Delivery Agent', value: 'delivery_agent' }
              ] 
            },
            { 
              name: 'status', 
              label: 'Account Status', 
              type: 'select', 
              options: [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Pending Approval', value: 'pending' }
              ] 
            }
          ]}
        />
      )}

      {/* Password Reset Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-8 bg-rose-500 text-white">
                <ShieldAlert size={48} className="mb-4 opacity-50" />
                <h2 className="text-2xl font-serif">Reset Password</h2>
                <p className="text-white/60 text-xs mt-1">Enter a new secure password for {selectedUser?.fullName}.</p>
              </div>

              <form onSubmit={handleResetPassword} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-1">New Password</label>
                  <input 
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500/20 transition-all"
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    fullWidth
                    onClick={() => setIsResetModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="primary" 
                    className="bg-rose-500 hover:bg-rose-600 border-rose-500 shadow-rose-500/20"
                    fullWidth
                    loading={isResetting}
                  >
                    Confirm Reset
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 border-brand-dark/5 bg-brand-dark text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-brand-gold/20 transition-all" />
          <ShieldCheck className="text-brand-gold mb-6" size={32} />
          <h3 className="text-xl font-serif mb-2">Role Management</h3>
          <p className="text-white/40 text-xs leading-relaxed mb-6">Define custom roles and granular permissions for your team.</p>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" fullWidth>
            Manage Roles
          </Button>
        </Card>

        <Card className="p-8 border-brand-dark/5 bg-white group">
          <Shield className="text-brand-gold mb-6" size={32} />
          <h3 className="text-xl font-serif mb-2">Access Control</h3>
          <p className="text-brand-dark/40 text-xs leading-relaxed mb-6">Review security logs and manage platform access protocols.</p>
          <Button variant="outline" fullWidth>
            Security Logs
          </Button>
        </Card>

        <Card className="p-8 border-brand-dark/5 bg-white group">
          <UserPlus className="text-brand-gold mb-6" size={32} />
          <h3 className="text-xl font-serif mb-2">Seller Onboarding</h3>
          <p className="text-brand-dark/40 text-xs leading-relaxed mb-6">Review and approve pending seller applications.</p>
          <Button variant="outline" fullWidth>
            Pending Requests
          </Button>
        </Card>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the user "${userToDelete?.fullName}"? This action cannot be undone and will remove all associated profile data.`}
        confirmText="Delete User"
        variant="danger"
      />
    </div>
  );
};

export default UserManagement;
