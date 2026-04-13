import React from 'react';
import { FileText, Download, Eye, Search, Filter } from 'lucide-react';
import Price from '../../components/common/Price';
import { motion } from 'motion/react';

const SellerInvoices = () => {
  const invoices = [
    { id: 'INV-2026-001', date: '2026-03-20', orderId: 'ORD-2026-001', amount: 250.00, status: 'Paid' },
    { id: 'INV-2026-002', date: '2026-03-19', orderId: 'ORD-2026-002', amount: 450.00, status: 'Pending' },
    { id: 'INV-2026-003', date: '2026-03-18', orderId: 'ORD-2026-003', amount: 120.00, status: 'Paid' },
    { id: 'INV-2026-004', date: '2026-03-17', orderId: 'ORD-2026-004', amount: 300.00, status: 'Overdue' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-serif mb-2">Invoices</h1>
            <p className="text-brand-dark/60 text-sm">Manage and download your sales invoices.</p>
          </div>
          <button className="bg-brand-dark text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center space-x-2">
            <Download size={16} />
            <span>Download All</span>
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-brand-dark/5 flex justify-between items-center">
            <h2 className="text-xl font-serif">Invoice History</h2>
            <div className="flex space-x-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/40" />
                <input 
                  type="text" 
                  placeholder="Invoice ID..." 
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
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Invoice ID</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Date</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Order ID</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Amount</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-brand-cream/10 transition-colors group">
                  <td className="px-8 py-6 font-bold text-sm">{invoice.id}</td>
                  <td className="px-8 py-6 text-sm text-brand-dark/60">{invoice.date}</td>
                  <td className="px-8 py-6 text-sm text-brand-dark/60">{invoice.orderId}</td>
                  <td className="px-8 py-6">
                    <Price amount={invoice.amount} className="text-sm font-bold" />
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      invoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 
                      invoice.status === 'Pending' ? 'bg-amber-500/10 text-amber-600' : 
                      'bg-rose-500/10 text-rose-600'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-brand-dark/40 hover:text-brand-gold transition-colors">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-brand-dark/40 hover:text-brand-gold transition-colors">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default SellerInvoices;
