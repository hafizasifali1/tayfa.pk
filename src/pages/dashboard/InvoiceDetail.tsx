import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import axios from 'axios';
import Price from '../../components/common/Price';
import { exportInvoiceToPDF } from '../../utils/fileExport';

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/invoices/${id}`);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (data) {
      exportInvoiceToPDF(data);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        <p className="text-sm text-brand-dark/40 font-mono">LOADING_SECURE_TRANSACTION_RECORDS...</p>
      </div>
    );
  }

  if (!data || !data.invoice) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-brand-dark/60 italic">Invoice not found or failed to load.</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-brand-dark hover:text-brand-gold transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  const { invoice, items, order, customer, sellerCompany } = data;
  const subtotal = parseFloat(invoice.amount) - parseFloat(invoice.taxAmount);

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto print:p-0 print:max-w-full">
      {/* Top action bar - Hidden during print */}
      <div className="flex items-center justify-between border-b border-brand-dark/5 pb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center space-x-2 text-brand-dark hover:text-brand-gold transition-all"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Registry</span>
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 border border-brand-dark/10 bg-white text-brand-dark px-6 py-3 rounded-full hover:bg-brand-cream/10 hover:border-brand-dark/20 transition-all text-xs font-bold uppercase tracking-widest shadow-sm"
          >
            <Printer size={14} />
            <span>Print Invoice</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-brand-dark text-white px-6 py-3 rounded-full hover:bg-brand-gold transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-dark/10"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Invoice Card Container */}
      <div className="bg-white rounded-[3rem] border border-brand-dark/5 p-12 space-y-12 shadow-sm print:border-none print:shadow-none print:p-0">
        
        {/* 1. Brand Logo Header & Meta Info */}
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-brand-gold">TAYFA</h1>
            <div className="mt-4 space-y-1 text-sm text-brand-dark/60">
              <p className="font-bold text-brand-dark">{sellerCompany?.name || 'Tayfa Store'}</p>
              <p>{sellerCompany?.address || 'Pakistan'}</p>
              <p>Phone: {sellerCompany?.phone || 'N/A'}</p>
              <p>Email: {sellerCompany?.email || 'N/A'}</p>
              {sellerCompany?.taxId && <p>Tax ID: {sellerCompany.taxId}</p>}
            </div>
          </div>
          
          <div className="md:text-right space-y-2">
            <h2 className="text-2xl font-serif text-brand-dark">INVOICE</h2>
            <div className="text-sm text-brand-dark/60 space-y-1">
              <p>Invoice #: <span className="font-bold text-brand-dark">{invoice.invoiceNumber}</span></p>
              <p>Date Issued: <span className="font-bold text-brand-dark">{new Date(invoice.createdAt).toLocaleDateString()}</span></p>
              <p>Due Date: <span className="font-bold text-brand-dark">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
              <p>Order Reference: <span className="font-bold text-brand-dark font-mono text-xs">{order?.orderNumber || order?.id}</span></p>
              <div className="pt-3">
                <div className="flex flex-wrap md:justify-end items-center gap-1.5">
                  {['draft', 'pending', 'paid', 'refunded', 'cancelled'].map((state, index, arr) => {
                    const isActive = invoice.status.toLowerCase() === state;
                    return (
                      <React.Fragment key={state}>
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${
                          isActive 
                            ? 'bg-brand-gold text-white shadow-sm scale-105' 
                            : 'text-brand-dark/30 bg-brand-cream/10 border border-brand-dark/5'
                        }`}>
                          {state}
                        </span>
                        {index < arr.length - 1 && (
                          <span className="text-brand-dark/20 text-xs font-mono select-none">→</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-brand-dark/5" />

        {/* 2. Client and Shipping Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/40">Bill To</h3>
            <div className="text-sm space-y-1">
              <p className="font-bold text-brand-dark text-md">{customer?.fullName || 'N/A'}</p>
              <p className="text-brand-dark/60">{customer?.email || 'N/A'}</p>
              <p className="text-brand-dark/60">{customer?.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/40">Shipping Destination</h3>
            {order?.shippingAddress ? (
              <div className="text-sm space-y-1">
                <p className="font-bold text-brand-dark">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="text-brand-dark/60">{order.shippingAddress.addressLine1}</p>
                <p className="text-brand-dark/60">
                  {order.shippingAddress.city}, {order.shippingAddress.country}
                </p>
                <p className="text-brand-dark/60">Contact Phone: {order.shippingAddress.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-brand-dark/40 italic">No custom shipping address specified.</p>
            )}
          </div>
        </div>

        {/* 3. Products List Table */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/40">Itemized Charges</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-brand-cream/10 border-b border-brand-dark/5">
                  <th className="py-4 px-6 font-bold text-brand-dark/60">Product details</th>
                  <th className="py-4 px-6 font-bold text-brand-dark/60 text-center">Quantity</th>
                  <th className="py-4 px-6 font-bold text-brand-dark/60 text-right">Unit Price</th>
                  <th className="py-4 px-6 font-bold text-brand-dark/60 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5">
                {(items || []).map((item: any) => (
                  <tr key={item.id} className="hover:bg-brand-cream/5 transition-colors">
                    <td className="py-5 px-6 font-medium text-brand-dark">
                      {item.productName} {item.sku ? `(${item.sku})` : ''}
                    </td>
                    <td className="py-5 px-6 text-center text-brand-dark/60">{item.quantity}</td>
                    <td className="py-5 px-6 text-right text-brand-dark/60">PKR {parseFloat(item.unitPrice).toFixed(2)}</td>
                    <td className="py-5 px-6 text-right font-bold text-brand-dark">PKR {parseFloat(item.totalAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Payment Methods & Final Sum Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-brand-dark/5 pt-8">
          <div className="space-y-4">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/40 mb-2">Payment Details</h4>
              <div className="text-sm space-y-1">
                <p className="text-brand-dark/60">Payment Mode: <span className="font-bold text-brand-dark uppercase">{order?.paymentMethod || 'COD'}</span></p>
                <p className="text-brand-dark/60">Fulfillment: <span className="font-bold text-brand-dark uppercase">{order?.paymentStatus || 'Pending'}</span></p>
              </div>
            </div>
            
            <div className="bg-brand-cream/10 p-6 rounded-3xl border border-brand-dark/5 max-w-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-dark/50 mb-2">Important Note</h4>
              <p className="text-xs text-brand-dark/60 leading-relaxed">
                Thank you for shopping at Tayfa. For inquiries about product fulfillment or return procedures, please get in touch with the seller.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/40 text-right mb-2">Pricing breakdown</h4>
            <div className="space-y-2.5 max-w-xs ml-auto">
              <div className="flex justify-between text-sm text-brand-dark/60">
                <span>Subtotal</span>
                <span>PKR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-brand-dark/60">
                <span>Sales Tax (incl.)</span>
                <span>PKR {parseFloat(invoice.taxAmount).toFixed(2)}</span>
              </div>
              <hr className="border-brand-dark/5" />
              <div className="flex justify-between text-lg font-bold text-brand-dark pt-1">
                <span>Grand Total</span>
                <span className="text-brand-gold">PKR {parseFloat(invoice.amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoiceDetail;
