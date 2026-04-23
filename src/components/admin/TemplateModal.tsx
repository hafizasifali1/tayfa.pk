import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, AlertCircle, Layout, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import axios from 'axios';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  template?: any;
}

const TemplateModal = ({ isOpen, onClose, onSuccess, template }: TemplateModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'sms',
    content: '',
    language: 'en',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (template) {
      setFormData(template);
    } else {
      setFormData({
        name: '',
        type: 'sms',
        content: '',
        language: 'en',
        isActive: true
      });
    }
  }, [template, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        content: formData.content,
        language: formData.language,
        isActive: formData.isActive
      };

      if (template) {
        await axios.patch(`/api/communication/templates/${template.id}`, payload);
      } else {
        await axios.post('/api/communication/templates', payload);
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
            <h2 className="text-2xl font-serif">{template ? 'Edit Template' : 'New Template'}</h2>
            <p className="text-xs text-brand-dark/40 uppercase tracking-widest mt-1">Configure message content</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-dark/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 text-rose-600 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-brand-cream/50 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-gold/20"
                placeholder="order_confirmation"
                required
              />
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

          <div className="space-y-2">
            <div className="flex justify-between items-end mb-2">
              <label className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold">Message Content</label>
              <div className="flex items-center gap-1 text-[10px] text-brand-gold font-bold uppercase tracking-widest">
                <RefreshCw size={10} />
                Dynamic Variables
              </div>
            </div>
            <textarea
              rows={5}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-brand-cream/50 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-gold/20 resize-none"
              placeholder="Hello {name}, your order #{order_id} has been confirmed!"
              required
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {['{name}', '{order_id}', '{amount}', '{status}', '{tracking_number}'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFormData({ ...formData, content: formData.content + v })}
                  className="px-2 py-1 bg-brand-cream border border-brand-dark/5 rounded-lg text-[10px] font-bold text-brand-dark/60 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-brand-cream/50 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-gold/20"
              >
                <option value="en">English</option>
                <option value="ur">Urdu</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-brand-dark/10 text-brand-gold focus:ring-brand-gold/20"
                />
                <span className="text-sm font-bold text-brand-dark">Active Template</span>
              </label>
            </div>
          </div>
        </form>

        <div className="p-8 bg-brand-cream/30 border-t border-brand-dark/5 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={Save} onClick={handleSubmit} loading={loading}>
            {template ? 'Update Template' : 'Save Template'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default TemplateModal;
