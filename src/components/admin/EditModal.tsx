import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import axios from 'axios';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea' | 'email';
  options?: { label: string; value: string }[];
  required?: boolean;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  module: string;
  recordId: string;
  initialData: any;
  fields: Field[];
  onSuccess: (updatedRecord: any) => void;
  endpoint: string;
}

export const EditModal = ({
  isOpen,
  onClose,
  title,
  module,
  recordId,
  initialData,
  fields,
  onSuccess,
  endpoint
}: EditModalProps) => {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      const filteredData: any = {};
      fields.forEach(field => {
        filteredData[field.name] = initialData[field.name] || '';
      });
      setFormData(filteredData);
    }
  }, [initialData, fields]);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Only send changed fields
      const changedData: any = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== initialData[key]) {
          changedData[key] = formData[key];
        }
      });

      if (Object.keys(changedData).length === 0) {
        onClose();
        return;
      }

      const res = await axios.patch(`${endpoint}/${recordId}`, changedData);
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      console.error(`Error updating ${module}:`, err);
      setError(err.response?.data?.error || `Failed to update ${module}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-brand-dark/5"
          >
            <div className="p-8 border-b border-brand-dark/5 flex items-center justify-between bg-brand-cream/10">
              <div>
                <h2 className="text-2xl font-serif text-brand-dark">{title}</h2>
                <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest mt-1">
                  Editing {module} ID: {recordId}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-brand-cream rounded-full transition-colors text-brand-dark/40"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-3 text-rose-600 text-sm">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-1">
                      {field.label}
                      {field.required && <span className="text-rose-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'select' ? (
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className="w-full px-6 py-4 bg-brand-cream/30 border border-brand-dark/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all text-sm font-medium"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        rows={3}
                        className="w-full px-6 py-4 bg-brand-cream/30 border border-brand-dark/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all text-sm font-medium resize-none"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className="w-full px-6 py-4 bg-brand-cream/30 border border-brand-dark/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all text-sm font-medium"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-2xl py-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl py-6 bg-brand-dark hover:bg-brand-gold text-white shadow-xl shadow-brand-dark/10"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
