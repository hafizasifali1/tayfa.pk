import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Search, Filter, X } from 'lucide-react';
import Price from '../../components/common/Price';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Invoice } from '../../types';
import { exportInvoicesToExcel, exportInvoiceToPDF } from '../../utils/fileExport';

const SellerInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/invoices?sellerId=${user?.id}`);
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchInvoices();
  }, [user?.id]);

  const handleDownloadAll = () => {
    exportInvoicesToExcel(invoices);
  };

  const handleDownloadPDF = (inv: Invoice) => {
    exportInvoiceToPDF(inv);
  };

  const handlePreview = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsPreviewOpen(true);
  };

  const filteredInvoices = (invoices || []).filter(inv => 
    (inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inv.id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inv.orderId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2 text-brand-dark">Invoices</h1>
            <p className="text-brand-dark/60">Manage and download your sales invoices.</p>
          </div>
          <button 
            onClick={handleDownloadAll}
            className="group flex items-center space-x-3 bg-brand-dark text-white px-8 py-4 rounded-full hover:bg-brand-gold transition-all shadow-lg shadow-brand-dark/10"
          >
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Download All (Excel)</span>
          </button>
        </div>

        <div className="bg-white rounded-[3rem] border border-brand-dark/5 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-brand-dark/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-serif text-brand-dark">Invoice History</h2>
            <div className="flex space-x-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" />
                <input 
                  type="text" 
                  placeholder="Search invoices..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-brand-cream/30 border-none rounded-2xl pl-12 pr-6 py-3.5 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
                />
              </div>
              <button className="p-3.5 bg-brand-cream/30 text-brand-dark rounded-2xl hover:bg-brand-gold hover:text-white transition-all">
                <Filter size={20} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-cream/10">
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Invoice ID</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Date</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Order ID</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Amount</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Status</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-6 h-16 bg-brand-cream/5" />
                    </tr>
                  ))
                ) : filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-brand-cream/5 transition-colors group">
                      <td className="px-8 py-6 font-bold text-sm text-brand-dark">{invoice.invoiceNumber || invoice.id}</td>
                      <td className="px-8 py-6 text-sm text-brand-dark/60">
                        {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-8 py-6 text-sm text-brand-dark/60">{invoice.orderId}</td>
                      <td className="px-8 py-6">
                        <Price amount={invoice.amount} className="text-sm font-bold text-brand-dark" />
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 
                          invoice.status === 'unpaid' ? 'bg-amber-50 text-amber-600' : 
                          'bg-rose-50 text-rose-600'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button 
                            onClick={() => handlePreview(invoice)}
                            className="p-2.5 text-brand-dark/40 hover:text-brand-gold hover:bg-brand-gold/5 rounded-xl transition-all"
                            title="Preview Invoice"
                          >
                            <Eye size={20} />
                          </button>
                          <button 
                            onClick={() => handleDownloadPDF(invoice)}
                            className="p-2.5 text-brand-dark/40 hover:text-brand-gold hover:bg-brand-gold/5 rounded-xl transition-all"
                            title="Download PDF"
                          >
                            <Download size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-brand-dark/40 italic">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Preview Modal */}
        <AnimatePresence>
          {isPreviewOpen && selectedInvoice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPreviewOpen(false)}
                className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
              >
                <div className="p-8 border-b border-brand-dark/5 flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-serif text-brand-dark">Invoice Detail</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40 mt-1">
                      #{selectedInvoice.invoiceNumber || selectedInvoice.id}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-3 hover:bg-brand-cream/50 rounded-full transition-colors"
                  >
                    <X size={24} className="text-brand-dark/40" />
                  </button>
                </div>

                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-3">Bill To</h4>
                      <p className="text-lg font-bold text-brand-dark">{selectedInvoice.customerName || 'N/A'}</p>
                      <p className="text-sm text-brand-dark/60">{selectedInvoice.customerEmail}</p>
                    </div>
                    <div className="text-right">
                      <h4 className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-3">Invoice Info</h4>
                      <p className="text-sm text-brand-dark/60">Date: <span className="text-brand-dark font-bold">{new Date(selectedInvoice.createdAt || '').toLocaleDateString()}</span></p>
                      <p className="text-sm text-brand-dark/60">Status: <span className="text-brand-dark font-bold uppercase tracking-widest">{selectedInvoice.status}</span></p>
                    </div>
                  </div>

                  <div className="border-y border-brand-dark/5 py-8 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-brand-dark/60 font-bold uppercase tracking-widest">Description</span>
                      <span className="text-sm text-brand-dark/60 font-bold uppercase tracking-widest">Amount</span>
                    </div>
                    <div className="flex justify-between items-center bg-brand-cream/10 p-4 rounded-2xl">
                      <div>
                        <p className="text-sm font-bold text-brand-dark">Order #{selectedInvoice.orderId}</p>
                        <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest mt-1">Fulfillment of products</p>
                      </div>
                      <Price amount={selectedInvoice.amount - selectedInvoice.taxAmount} className="text-sm font-bold text-brand-dark" />
                    </div>
                    <div className="flex justify-between items-center px-4">
                      <span className="text-sm text-brand-dark/60">Tax Amount</span>
                      <Price amount={selectedInvoice.taxAmount} className="text-sm font-bold text-brand-dark" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <h5 className="text-xl font-serif text-brand-dark">Total Amount</h5>
                    <Price amount={selectedInvoice.amount} className="text-2xl font-bold text-brand-gold" />
                  </div>
                </div>

                <div className="p-8 bg-brand-cream/20 flex justify-end space-x-4">
                  <button 
                    onClick={() => setIsPreviewOpen(false)}
                    className="px-8 py-3 text-brand-dark/60 text-xs font-bold uppercase tracking-widest hover:text-brand-dark transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => handleDownloadPDF(selectedInvoice)}
                    className="flex items-center space-x-2 bg-brand-dark text-white px-8 py-3 rounded-full hover:bg-brand-gold transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-dark/10"
                  >
                    <Download size={14} />
                    <span>Download PDF</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default SellerInvoices;
