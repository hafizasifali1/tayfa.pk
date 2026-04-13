import React from 'react';
import { BookOpen, Download, Search, Filter, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import Price from '../../components/common/Price';
import { motion } from 'motion/react';

const AdminLedger = () => {
  const ledgerEntries = [
    { id: 'LGR-001', date: '2026-03-20', seller: 'Luxe Attire', description: 'Order #ORD-2026-001 Commission', type: 'Credit', amount: 25.00, balance: 12500.00 },
    { id: 'LGR-002', date: '2026-03-19', seller: 'Urban Style', description: 'Platform Fee - Order #ORD-2026-001', type: 'Credit', amount: 45.00, balance: 12545.00 },
    { id: 'LGR-003', date: '2026-03-18', seller: 'System', description: 'Server Maintenance Payout', type: 'Debit', amount: 500.00, balance: 12045.00 },
    { id: 'LGR-004', date: '2026-03-17', seller: 'Heritage Weaves', description: 'Order #ORD-2026-002 Commission', type: 'Credit', amount: 30.00, balance: 12075.00 },
  ];

  const stats = [
    { label: 'Total Revenue', value: 125000.00, icon: Wallet, color: 'emerald' },
    { label: 'Platform Fees', value: 12500.00, icon: TrendingUp, color: 'brand-gold' },
    { label: 'System Payouts', value: 5000.00, icon: TrendingDown, color: 'rose' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif mb-2 tracking-tight">System Ledger</h1>
          <p className="text-brand-dark/40 text-xs font-mono uppercase tracking-[0.2em]">Financial_Audit_Trail_v1.0</p>
        </div>
        <button className="bg-brand-dark text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-gold transition-all flex items-center space-x-3 shadow-xl shadow-brand-dark/10">
          <Download size={16} />
          <span>Export_Audit_Log</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[2rem] border border-brand-dark/5 shadow-sm group hover:border-brand-gold/20 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[9px] font-mono text-brand-dark/20 uppercase tracking-widest">REAL_TIME_DATA</span>
            </div>
            <p className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <Price amount={stat.value} className="text-3xl font-serif text-brand-dark" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-brand-dark/5 flex justify-between items-center bg-brand-cream/10">
          <div>
            <h2 className="text-xl font-serif">Transaction History</h2>
            <p className="text-[10px] text-brand-dark/30 uppercase tracking-widest mt-1">Detailed_Financial_Audit</p>
          </div>
          <div className="flex space-x-4">
            <div className="relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
              <input 
                type="text" 
                placeholder="SEARCH_ENTRIES..." 
                className="bg-brand-cream/30 border-brand-dark/5 rounded-xl pl-12 pr-6 py-3 text-[10px] font-mono focus:ring-2 focus:ring-brand-gold/10 w-64 transition-all"
              />
            </div>
            <button className="p-3 bg-brand-cream/50 text-brand-dark rounded-xl hover:bg-brand-gold hover:text-white transition-all border border-brand-dark/5">
              <Filter size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/20">
                <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Date</th>
                <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Seller_Node</th>
                <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Description</th>
                <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Type</th>
                <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Amount</th>
                <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {ledgerEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-brand-cream/10 transition-colors group">
                  <td className="px-10 py-8 text-[11px] text-brand-dark/60 font-medium">{entry.date}</td>
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-brand-dark/5 flex items-center justify-center text-[10px] font-bold text-brand-dark">
                        {(entry.seller || '?').charAt(0)}
                      </div>
                      <span className="text-[11px] font-bold text-brand-dark/80">{entry.seller}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-[11px] font-bold text-brand-dark">{entry.description}</td>
                  <td className="px-10 py-8">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      entry.type === 'Credit' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    }`}>
                      {entry.type === 'Credit' ? <ArrowUpRight size={12} className="mr-2" /> : <ArrowDownRight size={12} className="mr-2" />}
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <Price amount={entry.amount} className={`text-[11px] font-bold ${entry.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`} />
                  </td>
                  <td className="px-10 py-8">
                    <Price amount={entry.balance} className="text-[11px] font-bold text-brand-dark" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLedger;
