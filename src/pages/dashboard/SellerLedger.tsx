import React, { useState } from 'react';
import { BookOpen, Download, Search, Filter, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import Price from '../../components/common/Price';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { format } from 'date-fns';

const SellerLedger = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);

  useEffect(() => {
    const fetchLedger = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/ledgers?entityId=${user.id}&entityType=seller`);
        setLedgerEntries(response.data);
      } catch (error) {
        console.error('Failed to fetch ledger:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLedger();
  }, [user?.id]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csv = Papa.unparse(ledgerEntries);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `seller_ledger_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 1000);
  };

  const filteredEntries = (ledgerEntries || []).filter(entry => 
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2">Seller Ledger</h1>
          <p className="text-brand-dark/40 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-6 h-[1px] bg-brand-gold"></span>
            Financial movement history
          </p>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="bg-brand-dark text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-gold hover:-translate-y-1 active:scale-95 transition-all flex items-center space-x-3 shadow-xl shadow-brand-dark/10 disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          <span>Export Ledger</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-2xl shadow-brand-dark/[0.02] overflow-hidden">
        <div className="p-10 border-b border-brand-dark/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-brand-cream/10">
          <h2 className="text-xl font-serif">Ledger History</h2>
          <div className="flex space-x-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-none">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-brand-dark/5 rounded-xl pl-12 pr-6 py-3 text-xs font-medium focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/30 w-full sm:w-64 transition-all outline-none"
              />
            </div>
            <button className="p-3 bg-white text-brand-dark rounded-xl hover:bg-brand-gold hover:text-white transition-all border border-brand-dark/5 shadow-sm">
              <Filter size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/20">
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Date</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Description</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Type</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Amount</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <Loader2 size={32} className="animate-spin mx-auto text-brand-gold opacity-40 mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/20">Loading your financial history...</p>
                  </td>
                </tr>
              ) : filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-brand-cream/10 transition-colors group">
                    <td className="px-10 py-8 text-xs text-brand-dark/60 font-medium">
                      {entry.createdAt ? format(new Date(entry.createdAt), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-brand-dark">{entry.description}</span>
                        {entry.referenceId && (
                          <span className="text-[10px] text-brand-dark/40 font-mono mt-1">REF: {entry.referenceId}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        entry.transactionType.toLowerCase() === 'credit' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}>
                        {entry.transactionType.toLowerCase() === 'credit' ? <ArrowUpRight size={14} className="mr-2" /> : <ArrowDownRight size={14} className="mr-2" />}
                        {entry.transactionType}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <Price amount={entry.amount} className={`text-sm font-black ${entry.transactionType.toLowerCase() === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`} />
                    </td>
                    <td className="px-10 py-8">
                      <Price amount={entry.balance} className="text-sm font-black text-brand-dark" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <BookOpen size={40} className="mx-auto text-brand-dark/10 mb-4" />
                      <p className="text-brand-dark/40 italic text-sm">No ledger entries found. Your financial transactions will appear here once orders are processed.</p>
                    </div>
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

export default SellerLedger;
