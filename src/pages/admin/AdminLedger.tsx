import React, { useState } from 'react';
import { BookOpen, Download, Search, Filter, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Wallet, Loader2 } from 'lucide-react';
import Price from '../../components/common/Price';
import { motion } from 'motion/react';
import Papa from 'papaparse';

const AdminLedger = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const ledgerEntries = [
    { id: 'LGR-001', date: '2026-03-20', seller: 'Luxe Attire', description: 'Order #ORD-2026-001 Commission', type: 'Credit', amount: 25.00, balance: 12500.00 },
    { id: 'LGR-002', date: '2026-03-19', seller: 'Urban Style', description: 'Platform Fee - Order #ORD-2026-001', type: 'Credit', amount: 45.00, balance: 12545.00 },
    { id: 'LGR-003', date: '2026-03-18', seller: 'System', description: 'Server Maintenance Payout', type: 'Debit', amount: 500.00, balance: 12045.00 },
    { id: 'LGR-004', date: '2026-03-17', seller: 'Heritage Weaves', description: 'Order #ORD-2026-002 Commission', type: 'Credit', amount: 30.00, balance: 12075.00 },
  ];

  const stats = [
    { label: 'Total Revenue', value: 125000.00, icon: Wallet, color: 'emerald', detail: 'Net platform intake' },
    { label: 'Platform Fees', value: 12500.00, icon: TrendingUp, color: 'brand-gold', detail: 'Total commissions earned' },
    { label: 'System Payouts', value: 5000.00, icon: TrendingDown, color: 'rose', detail: 'External operational costs' },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csv = Papa.unparse(ledgerEntries);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `system_ledger_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 1000);
  };

  const filteredEntries = ledgerEntries.filter(entry => 
    entry.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-serif mb-3 tracking-tight">System Ledger</h1>
          <p className="text-brand-dark/40 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-8 h-[1px] bg-brand-gold/40"></span>
            Comprehensive Financial Records
          </p>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="bg-brand-dark text-white px-10 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-gold hover:-translate-y-1 active:scale-95 transition-all flex items-center space-x-3 shadow-2xl shadow-brand-dark/20 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          <span>Export Ledger Logs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-10 rounded-[2.5rem] border border-brand-dark/5 shadow-xl shadow-brand-dark/[0.02] group hover:border-brand-gold/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/5 text-[8px] font-bold text-emerald-600 uppercase tracking-tighter border border-emerald-500/10">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                Live Status
              </span>
            </div>
            <div className="flex justify-between items-start mb-8">
              <div className={`p-5 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <stat.icon size={28} />
              </div>
            </div>
            <p className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-[0.2em] mb-3">{stat.label}</p>
            <Price amount={stat.value} className="text-4xl font-serif text-brand-dark mb-2" />
            <p className="text-[10px] text-brand-dark/30 font-medium italic">{stat.detail}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] border border-brand-dark/5 shadow-2xl shadow-brand-dark/[0.03] overflow-hidden">
        <div className="p-12 border-b border-brand-dark/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-brand-cream/10">
          <div>
            <h2 className="text-2xl font-serif mb-1">Transaction History</h2>
            <p className="text-[10px] text-brand-dark/40 font-bold uppercase tracking-[0.15em] flex items-center gap-2">
              <span className="w-4 h-[1px] bg-brand-gold"></span>
              Detailed transaction records
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group flex-grow lg:flex-none">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
              <input 
                type="text" 
                placeholder="Search by seller, amount or details..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-2 border-brand-dark/5 rounded-2xl pl-14 pr-8 py-4 text-xs font-medium focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/30 w-full sm:w-80 transition-all outline-none shadow-sm"
              />
            </div>
            <button className="px-6 py-4 bg-white text-brand-dark rounded-2xl hover:bg-brand-gold hover:text-white transition-all border-2 border-brand-dark/5 flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest shadow-sm">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/20">
                <th className="px-12 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 border-b border-brand-dark/[0.03]">Date</th>
                <th className="px-12 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 border-b border-brand-dark/[0.03]">Seller Name</th>
                <th className="px-12 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 border-b border-brand-dark/[0.03]">Description</th>
                <th className="px-12 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 border-b border-brand-dark/[0.03]">Type</th>
                <th className="px-12 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 border-b border-brand-dark/[0.03]">Amount</th>
                <th className="px-12 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 border-b border-brand-dark/[0.03]">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-brand-cream/[0.15] transition-colors group">
                  <td className="px-12 py-10 text-xs text-brand-dark/60 font-medium">{entry.date}</td>
                  <td className="px-12 py-10">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-dark/5 flex items-center justify-center text-xs font-bold text-brand-dark group-hover:bg-brand-gold group-hover:text-white transition-colors">
                        {(entry.seller || '?').charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-brand-dark/80">{entry.seller}</span>
                    </div>
                  </td>
                  <td className="px-12 py-10 text-xs font-bold text-brand-dark leading-relaxed max-w-xs">{entry.description}</td>
                  <td className="px-12 py-10">
                    <span className={`inline-flex items-center px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] ${
                      entry.type === 'Credit' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    }`}>
                      {entry.type === 'Credit' ? <ArrowUpRight size={14} className="mr-2" /> : <ArrowDownRight size={14} className="mr-2" />}
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-12 py-10">
                    <Price amount={entry.amount} className={`text-xs font-black ${entry.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`} />
                  </td>
                  <td className="px-12 py-10">
                    <Price amount={entry.balance} className="text-xs font-black text-brand-dark" />
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-12 py-20 text-center text-brand-dark/40 italic text-sm">
                    No transactions found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLedger;
