import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Users, ChevronRight, CheckCircle2, AlertCircle, Info, Save, RefreshCcw, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { rbacService } from '../../services/rbacService';
import { RoleConfig, Action, ModulePermission, Module } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

const MODULES = [
  { id: 'overview', label: 'Overview & Analytics' },
  { id: 'orders', label: 'Orders Management' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'payments', label: 'Payments' },
  { id: 'ledger', label: 'Financial Ledger' },
  { id: 'pricelist', label: 'Pricelists' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'coupons', label: 'Coupons' },
  { id: 'bulk_upload', label: 'Bulk Product Upload' },
  { id: 'products', label: 'Product Management' },
  { id: 'discounts', label: 'Discounts' },
  { id: 'rbac', label: 'Access Control (RBAC)' },
];

const ACTIONS: { id: Action; label: string }[] = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
];

const AccessControl = () => {
  const { roles, refreshRoles, user } = useAuth();
  const [activeRoleId, setActiveRoleId] = useState<string>('admin');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [localRoles, setLocalRoles] = useState<RoleConfig[]>([]);
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';

  const canEditActiveRole = () => {
    if (!activeRole) return false;
    // Super Admin can edit anything except themselves (safety)
    if (isSuperAdmin) return activeRole.id !== 'super_admin';
    // Admin can edit anything except Super Admin and Admin
    if (isAdmin) return activeRole.id !== 'super_admin' && activeRole.id !== 'admin';
    return false;
  };

  useEffect(() => {
    const rolesArray = Array.isArray(roles) ? roles : [];
    setLocalRoles(rolesArray);
    if (rolesArray.length > 0 && !rolesArray.find(r => r.id === activeRoleId)) {
      setActiveRoleId(rolesArray[0].id);
    }
  }, [roles]);

  const activeRole = localRoles.find(r => r.id === activeRoleId);

  const handleTogglePermission = (moduleId: string, actionId: Action) => {
    if (!canEditActiveRole()) return;

    const updatedRoles = localRoles.map(role => {
      if (role.id === activeRoleId) {
        const permissions = Array.isArray(role.permissions) ? [...role.permissions] : [];
        const moduleIndex = permissions.findIndex(p => p.module === moduleId);

        if (moduleIndex === -1) {
          permissions.push({ module: moduleId as Module, actions: [actionId] });
        } else {
          const modulePerm = { ...permissions[moduleIndex] };
          if (modulePerm.actions.includes(actionId)) {
            modulePerm.actions = modulePerm.actions.filter(a => a !== actionId);
          } else {
            modulePerm.actions = [...modulePerm.actions, actionId];
          }
          permissions[moduleIndex] = modulePerm;
        }

        return { ...role, permissions };
      }
      return role;
    });

    setLocalRoles(updatedRoles);
  };

  const handleSave = async () => {
    if (!activeRole) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await rbacService.updateRole(activeRole.id, activeRole, user?.id);
      await refreshRoles();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save permissions:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName) return;
    try {
      await rbacService.createRole({
        name: newRoleName,
        description: `Custom role: ${newRoleName}`,
        permissions: []
      });
      await refreshRoles();
      setNewRoleName('');
      setShowNewRoleModal(false);
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  const handleDeleteRole = async (id: string) => {
    // if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await rbacService.deleteRole(id);
        await refreshRoles();
      } catch (error) {
        console.error('Failed to delete role:', error);
      }
    // }
  };

  const hasAction = (moduleId: string, actionId: Action) => {
    const permissions = Array.isArray(activeRole?.permissions) ? activeRole.permissions : [];
    const perm = permissions.find(p => p.module === moduleId);
    return perm?.actions.includes(actionId) || false;
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif mb-4">Access Control</h1>
          <p className="text-brand-dark/60">Define and manage role-based access permissions across the platform.</p>
        </div>
        
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline"
                onClick={() => setShowNewRoleModal(true)}
                icon={<Plus size={20} />}
              >
                New Role
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving || !canEditActiveRole()}
                icon={isSaving ? <RefreshCcw size={20} className="animate-spin" /> : <Save size={20} />}
                className={saveStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {isSaving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Permissions'}
              </Button>
            </div>
            {saveStatus === 'success' && (
              <motion.span 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-[10px] font-bold text-green-600 uppercase tracking-widest"
              >
                Permissions updated successfully
              </motion.span>
            )}
            {saveStatus === 'error' && (
              <motion.span 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-[10px] font-bold text-rose-600 uppercase tracking-widest"
              >
                Failed to save. Check permissions.
              </motion.span>
            )}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Role Selection */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-brand-dark/40 mb-6">Select Role to Edit</h3>
          {localRoles.map((role) => (
            <div key={role.id} className="relative group">
              <Card
                hover
                variant={activeRoleId === role.id ? 'premium' : 'default'}
                className={`w-full text-left p-6 cursor-pointer transition-all border ${
                  activeRoleId === role.id 
                    ? 'border-brand-gold ring-4 ring-brand-gold/5' 
                    : 'bg-white/50 border-brand-dark/5'
                }`}
                onClick={() => setActiveRoleId(role.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant={
                      role.id === 'admin' ? 'danger' : 
                      role.id === 'seller' ? 'warning' : 
                      'default'
                    }
                  >
                    {role.id}
                  </Badge>
                  {activeRoleId === role.id && <ChevronRight size={16} className="text-brand-gold" />}
                </div>
                <h4 className="font-serif text-xl mb-1">{role.name}</h4>
                <p className="text-xs text-brand-dark/40 leading-relaxed">{role.description}</p>
              </Card>
              {!role.isSystem && (
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }}
                  className="absolute top-4 right-4 p-2 text-brand-dark/20 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  icon={<Trash2 size={14} />}
                />
              )}
            </div>
          ))}
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-3 space-y-8">
          <Card className="overflow-hidden border-brand-dark/5 shadow-sm">
            <div className="p-8 border-b border-brand-dark/5 bg-brand-cream/20">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-brand-dark text-white rounded-2xl">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif">Permissions for {activeRole?.name}</h3>
                  <p className="text-xs text-brand-dark/40 uppercase tracking-widest font-bold">Manage what this role can see and do</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {!canEditActiveRole() ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                    <Lock size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif">{activeRole?.name} Permissions Locked</h4>
                    <p className="text-sm text-brand-dark/40 max-w-md mx-auto mt-2">
                      {activeRoleId === 'super_admin' 
                        ? 'The Super Administrator role is the highest authority and its permissions are fixed for system integrity.'
                        : activeRoleId === 'admin'
                          ? 'Only a Super Administrator can modify the Administrator role permissions.'
                          : 'You do not have sufficient privileges to modify this role.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 gap-8">
                    {MODULES.map((module) => (
                      <div key={module.id} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-brand-dark/5 pb-2">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-brand-dark">
                            {module.label}
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {ACTIONS.map((action) => {
                            const active = hasAction(module.id, action.id);
                            return (
                              <button
                                key={action.id}
                                onClick={() => handleTogglePermission(module.id, action.id)}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                  active
                                    ? 'bg-brand-cream/20 border-brand-gold/20 text-brand-dark'
                                    : 'bg-white border-brand-dark/5 text-brand-dark/40'
                                }`}
                              >
                                <span className="text-xs font-bold uppercase tracking-widest">{action.label}</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${
                                  active ? 'bg-brand-gold' : 'bg-brand-dark/10'
                                }`}>
                                  <motion.div 
                                    animate={{ x: active ? 20 : 0 }}
                                    className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" 
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Removed redundant footer button */}
          </Card>
        </div>
      </div>

      {/* New Role Modal */}
      <Modal
        isOpen={showNewRoleModal}
        onClose={() => setShowNewRoleModal(false)}
        title="Create New Role"
      >
        <div className="space-y-6">
          <p className="text-brand-dark/60 text-sm">Define a new role and configure its permissions later.</p>
          
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-2 block">Role Name</label>
            <input 
              type="text" 
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. Content Manager"
              className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all"
            />
          </div>
          
          <div className="flex flex-col space-y-3 pt-4">
            <Button 
              onClick={handleCreateRole}
              fullWidth
            >
              Create Role
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setShowNewRoleModal(false)}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccessControl;
