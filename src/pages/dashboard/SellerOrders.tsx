import React from 'react';
import { ShoppingBag, Eye, Download, Search, Filter } from 'lucide-react';
import Price from '../../components/common/Price';
import { motion } from 'motion/react';

const SellerOrders = () => {
  const orders = [
    { id: 'ORD-2026-001', date: '2026-03-20', customer: 'John Doe', total: 250.00, status: 'Processing' },
    { id: 'ORD-2026-002', date: '2026-03-19', customer: 'Jane Smith', total: 450.00, status: 'Shipped' },
    { id: 'ORD-2026-003', date: '2026-03-18', customer: 'Alice Brown', total: 120.00, status: 'Delivered' },
    { id: 'ORD-2026-004', date: '2026-03-17', customer: 'Bob Wilson', total: 300.00, status: 'Cancelled' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-serif mb-2">My Orders</h1>
            <p className="text-brand-dark/60 text-sm">Manage and track your product sales.</p>
          </div>
          <button className="bg-brand-dark text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center space-x-2">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-3xl border border-brand-dark/5 shadow-sm">
          <div className="relative flex-grow">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="Search by order ID or customer..." 
              className="w-full bg-brand-cream/50 border-none rounded-2xl pl-12 pr-6 py-3 text-sm focus:ring-2 focus:ring-brand-gold/20"
            />
          </div>
          <div className="flex gap-4">
            <select className="bg-brand-cream/50 border-none rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 focus:ring-brand-gold/20">
              <option>All Status</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
            <button className="p-3 bg-brand-cream/50 text-brand-dark rounded-2xl hover:bg-brand-gold hover:text-white transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/20">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Order ID</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Date</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Customer</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Total</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-brand-cream/10 transition-colors group">
                  <td className="px-8 py-6 font-bold text-sm">{order.id}</td>
                  <td className="px-8 py-6 text-sm text-brand-dark/60">{order.date}</td>
                  <td className="px-8 py-6 text-sm text-brand-dark/60">{order.customer}</td>
                  <td className="px-8 py-6">
                    <Price amount={order.total} className="text-sm font-bold" />
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600' : 
                      order.status === 'Processing' ? 'bg-amber-500/10 text-amber-600' : 
                      order.status === 'Shipped' ? 'bg-blue-500/10 text-blue-600' : 
                      'bg-brand-dark/10 text-brand-dark/40'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-brand-dark/40 hover:text-brand-gold transition-colors">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default SellerOrders;
