import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Settings2, 
  Palette, 
  ListOrdered, 
  CheckCircle2, 
  XCircle,
  Type,
  MousePointer2,
  ListFilter,
  RefreshCcw,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { Attribute } from '../../types/attribute';
import { AttributeFormModal } from '../../components/admin/AttributeFormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { PermissionGate } from '../../components/auth/PermissionGate';

const AttributesManager: React.FC = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/attributes');
      if (res.data.success) {
        setAttributes(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching attributes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/attributes/${deleteId}`);
      setAttributes(prev => prev.filter(a => a.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const filteredAttributes = attributes.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDisplayIcon = (type: string) => {
    switch (type) {
      case 'color_swatch': return <Palette size={16} className="text-brand-gold" />;
      case 'dropdown': return <ListFilter size={16} className="text-blue-500" />;
      case 'radio': return <MousePointer2 size={16} className="text-purple-500" />;
      default: return <Type size={16} className="text-brand-dark/40" />;
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-brand-dark tracking-tight">Attribute Management</h1>
          <p className="text-brand-dark/40 mt-2 font-medium">Define product specifications shown on product detail pages.</p>
        </div>
        <PermissionGate permission="attributes.create">
          <button
            onClick={() => { setSelectedAttribute(null); setIsModalOpen(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-brand-dark text-white rounded-[1.5rem] text-xs font-bold uppercase tracking-widest hover:bg-brand-gold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-dark/10"
          >
            <Plus size={18} />
            Add New Attribute
          </button>
        </PermissionGate>
      </div>

      {/* Stats/Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Attributes', value: attributes.length, icon: Settings2, color: 'brand-gold' },
          { label: 'Active Specs', value: attributes.filter(a => a.isActive).length, icon: CheckCircle2, color: 'green-500' },
          { label: 'Required Fields', value: attributes.filter(a => a.isRequired).length, icon: AlertTriangle, color: 'rose-500' },
          { label: 'Display Order Set', value: attributes.filter(a => a.displayOrder > 0).length, icon: ListOrdered, color: 'blue-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-brand-dark/5 flex items-center gap-4 shadow-sm">
            <div className={`p-4 bg-${stat.color}/10 text-${stat.color} rounded-2xl`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">{stat.label}</p>
              <p className="text-2xl font-serif font-bold text-brand-dark">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-brand-dark/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-cream/10">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" size={18} />
            <input
              type="text"
              placeholder="Search attributes by name or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-white border border-brand-dark/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={fetchAttributes}
            className="p-3.5 bg-white border border-brand-dark/10 text-brand-dark/40 hover:text-brand-gold rounded-2xl transition-all shadow-sm group"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/5">
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 border-b border-brand-dark/5">Display Type</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 border-b border-brand-dark/5">Attribute Details</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 border-b border-brand-dark/5">Assigned Values</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 border-b border-brand-dark/5">Rules</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 border-b border-brand-dark/5">Status</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 border-b border-brand-dark/5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              <AnimatePresence initial={false}>
                {filteredAttributes.map((attr) => (
                  <motion.tr 
                    key={attr.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-brand-cream/5 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="w-12 h-12 rounded-2xl bg-brand-cream/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {getDisplayIcon(attr.displayType)}
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-brand-dark">{attr.name}</p>
                      <p className="text-[10px] font-mono text-brand-dark/40 mt-1 uppercase tracking-tighter">slug: {attr.slug}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                        {attr.values.slice(0, 5).map((v) => (
                          <span key={v.id} className="px-2 py-1 bg-brand-cream/30 text-brand-dark/60 rounded-lg text-[9px] font-bold uppercase tracking-tighter">
                            {v.value}
                          </span>
                        ))}
                        {attr.values.length > 5 && (
                          <span className="px-2 py-1 bg-brand-dark/5 text-brand-dark/40 rounded-lg text-[9px] font-bold uppercase tracking-tighter">
                            +{attr.values.length - 5} more
                          </span>
                        )}
                        {attr.values.length === 0 && (
                          <span className="text-[10px] italic text-brand-dark/20 font-medium">No values</span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-2">
                        {attr.isRequired && (
                          <span className="w-fit px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-rose-100">
                            Required
                          </span>
                        )}
                        {attr.showOnProductPage && (
                          <span className="w-fit px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-blue-100">
                            Public
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${attr.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-brand-dark/20'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${attr.isActive ? 'text-green-600' : 'text-brand-dark/30'}`}>
                          {attr.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <PermissionGate permission="attributes.edit">
                          <button
                            onClick={() => { setSelectedAttribute(attr); setIsModalOpen(true); }}
                            className="p-2.5 bg-brand-cream text-brand-dark/60 hover:text-brand-dark hover:bg-brand-cream-dark rounded-xl transition-all"
                            title="Edit Attribute"
                          >
                            <Edit2 size={16} />
                          </button>
                        </PermissionGate>
                        <PermissionGate permission="attributes.delete">
                          <button
                            onClick={() => setDeleteId(attr.id)}
                            className="p-2.5 bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-all"
                            title="Delete Attribute"
                          >
                            <Trash2 size={16} />
                          </button>
                        </PermissionGate>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {filteredAttributes.length === 0 && !loading && (
          <div className="p-20 text-center">
            <Settings2 className="mx-auto mb-4 text-brand-dark/5" size={64} />
            <h3 className="text-xl font-serif font-bold text-brand-dark/20">No attributes found</h3>
            <p className="text-brand-dark/20 text-sm mt-1">Try adjusting your search or add a new attribute.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AttributeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        attribute={selectedAttribute}
        onSuccess={fetchAttributes}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Attribute?"
        message="This will permanently delete the attribute and all its values. This cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AttributesManager;
