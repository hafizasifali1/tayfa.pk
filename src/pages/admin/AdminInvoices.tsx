import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Search, Filter, Edit2, X } from 'lucide-react';
import Price from '../../components/common/Price';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { EditModal } from '../../components/admin/EditModal';
import { exportInvoicesToExcel, exportInvoiceToPDF } from '../../utils/fileExport';
import { Invoice } from '../../types';

import { useNavigate } from 'react-router-dom';

const AdminInvoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceDetail, setInvoiceDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/invoices');
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAll = () => {
    exportInvoicesToExcel(invoices);
  };

  const handleDownloadPDF = async (inv: Invoice) => {
    try {
      const res = await axios.get(`/api/invoices/${inv.id}`);
      exportInvoiceToPDF(res.data);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handlePreview = async (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsPreviewOpen(true);
    setInvoiceDetail(null); // Reset from last session
    try {
      setLoadingDetail(true);
      const res = await axios.get(`/api/invoices/${inv.id}`);
      setInvoiceDetail(res.data);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    (inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inv.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inv.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="page-heading mb-2">Global Invoices</h1>
          <p className="text-brand-dark/40 text-xs font-mono uppercase tracking-[0.2em]">System_Financial_Records_v2.0</p>
        </div>
        <button 
          onClick={handleExportAll}
          className="bg-brand-dark text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-gold transition-all flex items-center space-x-3 shadow-xl shadow-brand-dark/10"
        >
          <Download size={16} />
          <span>Export_All_Data</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-brand-dark/5 flex justify-between items-center bg-brand-cream/10">
          <div>
            <h2 className="text-xl font-serif">Invoice Registry</h2>
            <p className="text-[10px] text-brand-dark/30 uppercase tracking-widest mt-1">Monitoring_All_Transactions</p>
          </div>
          <div className="flex space-x-4">
            <div className="relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
              <input 
                type="text" 
                placeholder="SEARCH_BY_ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-brand-cream/30 border-brand-dark/5 rounded-xl pl-12 pr-6 py-3 text-[10px] font-mono focus:ring-2 focus:ring-brand-gold/10 w-64 transition-all"
              />
            </div>
            <button className="p-3 bg-brand-cream/50 text-brand-dark rounded-xl hover:bg-brand-gold hover:text-white transition-all border border-brand-dark/5">
              <Filter size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-cream/20">
                  <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Invoice_ID</th>
                  <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Date</th>
                  <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Order_Ref</th>
                  <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Amount</th>
                  <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Status</th>
                  <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5">
                {filteredInvoices.map((invoice) => (
                  <tr 
                    key={invoice.id} 
                    className="hover:bg-brand-cream/10 transition-colors group cursor-pointer"
                    onClick={() => navigate(`${invoice.id}`)}
                  >
                    <td className="px-10 py-8">
                      <span className="font-mono text-[11px] font-bold text-brand-dark">{invoice.invoiceNumber || invoice.id.substring(0, 8)}</span>
                    </td>
                    <td className="px-10 py-8 text-[11px] text-brand-dark/60 font-medium">
                      {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-10 py-8 text-[11px] text-brand-dark/40 font-mono">{invoice.orderId.substring(0, 8)}...</td>
                    <td className="px-10 py-8">
                      <Price amount={invoice.amount} className="text-[11px] font-bold text-brand-dark" />
                    </td>
                    <td className="px-10 py-8">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                        invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 
                        invoice.status === 'unpaid' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 
                        'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}>
                        <div className={`w-1 h-1 rounded-full mr-2 ${
                          invoice.status === 'paid' ? 'bg-emerald-500' : 
                          invoice.status === 'unpaid' ? 'bg-amber-500' : 
                          'bg-rose-500'
                        }`} />
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(invoice);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2.5 bg-brand-cream/30 text-brand-dark/40 hover:text-brand-gold hover:bg-brand-cream transition-all rounded-xl border border-transparent hover:border-brand-gold/20"
                          title="Edit Invoice"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`${invoice.id}`);
                          }}
                          className="p-2.5 bg-brand-cream/30 text-brand-dark/40 hover:text-brand-gold hover:bg-brand-cream transition-all rounded-xl border border-transparent hover:border-brand-gold/20"
                          title="Preview"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPDF(invoice);
                          }}
                          className="p-2.5 bg-brand-cream/30 text-brand-dark/40 hover:text-brand-gold hover:bg-brand-cream transition-all rounded-xl border border-transparent hover:border-brand-gold/20"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Shared Preview Modal Logic */}
      <AnimatePresence>
        {isPreviewOpen && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPreviewOpen(false)} className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-none">
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

              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                {loadingDetail ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto"></div>
                    <p className="text-xs text-brand-dark/40 mt-4">Loading invoice details...</p>
                  </div>
                ) : invoiceDetail ? (
                  <>
                    {/* Seller & Invoice Info */}
                    <div className="grid grid-cols-2 gap-8 border-b border-brand-dark/5 pb-6">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-2">Seller Info</h4>
                        <p className="text-md font-bold text-brand-dark">{invoiceDetail.sellerCompany?.name || 'Tayfa Store'}</p>
                        <p className="text-xs text-brand-dark/60">{invoiceDetail.sellerCompany?.email}</p>
                        <p className="text-xs text-brand-dark/60">{invoiceDetail.sellerCompany?.phone}</p>
                        <p className="text-xs text-brand-dark/60">{invoiceDetail.sellerCompany?.address}</p>
                      </div>
                      <div className="text-right">
                        <h4 className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-2">Invoice Info</h4>
                        <p className="text-sm text-brand-dark/60">Invoice #: <span className="font-bold text-brand-dark">{invoiceDetail.invoice.invoiceNumber}</span></p>
                        <p className="text-sm text-brand-dark/60">Date: <span className="font-bold text-brand-dark">{new Date(invoiceDetail.invoice.createdAt).toLocaleDateString()}</span></p>
                        <p className="text-sm text-brand-dark/60">Due Date: <span className="font-bold text-brand-dark">{new Date(invoiceDetail.invoice.dueDate).toLocaleDateString()}</span></p>
                        <p className="text-sm text-brand-dark/60">Status: <span className="uppercase font-bold text-brand-gold">{invoiceDetail.invoice.status}</span></p>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-2">Bill To</h4>
                        <p className="text-md font-bold text-brand-dark">{invoiceDetail.customer?.fullName || 'N/A'}</p>
                        <p className="text-xs text-brand-dark/60">{invoiceDetail.customer?.email}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-2">Shipping Address</h4>
                        {invoiceDetail.order?.shippingAddress ? (
                          <>
                            <p className="text-xs text-brand-dark font-bold">{invoiceDetail.order.shippingAddress.firstName} {invoiceDetail.order.shippingAddress.lastName}</p>
                            <p className="text-xs text-brand-dark/60">{invoiceDetail.order.shippingAddress.addressLine1}</p>
                            <p className="text-xs text-brand-dark/60">{invoiceDetail.order.shippingAddress.city}, {invoiceDetail.order.shippingAddress.country}</p>
                            <p className="text-xs text-brand-dark/60">Phone: {invoiceDetail.order.shippingAddress.phone}</p>
                          </>
                        ) : (
                          <p className="text-xs text-brand-dark/40 italic">No address details</p>
                        )}
                      </div>
                    </div>

                    {/* Products Table */}
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-3">Itemized Charges</h4>
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-brand-cream/10 border-b border-brand-dark/5">
                            <th className="py-3 font-bold text-brand-dark/60">Product</th>
                            <th className="py-3 font-bold text-brand-dark/60 text-center">Qty</th>
                            <th className="py-3 font-bold text-brand-dark/60 text-right">Unit Price</th>
                            <th className="py-3 font-bold text-brand-dark/60 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-dark/5">
                          {invoiceDetail.items?.map((item: any) => (
                            <tr key={item.id}>
                              <td className="py-4 font-medium text-brand-dark">{item.productName} {item.sku ? `(${item.sku})` : ''}</td>
                              <td className="py-4 text-center text-brand-dark/60">{item.quantity}</td>
                              <td className="py-4 text-right text-brand-dark/60">PKR {parseFloat(item.unitPrice).toFixed(2)}</td>
                              <td className="py-4 text-right font-bold text-brand-dark">PKR {parseFloat(item.totalAmount).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pricing Summary & Payment Info */}
                    <div className="grid grid-cols-2 gap-8 border-t border-brand-dark/5 pt-6">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-2">Payment Information</h4>
                        <p className="text-xs text-brand-dark/60">Method: <span className="font-bold text-brand-dark uppercase">{invoiceDetail.order?.paymentMethod || 'COD'}</span></p>
                        <p className="text-xs text-brand-dark/60">Payment Status: <span className="font-bold text-brand-dark uppercase">{invoiceDetail.order?.paymentStatus || 'Pending'}</span></p>
                      </div>
                      <div className="space-y-2 text-right">
                        <div className="flex justify-between text-xs text-brand-dark/60">
                          <span>Subtotal</span>
                          <span>PKR {(parseFloat(invoiceDetail.invoice.amount) - parseFloat(invoiceDetail.invoice.taxAmount)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-brand-dark/60">
                          <span>Tax</span>
                          <span>PKR {parseFloat(invoiceDetail.invoice.taxAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-md font-bold text-brand-dark pt-2 border-t border-brand-dark/5">
                          <span>Total Amount</span>
                          <span className="text-brand-gold">PKR {parseFloat(invoiceDetail.invoice.amount).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 text-brand-dark/40 italic">
                    Failed to load details.
                  </div>
                )}
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
                  className="flex items-center space-x-2 bg-brand-dark text-white px-8 py-3 rounded-xl hover:bg-brand-gold transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-dark/10"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedInvoice && (
        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Invoice"
          module="Invoice"
          recordId={selectedInvoice.id}
          initialData={selectedInvoice}
          endpoint="/api/invoices"
          onSuccess={() => fetchInvoices()}
          fields={[
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { label: 'Unpaid', value: 'unpaid' },
                { label: 'Paid', value: 'paid' },
                { label: 'Cancelled', value: 'cancelled' },
                { label: 'Overdue', value: 'overdue' }
              ],
              required: true
            },
            {
              name: 'dueDate',
              label: 'Due Date',
              type: 'date'
            },
            {
              name: 'amount',
              label: 'Amount',
              type: 'number'
            }
          ]}
        />
      )}
    </div>
  );
};

export default AdminInvoices;
