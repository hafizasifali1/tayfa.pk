import React from 'react';
import { CreditCard, Download, Search, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import Price from '../../components/common/Price';
import { motion } from 'motion/react';

const SellerPayments = () => {
  const payments = [
    { id: 'PAY-2026-001', date: '2026-03-20', amount: 250.00, method: 'Credit Card', status: 'Completed' },
    { id: 'PAY-2026-002', date: '2026-03-19', amount: 450.00, method: 'PayPal', status: 'Pending' },
    { id: 'PAY-2026-003', date: '2026-03-18', amount: 120.00, method: 'Bank Transfer', status: 'Completed' },
    { id: 'PAY-2026-004', date: '2026-03-17', amount: 300.00, method: 'Credit Card', status: 'Failed' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-serif mb-2">Payments</h1>
            <p className="text-brand-dark/60 text-sm">Track your earnings and payout history.</p>
          </div>
          <button className="bg-brand-dark text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center space-x-2">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-brand-dark/5 shadow-sm">
            <h3 className="text-brand-dark/40 text-[10px] font-bold uppercase tracking-widest mb-1">Available Balance</h3>
            <Price amount={12500.00} className="text-3xl font-serif text-brand-dark" />
            <button className="mt-4 w-full py-3 bg-brand-gold text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all">
              Request Payout
            </button>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-brand-dark/5 shadow-sm">
            <h3 className="text-brand-dark/40 text-[10px] font-bold uppercase tracking-widest mb-1">Pending Payouts</h3>
            <Price amount={2450.00} className="text-3xl font-serif text-brand-dark" />
            <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest mt-2 font-bold">Next payout: March 25</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-brand-dark/5 shadow-sm">
            <h3 className="text-brand-dark/40 text-[10px] font-bold uppercase tracking-widest mb-1">Total Earned</h3>
            <Price amount={45200.00} className="text-3xl font-serif text-brand-dark" />
            <p className="text-[10px] text-emerald-600 uppercase tracking-widest mt-2 font-bold">+12% from last month</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-brand-dark/5">
            <h2 className="text-xl font-serif">Transaction History</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/20">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Transaction ID</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Date</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Amount</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Method</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-brand-cream/10 transition-colors group">
                  <td className="px-8 py-6 font-bold text-sm">{payment.id}</td>
                  <td className="px-8 py-6 text-sm text-brand-dark/60">{payment.date}</td>
                  <td className="px-8 py-6">
                    <Price amount={payment.amount} className="text-sm font-bold" />
                  </td>
                  <td className="px-8 py-6 text-sm text-brand-dark/60">{payment.method}</td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      payment.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' : 
                      payment.status === 'Pending' ? 'bg-amber-500/10 text-amber-600' : 
                      'bg-rose-500/10 text-rose-600'
                    }`}>
                      {payment.status === 'Completed' ? <CheckCircle2 size={12} className="mr-1" /> : <AlertCircle size={12} className="mr-1" />}
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default SellerPayments;
