import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, RefreshCcw, Download, Info, CheckCircle2, AlertCircle, XCircle, MoreVertical } from 'lucide-react';
import { auditService } from '../../services/auditService';
import { AuditLog } from '../../types';
import { useAuth } from '../../context/AuthContext';

const SellerLogs = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user]);

  const loadLogs = () => {
    if (user) {
      const fetchedLogs = auditService.getSellerLogs(user.id);
      if (Array.isArray(fetchedLogs)) {
        setLogs(fetchedLogs);
      } else {
        console.error('Fetched logs is not an array:', fetchedLogs);
        setLogs([]);
      }
    }
  };

  const filteredLogs = Array.isArray(logs) ? logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesType;
  }) : [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info size={16} className="text-blue-500" />;
      case 'success': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'warning': return <AlertCircle size={16} className="text-amber-500" />;
      case 'error': return <XCircle size={16} className="text-rose-500" />;
      default: return <Info size={16} className="text-brand-dark/40" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-500/10 text-blue-600';
      case 'success': return 'bg-emerald-500/10 text-emerald-600';
      case 'warning': return 'bg-amber-500/10 text-amber-600';
      case 'error': return 'bg-rose-500/10 text-rose-600';
      default: return 'bg-brand-dark/5 text-brand-dark/40';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif mb-4">Activity Logs</h1>
          <p className="text-brand-dark/60">Track your store activities, product updates, and management events.</p>
        </div>
        
        <div className="flex space-x-4">
          <button className="flex items-center space-x-3 bg-white border border-brand-dark/10 px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-brand-cream transition-all shadow-sm">
            <Download size={20} />
            <span>Export My Logs</span>
          </button>
          <button 
            onClick={loadLogs}
            className="flex items-center space-x-3 bg-brand-dark text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg"
          >
            <RefreshCcw size={20} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-3xl border border-brand-dark/5 shadow-sm">
        <div className="relative flex-grow">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" />
          <input 
            type="text" 
            placeholder="Search your activities..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-cream/50 border-none rounded-2xl pl-12 pr-6 py-3 text-sm focus:ring-2 focus:ring-brand-gold/20"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-brand-cream/50 border-none rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 focus:ring-brand-gold/20"
          >
            <option value="all">All Types</option>
            <option value="info">Information</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <button className="p-3 bg-brand-cream/50 text-brand-dark rounded-2xl hover:bg-brand-gold hover:text-white transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/50">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Type</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Action</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Details</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Time</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              <AnimatePresence mode="popLayout">
                {filteredLogs.map((log) => (
                  <motion.tr 
                    key={log.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-brand-cream/20 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getTypeStyles(log.type)}`}>
                        {getTypeIcon(log.type)}
                        <span>{log.type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-sm">{log.action}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm text-brand-dark/60">{log.details}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs text-brand-dark/40 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <button className="p-2 text-brand-dark/40 hover:text-brand-dark transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-brand-dark/40 italic">No activity logs found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerLogs;
