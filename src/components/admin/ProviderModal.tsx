import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, AlertCircle, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import axios from 'axios';

interface ProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  provider?: any;
}

const ProviderModal = ({ isOpen, onClose, onSuccess, provider }: ProviderModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'sms',
    config: {
      accountSid: '',
      authToken: '',
      phoneNumberId: '',
      accessToken: '',
      apiKey: '',
      apiSecret: ''
    },
    senderId: '',
    endpointUrl: '',
    priority: 1,
    isActive: true,
    isDefault: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (provider) {
      setFormData({
        ...provider,
        config: {
          ...formData.config,
          ...provider.config
        }
      });
    } else {
      setFormData({
        name: '',
        type: 'sms',
        config: {
          accountSid: '',
          authToken: '',
          phoneNumberId: '',
          accessToken: '',
          apiKey: '',
          apiSecret: ''
        },
        senderId: '',
        endpointUrl: '',
        priority: 1,
        isActive: true,
        isDefault: false
      });
    }
  }, [provider, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (provider) {
        await axios.patch(`/api/communication/providers/${provider.id}`, formData);
      } else {
        await axios.post('/api/communication/providers', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-brand-dark/5 flex justify-between items-center bg-brand-cream/30">
          <div>
            <h2 className="text-2xl font-serif">{provider ? 'Edit Provider' : 'Add Provider'}</h2>
            <p className="text-xs text-brand-dark/40 uppercase tracking-widest mt-1">Configure API credentials</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-dark/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 text-rose-600 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold">Provider Name</label>
              <select
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-brand-cream/50 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-gold/20"
                required
              >
                <option value="">Select Provider</option>
                <option value="twilio">Twilio</option>
                <option value="whatsapp_cloud_api">WhatsApp Cloud API</option>
                <option value="nexmo">Nexmo (Vonage)</option>
                <option value="infobip">Infobip</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold">Channel Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-brand-cream/50 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-gold/20"
                required
              >
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>

          <div className="p-6 bg-brand-cream/30 rounded-2xl border border-brand-dark/5 space-y-6">
            <div className="flex items-center gap-2 text-brand-gold mb-2">
              <Shield size={16} />
              <span className="text-[10px] uppercase tracking-widest font-bold">API Credentials</span>
            </div>

            {formData.name === 'twilio' && (
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-brand-dark/60 font-bold uppercase tracking-tighter">Account SID</label>
                  <input
                    type="text"
                    value={formData.config.accountSid}
                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, accountSid: e.target.value } })}
                    className="w-full bg-white border border-brand-dark/5 rounded-xl px-4 py-3 text-sm outline-none"
                    placeholder="AC..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-brand-dark/60 font-bold uppercase tracking-tighter">Auth Token</label>
                  <input
                    type="password"
                    value={formData.config.authToken}
                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, authToken: e.target.value } })}
                    className="w-full bg-white border border-brand-dark/5 rounded-xl px-4 py-3 text-sm outline-none"
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>
            )}

            {formData.name === 'whatsapp_cloud_api' && (
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-brand-dark/60 font-bold uppercase tracking-tighter">Phone Number ID</label>
                  <input
                    type="text"
                    value={formData.config.phoneNumberId}
                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, phoneNumberId: e.target.value } })}
                    className="w-full bg-white border border-brand-dark/5 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-brand-dark/60 font-bold uppercase tracking-tighter">Access Token</label>
                  <input
                    type="password"
                    value={formData.config.accessToken}
                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, accessToken: e.target.value } })}
                    className="w-full bg-white border border-brand-dark/5 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold">Sender ID / Phone</label>
              <input
                type="text"
                value={formData.senderId}
                onChange={(e) => setFormData({ ...formData, senderId: e.target.value })}
                className="w-full bg-brand-cream/50 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm outline-none"
                placeholder="+1234567890"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold">Priority (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full bg-brand-cream/50 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded-lg border-brand-dark/10 text-brand-gold focus:ring-brand-gold/20"
              />
              <span className="text-sm font-bold text-brand-dark">Active</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-5 h-5 rounded-lg border-brand-dark/10 text-brand-gold focus:ring-brand-gold/20"
              />
              <span className="text-sm font-bold text-brand-dark">Default Provider</span>
            </label>
          </div>
        </form>

        <div className="p-8 bg-brand-cream/30 border-t border-brand-dark/5 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={Save} onClick={handleSubmit} loading={loading}>
            {provider ? 'Update Provider' : 'Save Provider'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProviderModal;
