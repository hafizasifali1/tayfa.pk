import React from 'react';
import { BookOpen, Download, Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Price from '../../components/common/Price';
import { motion } from 'motion/react';

const SellerLedger = () => {
  const ledgerEntries = [
    { id: 'LGR-001', date: '2026-03-20', description: 'Order #ORD-2026-001 Payment', type: 'Credit', amount: 250.00, balance: 12500.00 },
    { id: 'LGR-002', date: '2026-03-19', description: 'Platform Fee - Order #ORD-2026-001', type: 'Debit', amount: 25.00, balance: 12250.00 },
    { id: 'LGR-003', date: '2026-03-18', description: 'Payout to Bank Account', type: 'Debit', amount: 5000.00, balance: 7250.00 },
    { id: 'LGR-004', date: '2026-03-17', description: 'Order #ORD-2026-002 Payment', type: 'Credit', amount: 450.00, balance: 7700.00 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-serif mb-2">Seller Ledger</h1>
            <p className="text-brand-dark/60 text-sm">Detailed record of all financial movements in your account.</p>
          </div>
          <button className="bg-brand-dark text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center space-x-2">
            <Download size={16} />
            <span>Export Ledger</span>
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-brand-dark/5 flex justify-between items-center">
            <h2 className="text-xl font-serif">Ledger Entries</h2>
            <div className="flex space-x-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/40" />
                <input 
                  type="text" 
                  placeholder="Search ledger..." 
                  className="bg-brand-cream/50 border-none rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>
              <button className="p-2 bg-brand-cream/50 text-brand-dark rounded-xl hover:bg-brand-gold hover:text-white transition-all">
                <Filter size={18} />
              </button>
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/20">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Date</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Description</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Type</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Amount</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {ledgerEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-brand-cream/10 transition-colors group">
                  <td className="px-8 py-6 text-sm text-brand-dark/60">{entry.date}</td>
                  <td className="px-8 py-6 text-sm font-bold">{entry.description}</td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      entry.type === 'Credit' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      {entry.type === 'Credit' ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <Price amount={entry.amount} className={`text-sm font-bold ${entry.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`} />
                  </td>
                  <td className="px-8 py-6">
                    <Price amount={entry.balance} className="text-sm font-bold" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default SellerLedger;
