import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  CreditCard,
  Wallet,
  Truck,
  ChevronRight,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Edit2
} from 'lucide-react';
import Price from '../../components/common/Price';
import axios from 'axios';
import { EditModal } from '../../components/admin/EditModal';

interface Transaction {
  id: string;
  orderId: string;
  amount: string;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  customer?: string;
  seller?: string;
}

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/admin/payments');
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'failed': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'refunded': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.status === filter;
    const matchesSearch = tx.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tx.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2 tracking-tight">Global Payments</h1>
          <p className="text-brand-dark/40 text-xs font-mono uppercase tracking-[0.2em]">Transaction_Monitoring_v2.0</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-3 px-6 py-3.5 bg-white border border-brand-dark/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-cream transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Export_Data
          </button>
          <button className="flex items-center gap-3 px-6 py-3.5 bg-brand-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl shadow-brand-dark/10">
            <Calendar className="w-4 h-4" />
            SYSTEM_LOGS
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-brand-dark/5 shadow-sm group hover:border-brand-gold/20 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">+12%_GROWTH</span>
            </div>
          </div>
          <p className="text-brand-dark/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total_Volume</p>
          <h3 className="text-3xl font-serif text-brand-dark">PKR {transactions.reduce((acc, tx) => acc + Number(tx.amount), 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-brand-dark/5 shadow-sm group hover:border-brand-gold/20 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">98%_SUCCESS</span>
            </div>
          </div>
          <p className="text-brand-dark/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Active_Transactions</p>
          <h3 className="text-3xl font-serif text-brand-dark">{transactions.length}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-brand-dark/5 shadow-sm group hover:border-brand-gold/20 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-brand-gold/10 text-brand-gold rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-brand-gold bg-brand-gold/5 px-3 py-1 rounded-full uppercase tracking-widest">54_ACTIVE_SELLERS</span>
            </div>
          </div>
          <p className="text-brand-dark/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Platform_Nodes</p>
          <h3 className="text-3xl font-serif text-brand-dark">842_USERS</h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2rem] border border-brand-dark/5 shadow-sm flex flex-col lg:flex-row gap-6 justify-between items-center bg-brand-cream/10">
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
          <input 
            type="text" 
            placeholder="SEARCH_BY_TX_ORDER_OR_NODE..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 transition-all text-[10px] font-mono uppercase tracking-widest"
          />
        </div>
        <div className="flex items-center gap-3 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
          {['all', 'completed', 'pending', 'failed', 'refunded'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-5 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                filter === s 
                  ? 'bg-brand-dark text-white border-brand-dark shadow-lg' 
                  : 'bg-white text-brand-dark/40 border-brand-dark/5 hover:border-brand-gold/20 hover:text-brand-dark'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-cream/20">
                  <th className="px-10 py-6 text-[9px] font-bold text-brand-dark/30 uppercase tracking-[0.2em]">Transaction_Ref</th>
                  <th className="px-10 py-6 text-[9px] font-bold text-brand-dark/30 uppercase tracking-[0.2em]">Order_Ref</th>
                  <th className="px-10 py-6 text-[9px] font-bold text-brand-dark/30 uppercase tracking-[0.2em]">Amount</th>
                  <th className="px-10 py-6 text-[9px] font-bold text-brand-dark/30 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-10 py-6 text-[9px] font-bold text-brand-dark/30 uppercase tracking-[0.2em]">Method</th>
                  <th className="px-10 py-6 text-[9px] font-bold text-brand-dark/30 uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5">
                <AnimatePresence mode="popLayout">
                  {filteredTransactions.map((tx) => (
                    <motion.tr 
                      key={tx.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-brand-cream/10 transition-colors group"
                    >
                      <td className="px-10 py-8">
                        <p className="font-mono text-[11px] font-bold text-brand-dark">{tx.id.substring(0, 8)}...</p>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-[11px] font-bold text-brand-dark/80">{tx.orderId.substring(0, 8)}...</p>
                      </td>
                      <td className="px-10 py-8">
                        <Price amount={Number(tx.amount)} className="text-[11px] font-bold text-brand-dark" />
                      </td>
                      <td className="px-10 py-8">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(tx.status)}`}>
                          <div className={`w-1 h-1 rounded-full ${
                            tx.status === 'completed' ? 'bg-emerald-500' : 
                            tx.status === 'pending' ? 'bg-amber-500' : 
                            'bg-rose-500'
                          }`} />
                          {tx.status}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-cream/50 rounded-xl border border-brand-dark/5">
                            {tx.paymentMethod === 'card' ? <CreditCard className="w-3.5 h-3.5 text-brand-dark/60" /> : 
                             tx.paymentMethod === 'wallet' ? <Wallet className="w-3.5 h-3.5 text-brand-dark/60" /> : 
                             <Truck className="w-3.5 h-3.5 text-brand-dark/60" />}
                          </div>
                          <span className="text-[10px] font-bold text-brand-dark/60 uppercase tracking-widest">{tx.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-[10px] text-brand-dark/40 font-mono uppercase">
                          {new Date(tx.createdAt).toLocaleDateString()}
                          <br />
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button 
                            onClick={() => {
                              setSelectedPayment(tx);
                              setIsEditModalOpen(true);
                            }}
                            className="p-3 bg-brand-cream/30 text-brand-dark/20 hover:text-brand-gold hover:bg-brand-cream transition-all rounded-xl border border-transparent hover:border-brand-gold/20"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-3 bg-brand-cream/30 text-brand-dark/20 hover:text-brand-gold hover:bg-brand-cream transition-all rounded-xl border border-transparent hover:border-brand-gold/20">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedPayment && (
        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Payment"
          module="Transaction"
          recordId={selectedPayment.id}
          initialData={selectedPayment}
          endpoint="/api/admin/transactions"
          onSuccess={() => fetchTransactions()}
          fields={[
            {
              name: 'status',
              label: 'Payment Status',
              type: 'select',
              options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Completed', value: 'completed' },
                { label: 'Failed', value: 'failed' },
                { label: 'Refunded', value: 'refunded' }
              ],
              required: true
            },
            {
              name: 'paymentMethod',
              label: 'Payment Method',
              type: 'select',
              options: [
                { label: 'Card', value: 'card' },
                { label: 'Wallet', value: 'wallet' },
                { label: 'COD', value: 'cod' }
              ],
              required: true
            }
          ]}
        />
      )}
    </div>
  );
};

export default AdminTransactions;
