import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Shield, 
  Globe, 
  CreditCard, 
  Wallet, 
  Truck,
  ChevronRight,
  Save,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';

interface Gateway {
  id: string;
  name: string;
  code: string;
  type: string;
  status: boolean;
  isDefault: boolean;
}

interface GatewayConfig {
  id: string;
  key: string;
  value: string;
  environment: string;
}

const PaymentSettings: React.FC = () => {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);
  const [configs, setConfigs] = useState<GatewayConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGatewayData, setNewGatewayData] = useState({
    name: '',
    code: '',
    type: 'card',
    status: true,
    isDefault: false
  });

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const response = await fetch('/api/payments/admin/gateways');
      const data = await response.json();
      const gatewaysList = Array.isArray(data) ? data : [];
      setGateways(gatewaysList);
      if (gatewaysList.length > 0 && !selectedGateway) {
        setSelectedGateway(gatewaysList[0]);
        fetchConfigs(gatewaysList[0].id);
      }
    } catch (error) {
      console.error('Error fetching gateways:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfigs = async (gatewayId: string) => {
    try {
      const response = await fetch(`/api/payments/admin/gateways/${gatewayId}/config`);
      const data = await response.json();
      setConfigs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching configs:', error);
    }
  };

  const handleToggleStatus = async (gateway: Gateway) => {
    try {
      const response = await fetch(`/api/payments/admin/gateways/${gateway.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: !gateway.status })
      });
      if (response.ok) {
        setGateways(gateways.map(g => g.id === gateway.id ? { ...g, status: !g.status } : g));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDeleteGateway = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this gateway and all its configurations?')) return;
    try {
      const response = await fetch(`/api/payments/admin/gateways/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setGateways(gateways.filter(g => g.id !== id));
        if (selectedGateway?.id === id) {
          setSelectedGateway(null);
          setConfigs([]);
        }
      }
    } catch (error) {
      console.error('Error deleting gateway:', error);
    }
  };

  const handleCreateGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch('/api/payments/admin/gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGatewayData)
      });
      if (response.ok) {
        await fetchGateways();
        setShowAddModal(false);
        setNewGatewayData({ name: '', code: '', type: 'card', status: true, isDefault: false });
      }
    } catch (error) {
      console.error('Error creating gateway:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGateway) return;
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      key: formData.get('key'),
      value: formData.get('value'),
      environment: formData.get('environment')
    };

    try {
      const response = await fetch(`/api/payments/admin/gateways/${selectedGateway.id}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        fetchConfigs(selectedGateway.id);
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error('Error adding config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="w-5 h-5" />;
      case 'wallet': return <Wallet className="w-5 h-5" />;
      case 'cod': return <Truck className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payment Gateways</h1>
          <p className="text-gray-500 mt-1">Configure and manage your marketplace payment methods.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add Gateway
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gateway List */}
        <div className="lg:col-span-4 space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            ))
          ) : (
            gateways.map((gateway) => (
              <motion.div
                key={gateway.id}
                layoutId={gateway.id}
                onClick={() => {
                  setSelectedGateway(gateway);
                  fetchConfigs(gateway.id);
                }}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedGateway?.id === gateway.id 
                    ? 'border-black bg-white shadow-md' 
                    : 'border-transparent bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${selectedGateway?.id === gateway.id ? 'bg-black text-white' : 'bg-white text-gray-600 shadow-sm'}`}>
                      {getIcon(gateway.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{gateway.name}</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{gateway.code}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(gateway);
                    }}
                    className={`p-2 rounded-full transition-colors ${gateway.status ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}
                  >
                    {gateway.status ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedGateway ? (
              <motion.div
                key={selectedGateway.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
              >
                <div className="flex justify-between items-center mb-8 pb-6 border-bottom border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      {getIcon(selectedGateway.type)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedGateway.name} Configuration</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${selectedGateway.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {selectedGateway.status ? 'Active' : 'Disabled'}
                        </span>
                        {selectedGateway.isDefault && (
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDeleteGateway(selectedGateway.id)}
                      className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* API Credentials */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <h3 className="font-semibold text-gray-900">API Credentials</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {configs.map((config) => (
                        <div key={config.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{config.key}</p>
                            <p className="font-mono text-sm mt-1">{config.value}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white px-2 py-1 rounded border border-gray-100">
                              {config.environment}
                            </span>
                            <button className="p-2 text-gray-400 hover:text-black transition-colors">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddConfig} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Key Name</label>
                        <input name="key" required placeholder="e.g. SECRET_KEY" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Value</label>
                        <input name="value" required placeholder="Enter value" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all" />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Env</label>
                          <select name="environment" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all">
                            <option value="sandbox">Sandbox</option>
                            <option value="live">Live</option>
                          </select>
                        </div>
                        <button disabled={isSaving} type="submit" className="p-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50">
                          {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        </button>
                      </div>
                    </form>
                  </section>

                  {/* Visibility Rules */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <h3 className="font-semibold text-gray-900">Visibility Rules</h3>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Globe className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Region-based Visibility</p>
                            <p className="text-xs text-gray-500">Only show this gateway in specific countries.</p>
                          </div>
                        </div>
                        <button className="text-xs font-bold text-black hover:underline">Manage Regions</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white rounded-full text-xs font-medium border border-gray-200 shadow-sm">Pakistan (PK)</span>
                        <span className="px-3 py-1 bg-white rounded-full text-xs font-medium border border-gray-200 shadow-sm">Saudi Arabia (KSA)</span>
                        <button className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-400 hover:bg-gray-200 transition-all">+ Add</button>
                      </div>
                    </div>
                  </section>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                  <AlertCircle className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">No Gateway Selected</h2>
                <p className="text-gray-500 mt-2 max-w-xs">Select a payment gateway from the list to view and manage its configuration.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Add Gateway Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add Payment Gateway</h2>
                  <p className="text-sm text-gray-500">Enable a new payment provider.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateGateway} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Gateway Name</label>
                    <input 
                      required
                      value={newGatewayData.name}
                      onChange={(e) => setNewGatewayData({ ...newGatewayData, name: e.target.value })}
                      placeholder="e.g. Stripe" 
                      className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:border-black outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Gateway Code</label>
                    <input 
                      required
                      value={newGatewayData.code}
                      onChange={(e) => setNewGatewayData({ ...newGatewayData, code: e.target.value.toLowerCase() })}
                      placeholder="e.g. stripe" 
                      className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:border-black outline-none transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Type</label>
                    <select 
                      value={newGatewayData.type}
                      onChange={(e) => setNewGatewayData({ ...newGatewayData, type: e.target.value })}
                      className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:border-black outline-none transition-all"
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="wallet">Digital Wallet</option>
                      <option value="cod">Cash on Delivery</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-6 pt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={newGatewayData.status}
                        onChange={(e) => setNewGatewayData({ ...newGatewayData, status: e.target.checked })}
                        className="w-5 h-5 rounded-lg border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm font-semibold">Active</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={newGatewayData.isDefault}
                        onChange={(e) => setNewGatewayData({ ...newGatewayData, isDefault: e.target.checked })}
                        className="w-5 h-5 rounded-lg border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm font-semibold">Default</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all">
                    Cancel
                  </button>
                  <button disabled={isSaving} type="submit" className="flex-1 px-6 py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2">
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Gateway
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentSettings;
