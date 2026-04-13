import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../../context/CurrencyContext';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  CreditCard,
  Wallet,
  Truck,
  ChevronRight,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  createdAt: string;
  customer: string;
}

const Transactions: React.FC = () => {
  const { formatPrice, selectedCountry } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // Mock data for now
      const mockData: Transaction[] = [
        { id: 'TX-001', orderId: 'ORD-101', amount: 12500, currency: 'PKR', status: 'completed', gateway: 'Stripe', createdAt: '2026-03-25T10:30:00Z', customer: 'John Doe' },
        { id: 'TX-002', orderId: 'ORD-102', amount: 8400, currency: 'PKR', status: 'pending', gateway: 'COD', createdAt: '2026-03-25T14:45:00Z', customer: 'Jane Smith' },
        { id: 'TX-003', orderId: 'ORD-103', amount: 21000, currency: 'PKR', status: 'failed', gateway: 'PayPal', createdAt: '2026-03-24T09:15:00Z', customer: 'Mike Johnson' },
        { id: 'TX-004', orderId: 'ORD-104', amount: 15000, currency: 'PKR', status: 'completed', gateway: 'Stripe', createdAt: '2026-03-24T16:20:00Z', customer: 'Sarah Wilson' },
        { id: 'TX-005', orderId: 'ORD-105', amount: 5500, currency: 'PKR', status: 'refunded', gateway: 'Stripe', createdAt: '2026-03-23T11:00:00Z', customer: 'Alex Brown' },
      ];
      setTransactions(mockData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-amber-600 bg-amber-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'refunded': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'refunded': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.status === filter;
    const matchesSearch = tx.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tx.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tx.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Transactions</h1>
          <p className="text-gray-500 mt-1">Monitor and manage your sales and settlements.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12% vs last month</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{selectedCountry?.currency || 'PKR'} 125,400</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">98% Success Rate</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Completed Orders</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">45</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">5 Pending</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Pending Settlements</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{selectedCountry?.currency || 'PKR'} 18,200</h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Transaction ID, Order ID, or Customer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-0 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['all', 'completed', 'pending', 'failed', 'refunded'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === s ? 'bg-black text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gateway</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((tx) => (
                  <motion.tr 
                    key={tx.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{tx.id}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{tx.orderId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-gray-700">{tx.customer}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-900">{tx.currency} {tx.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status)}
                        {tx.status}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                          {tx.gateway === 'Stripe' ? <CreditCard className="w-3.5 h-3.5 text-gray-600" /> : 
                           tx.gateway === 'PayPal' ? <Wallet className="w-3.5 h-3.5 text-gray-600" /> : 
                           <Truck className="w-3.5 h-3.5 text-gray-600" />}
                        </div>
                        <span className="text-sm text-gray-600">{tx.gateway}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 text-gray-300 hover:text-black transition-all opacity-0 group-hover:opacity-100">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No transactions found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
