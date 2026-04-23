import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, RefreshCcw, Download, Trash2, AlertCircle, CheckCircle2, Info, XCircle, MoreVertical, FileDown, Loader2 } from 'lucide-react';
import { auditService } from '../../services/auditService';
import { AuditLog } from '../../types';
import Papa from 'papaparse';

const SystemLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsRefreshing(true);
    // Simulate a brief delay for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 800));
    const fetchedLogs = auditService.getLogs();
    setLogs(Array.isArray(fetchedLogs) ? fetchedLogs : []);
    setIsRefreshing(false);
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const dataToExport = filteredLogs.map(log => ({
        Type: log.type.toUpperCase(),
        User: log.userName,
        Role: log.userRole,
        Action: log.action,
        Details: log.details,
        Timestamp: new Date(log.timestamp).toLocaleString(),
        IP: log.ip || 'N/A'
      }));

      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  const filteredLogs = Array.isArray(logs) ? logs.filter(log => {
    const matchesSearch = 
      (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesType;
  }) : [];

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-500/10';
      case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-500/10';
      case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-500/10';
      case 'error': return 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm shadow-rose-500/10';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getDotColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-500';
      case 'success': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-brand-dark/10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-7xl font-serif text-brand-dark tracking-tight mb-4">System Protocol</h1>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-[1px] bg-brand-gold/40" />
            <p className="text-[11px] text-brand-dark/60 uppercase tracking-[0.4em] font-bold">Platform Intelligence & Security Monitoring</p>
          </div>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleExport}
            disabled={isExporting || logs.length === 0}
            className="flex items-center space-x-3 bg-white border-2 border-brand-dark/10 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-brand-dark/30 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin text-brand-dark" /> : <FileDown size={16} className="text-brand-dark group-hover:scale-110 transition-transform" />}
            <span className="text-brand-dark">Export Logs</span>
          </button>
          <button 
            onClick={loadLogs}
            disabled={isRefreshing}
            className="flex items-center space-x-3 bg-brand-dark text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-brand-gold hover:shadow-2xl hover:shadow-brand-gold/20 transition-all active:scale-95 disabled:opacity-80"
          >
            {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />}
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 border-2 border-brand-dark/10 bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-brand-dark/5">
        <div className="lg:border-r border-brand-dark/10 p-8 flex items-center space-x-5 bg-brand-cream/10 group">
          <Search size={20} className="text-brand-dark/40 group-focus-within:text-brand-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Search activity, users, or events..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none p-0 text-[12px] font-medium tracking-wide focus:ring-0 placeholder:text-brand-dark/30 placeholder:font-normal"
          />
        </div>
        <div className="lg:border-r border-brand-dark/10 p-8 flex items-center space-x-5 group">
          <Filter size={20} className="text-brand-dark/40 group-hover:text-brand-gold transition-colors" />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full bg-transparent border-none p-0 text-[12px] font-bold uppercase tracking-[0.1em] focus:ring-0 cursor-pointer text-brand-dark appearance-none"
          >
            <option value="all">ALL EVENTS</option>
            <option value="info">INFO ONLY</option>
            <option value="success">SUCCESS EVENTS</option>
            <option value="warning">WARNING LOGS</option>
            <option value="error">CRITICAL ERRORS</option>
          </select>
        </div>
        <div className="lg:col-span-2 p-8 flex items-center justify-between bg-brand-cream/5">
          <div className="flex items-center space-x-10">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-brand-dark/40 uppercase tracking-[0.2em] mb-1.5">View Status</span>
              <span className={`text-[12px] font-bold uppercase tracking-widest ${filterType !== 'all' ? 'text-brand-gold' : 'text-brand-dark/30'}`}>
                {filterType === 'all' ? 'SHOWING_ALL' : `${filterType.toUpperCase()}_FILTER`}
              </span>
            </div>
            <div className="w-[1px] h-10 bg-brand-dark/10" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-brand-dark/40 uppercase tracking-[0.2em] mb-1.5">Sync Activity</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-brand-gold animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-[12px] font-mono text-brand-dark font-bold">{filteredLogs.length} Records</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => {setSearchTerm(''); setFilterType('all');}}
            className="flex items-center space-x-2 px-5 py-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-bold text-[10px] uppercase tracking-widest group"
          >
            <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Logs Interface */}
      <div className="bg-white rounded-[3rem] border-2 border-brand-dark/10 shadow-2xl shadow-brand-dark/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-dark/5 border-b-2 border-brand-dark/10">
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-brand-dark font-serif italic">Type</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-brand-dark font-serif italic">Origin_Source</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-brand-dark font-serif italic">Action_Event</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-brand-dark font-serif italic">Timestamp</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-brand-dark font-serif italic">Network</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-brand-dark font-serif italic text-center">Opt</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-brand-dark/5">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredLogs.map((log, index) => (
                  <motion.tr 
                    key={log.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-brand-cream/5 transition-all group cursor-default"
                  >
                    <td className="px-10 py-8">
                      <div className={`inline-flex items-center space-x-2.5 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border-2 ${getTypeStyles(log.type)}`}>
                        <div className={`w-2 h-2 rounded-full ${getDotColor(log.type)}`} />
                        <span>{log.type}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-brand-dark/5 flex items-center justify-center text-brand-dark font-serif text-lg font-bold">
                          {log.userName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-black text-brand-dark tracking-wide">{log.userName}</span>
                          <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">{log.userRole}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col max-w-md">
                        <span className="text-[13px] text-brand-dark font-bold leading-tight mb-1.5 underline decoration-brand-gold/30 underline-offset-4">{log.action}</span>
                        <span className="text-[11px] text-brand-dark/60 italic font-medium">{log.details}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="text-[12px] text-brand-dark font-mono font-bold tracking-tight">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-brand-dark/40 font-mono font-medium">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[11px] text-brand-dark/50 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border-2 border-brand-dark/5 font-bold">
                        {log.ip || '0.0.0.0'}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <button className="p-3 text-brand-dark/20 hover:text-brand-dark hover:bg-white hover:shadow-xl rounded-2xl transition-all active:scale-90">
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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-40 text-center bg-brand-cream/5"
          >
            <div className="inline-flex p-10 rounded-full bg-white border-2 border-brand-dark/10 mb-8 shadow-2xl shadow-brand-dark/5">
              <Search size={48} className="text-brand-dark/10" />
            </div>
            <h3 className="text-2xl font-serif text-brand-dark mb-2">No Records Found</h3>
            <p className="text-[11px] text-brand-dark/40 uppercase tracking-[0.4em] font-black">Adjust your filters or synchronization buffer</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;
