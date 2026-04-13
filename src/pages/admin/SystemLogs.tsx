import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, RefreshCcw, Download, Trash2, AlertCircle, CheckCircle2, Info, XCircle, MoreVertical } from 'lucide-react';
import { auditService } from '../../services/auditService';
import { AuditLog } from '../../types';

const SystemLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const fetchedLogs = auditService.getLogs();
    setLogs(Array.isArray(fetchedLogs) ? fetchedLogs : []);
  };

  const filteredLogs = Array.isArray(logs) ? logs.filter(log => {
    const matchesSearch = 
      (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-brand-dark/5">
        <div>
          <h1 className="text-6xl font-serif text-brand-dark tracking-tight mb-4">System Protocol</h1>
          <p className="text-[10px] text-brand-dark/40 uppercase tracking-[0.3em] font-bold">Real-time platform activity and security event monitoring</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-3 bg-white border border-brand-dark/10 px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-cream transition-all shadow-sm group">
            <Download size={16} className="text-brand-dark/20 group-hover:text-brand-dark" />
            <span>Export Logs</span>
          </button>
          <button 
            onClick={loadLogs}
            className="flex items-center space-x-3 bg-brand-dark text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl shadow-brand-dark/10"
          >
            <RefreshCcw size={16} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Filters & Search - Recipe 1: Visible Grid Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 border border-brand-dark/5 bg-white rounded-[2rem] overflow-hidden shadow-sm">
        <div className="lg:border-r border-brand-dark/5 p-6 flex items-center space-x-4 bg-brand-cream/5">
          <Search size={16} className="text-brand-dark/20" />
          <input 
            type="text" 
            placeholder="SEARCH_LOGS..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none p-0 text-[10px] font-mono uppercase tracking-widest focus:ring-0 placeholder:text-brand-dark/20"
          />
        </div>
        <div className="lg:border-r border-brand-dark/5 p-6 flex items-center space-x-4">
          <Filter size={16} className="text-brand-dark/20" />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full bg-transparent border-none p-0 text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer"
          >
            <option value="all">ALL_EVENTS</option>
            <option value="info">INFO_STATUS</option>
            <option value="success">SUCCESS_STATUS</option>
            <option value="warning">WARNING_STATUS</option>
            <option value="error">ERROR_STATUS</option>
          </select>
        </div>
        <div className="lg:col-span-2 p-6 flex items-center justify-between bg-brand-cream/5">
          <div className="flex items-center space-x-6">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-brand-dark/20 uppercase tracking-widest mb-1">Active Filters</span>
              <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest">{filterType === 'all' ? 'NONE' : filterType}</span>
            </div>
            <div className="w-px h-8 bg-brand-dark/5" />
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-brand-dark/20 uppercase tracking-widest mb-1">Results</span>
              <span className="text-[10px] font-mono text-brand-dark uppercase tracking-widest">{filteredLogs.length}</span>
            </div>
          </div>
          <button 
            onClick={() => {setSearchTerm(''); setFilterType('all');}}
            className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
            title="Clear All"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Logs Table - Recipe 1: Visible Grid Borders */}
      <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/5 border-b border-brand-dark/5">
                <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 font-serif italic">Protocol_Type</th>
                <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 font-serif italic">Origin_User</th>
                <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 font-serif italic">Action_Event</th>
                <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 font-serif italic">Timestamp</th>
                <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 font-serif italic">Network_IP</th>
                <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 font-serif italic">Control</th>
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
                    className="hover:bg-brand-cream/10 transition-all group cursor-default"
                  >
                    <td className="px-10 py-6">
                      <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                        log.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                        log.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                        log.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                        'bg-blue-50 border-blue-100 text-blue-600'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          log.type === 'error' ? 'bg-rose-500' :
                          log.type === 'warning' ? 'bg-amber-500' :
                          log.type === 'success' ? 'bg-emerald-500' :
                          'bg-blue-500'
                        }`} />
                        <span>{log.type}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">{log.userName}</span>
                        <span className="text-[9px] text-brand-dark/30 font-mono uppercase tracking-tighter">{log.userRole}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col max-w-md">
                        <span className="text-[11px] text-brand-dark font-medium leading-relaxed">{log.action}</span>
                        <span className="text-[10px] text-brand-dark/40 truncate font-mono mt-1">{log.details}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-[10px] text-brand-dark/40 font-mono tracking-tighter">
                        {new Date(log.timestamp).toISOString().replace('T', ' ').split('.')[0]}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-[10px] text-brand-dark/30 font-mono bg-brand-cream/30 px-2 py-1 rounded-lg border border-brand-dark/5">
                        {log.ip || '0.0.0.0'}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <button className="p-3 text-brand-dark/20 hover:text-brand-dark hover:bg-white hover:shadow-md rounded-xl transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="py-32 text-center bg-brand-cream/5">
            <div className="inline-flex p-6 rounded-full bg-white border border-brand-dark/5 mb-6">
              <Search size={32} className="text-brand-dark/10" />
            </div>
            <p className="text-[10px] text-brand-dark/40 uppercase tracking-[0.2em] font-bold">No protocol matches found in current buffer</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;
