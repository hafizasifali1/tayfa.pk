import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Search, User as UserIcon, Package, Loader2, XCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  mode: 'create' | 'edit';
  order?: any;
  onClose: () => void;
  onSuccess: (order: any) => void;
}

interface ItemRow {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  sellerId?: string;
}

const emptyAddress = { firstName: '', lastName: '', address: '', city: '', state: '', zipCode: '', phone: '', countryCode: '' };

const OrderFormModal: React.FC<Props> = ({ isOpen, mode, order, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerEmail, setCustomerEmail] = useState('');
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [customerQuery, setCustomerQuery] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomerList, setShowCustomerList] = useState(false);

  const [items, setItems] = useState<ItemRow[]>([]);
  const [productQuery, setProductQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [showProductList, setShowProductList] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<any>(emptyAddress);
  const [paymentMethods, setPaymentMethods] = useState<{ code: string; name: string }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (mode === 'edit' && order) {
      setCustomerEmail(order.customerEmail || '');
      setCustomerId(order.customerId);
      setItems(
        Array.isArray(order.items)
          ? order.items.map((it: any) => ({
              productId: it.productId,
              name: it.name,
              price: Number(it.price),
              quantity: Number(it.quantity),
              size: it.size,
              color: it.color,
              sellerId: it.sellerId,
            }))
          : []
      );
      setShippingAddress(order.shippingAddress || emptyAddress);
      setPaymentMethod(order.paymentMethod || 'cod');
      setPaymentStatus(order.paymentStatus || 'pending');
      setStatus(order.status || 'pending');
      setNotes(order.notes || '');
    } else {
      setCustomerEmail('');
      setCustomerId(undefined);
      setItems([]);
      setShippingAddress(emptyAddress);
      setPaymentMethod('cod');
      setPaymentStatus('pending');
      setStatus('pending');
      setNotes('');
    }
  }, [isOpen, mode, order]);

  // Load customers
  useEffect(() => {
    if (!isOpen) return;
    axios.get('/api/users').then(r => setCustomers(Array.isArray(r.data) ? r.data : [])).catch(() => setCustomers([]));
  }, [isOpen]);

  // Load products
  useEffect(() => {
    if (!isOpen) return;
    axios.get('/api/products').then(r => setProducts(Array.isArray(r.data) ? r.data : [])).catch(() => setProducts([]));
  }, [isOpen]);

  // Load active payment methods (gateways + manual methods) from the same source the storefront uses
  useEffect(() => {
    if (!isOpen) return;
    axios.get('/api/payments/checkout/gateways', { params: { region: 'PK', currency: 'PKR', userType: 'admin' } })
      .then(r => {
        const list = Array.isArray(r.data) ? r.data.map((g: any) => ({ code: g.code, name: g.name })) : [];
        setPaymentMethods(list);
        setPaymentMethod(prev => {
          if (prev && list.some(m => m.code === prev)) return prev;
          return list[0]?.code || '';
        });
      })
      .catch(() => setPaymentMethods([]));
  }, [isOpen]);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers.filter(c =>
      (c.email || '').toLowerCase().includes(q) ||
      (c.fullName || '').toLowerCase().includes(q)
    ).slice(0, 8);
  }, [customers, customerQuery]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 8);
    return products.filter(p => (p.name || '').toLowerCase().includes(q)).slice(0, 8);
  }, [products, productQuery]);

  const total = useMemo(() => items.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0), [items]);

  const pickCustomer = (c: any) => {
    setCustomerId(c.id);
    setCustomerEmail(c.email);
    setCustomerQuery('');
    setShowCustomerList(false);
    if (mode === 'create') {
      const [firstName, ...rest] = (c.fullName || '').split(' ');
      setShippingAddress((prev: any) => ({
        ...prev,
        firstName: firstName || prev.firstName,
        lastName: rest.join(' ') || prev.lastName,
        phone: c.phone || prev.phone,
      }));
    }
  };

  const addProduct = (p: any) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === p.id);
      if (existing) {
        return prev.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: p.id, name: p.name, price: Number(p.price), quantity: 1, sellerId: p.sellerId }];
    });
    setProductQuery('');
    setShowProductList(false);
  };

  const updateItem = (idx: number, patch: Partial<ItemRow>) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const validate = (): string | null => {
    if (!customerEmail) return 'Customer email is required';
    if (items.length === 0) return 'At least one item is required';
    if (items.some(it => !it.quantity || it.quantity < 1)) return 'Each item must have quantity ≥ 1';
    if (items.some(it => isNaN(Number(it.price)) || Number(it.price) < 0)) return 'Each item must have a valid price';
    if (mode === 'create') {
      if (!shippingAddress.firstName || !shippingAddress.address || !shippingAddress.city) {
        return 'Shipping address (name, address, city) is required';
      }
    }
    return null;
  };

  const submit = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'create') {
        const payload = {
          items: items.map(it => ({
            productId: it.productId,
            id: it.productId,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
            qty: it.quantity,
            sellerId: it.sellerId,
            size: it.size,
            color: it.color,
          })),
          totalAmount: total,
          customerId,
          customerEmail,
          shippingAddress,
          paymentMethod,
          notes,
          source: 'admin',
          paymentResult: paymentStatus === 'paid' ? { status: 'completed' } : undefined,
        };
        const res = await axios.post('/api/orders', payload);
        let created = res.data;
        if (status !== 'pending' || paymentStatus !== 'pending') {
          const patch: any = {};
          if (status !== 'pending') patch.status = status;
          if (paymentStatus !== 'pending') patch.paymentStatus = paymentStatus;
          const r2 = await axios.patch(`/api/orders/${created.id}`, patch);
          created = r2.data;
        }
        onSuccess(created);
        onClose();
      } else {
        await axios.put(`/api/orders/${order.id}/items`, { items });
        const patch: any = {
          customerEmail,
          shippingAddress,
          paymentMethod,
          paymentStatus,
          status,
          notes,
        };
        const r = await axios.patch(`/api/orders/${order.id}`, patch);
        onSuccess(r.data);
        onClose();
      }
    } catch (err: any) {
      console.error('Order submit error:', err);
      setError(err?.response?.data?.details || err?.response?.data?.error || err.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-5 flex items-center justify-between bg-brand-gold relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
              
              <div className="relative z-10 pl-2">
                <h2 className="text-2xl font-serif font-bold text-white leading-tight">
                  {mode === 'create' ? 'Create Global Order' : `Modify Order ${order?.orderNumber || ''}`}
                </h2>
                <p className="text-[11px] text-white/80 mt-0.5 font-medium">
                  {mode === 'create' ? 'Build a new order on behalf of a customer.' : 'Update items and shipping details.'}
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="relative z-10 p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all hover:rotate-90"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm flex items-center gap-3"
                >
                  <XCircle size={18} className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  {/* Customer Section */}
                  <section className="bg-white p-6 rounded-[2rem] border border-brand-dark/10 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Customer Information</h3>
                      {customerId && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Verified User</span>}
                    </div>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" size={18} />
                      <input
                        type="text"
                        value={customerQuery || customerEmail}
                        onChange={e => { setCustomerQuery(e.target.value); setCustomerEmail(e.target.value); setCustomerId(undefined); setShowCustomerList(true); }}
                        onFocus={() => setShowCustomerList(true)}
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl text-sm border border-brand-dark/5 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all"
                      />
                      <AnimatePresence>
                        {showCustomerList && filteredCustomers.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute z-20 left-0 right-0 mt-2 bg-white shadow-xl rounded-2xl border border-brand-dark/5 max-h-60 overflow-y-auto"
                          >
                            {filteredCustomers.map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => pickCustomer(c)}
                                className="w-full text-left px-4 py-3 hover:bg-brand-cream/40 border-b border-brand-dark/5 last:border-0 transition-colors"
                              >
                                <div className="text-sm font-bold text-brand-dark">{c.fullName || c.email}</div>
                                <div className="text-xs text-brand-dark/40">{c.email}</div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </section>

                  {/* Items Management */}
                  <section className="bg-white p-6 rounded-[2rem] border border-brand-dark/10 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Order Items</h3>
                      <span className="text-[10px] text-brand-dark/40 font-bold">{items.length} Product(s)</span>
                    </div>
                    
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" size={18} />
                      <input
                        type="text"
                        value={productQuery}
                        onChange={e => { setProductQuery(e.target.value); setShowProductList(true); }}
                        onFocus={() => setShowProductList(true)}
                        placeholder="Search a product to add..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl text-sm border border-brand-dark/5 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all"
                      />
                      <AnimatePresence>
                        {showProductList && filteredProducts.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute z-20 left-0 right-0 mt-2 bg-white shadow-xl rounded-2xl border border-brand-dark/5 max-h-60 overflow-y-auto"
                          >
                            {filteredProducts.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => addProduct(p)}
                                className="w-full text-left px-4 py-3 hover:bg-brand-cream/40 border-b border-brand-dark/5 last:border-0 flex items-center justify-between transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-brand-cream/40 rounded-xl flex items-center justify-center overflow-hidden">
                                    {p.images?.[0] ? (
                                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <Package size={16} className="text-brand-dark/20" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-brand-dark">{p.name}</div>
                                    <div className="text-[10px] text-brand-dark/40 uppercase tracking-tighter">Stock: {p.stock ?? 'N/A'}</div>
                                  </div>
                                </div>
                                <div className="text-sm font-bold text-brand-gold">PKR {Number(p.price).toFixed(0)}</div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {items.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-brand-dark/5">
                          <Package className="mx-auto mb-3 text-brand-dark/10" size={32} />
                          <p className="text-xs text-brand-dark/30 font-medium">No items yet. Search products above.</p>
                        </div>
                      )}
                      <AnimatePresence initial={false}>
                        {items.map((it, idx) => (
                          <motion.div 
                            key={`${it.productId}-${idx}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[1.5rem] p-4 border border-brand-dark/5 group hover:border-brand-gold/30 transition-all shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex-grow">
                                <h4 className="text-sm font-bold text-brand-dark truncate">{it.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] font-bold text-brand-gold">PKR {it.price.toFixed(0)}</span>
                                  <span className="text-[10px] text-brand-dark/20">•</span>
                                  <span className="text-[10px] text-brand-dark/40 uppercase tracking-tighter">Total: PKR {(it.price * it.quantity).toFixed(0)}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 bg-brand-cream/30 p-1.5 rounded-xl border border-brand-dark/5">
                                <button 
                                  onClick={() => updateItem(idx, { quantity: Math.max(1, it.quantity - 1) })}
                                  className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-brand-dark/40 hover:text-brand-dark hover:bg-brand-cream transition-colors"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-xs font-bold">{it.quantity}</span>
                                <button 
                                  onClick={() => updateItem(idx, { quantity: it.quantity + 1 })}
                                  className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-brand-dark/40 hover:text-brand-dark hover:bg-brand-cream transition-colors"
                                >
                                  +
                                </button>
                              </div>

                              <button 
                                onClick={() => removeItem(idx)}
                                className="p-2.5 text-brand-dark/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {items.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-brand-dark/5 flex justify-between items-center">
                        <span className="text-xs font-bold text-brand-dark/40">Subtotal</span>
                        <span className="text-xl font-serif font-bold text-brand-dark">PKR {total.toFixed(0)}</span>
                      </div>
                    )}
                  </section>
                </div>

                <div className="space-y-8">
                  {/* Shipping Section */}
                  <section className="bg-white p-6 rounded-[2rem] border border-brand-dark/10 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-4">Shipping Destination</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark/40 ml-2">First Name</label>
                        <input className="w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20" placeholder="e.g. John" value={shippingAddress.firstName || ''} onChange={e => setShippingAddress({ ...shippingAddress, firstName: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark/40 ml-2">Last Name</label>
                        <input className="w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20" placeholder="e.g. Doe" value={shippingAddress.lastName || ''} onChange={e => setShippingAddress({ ...shippingAddress, lastName: e.target.value })} />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-bold text-brand-dark/40 ml-2">Full Address</label>
                        <input className="w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20" placeholder="Street, apartment, suite, etc." value={shippingAddress.address || ''} onChange={e => setShippingAddress({ ...shippingAddress, address: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark/40 ml-2">City</label>
                        <input className="w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20" placeholder="e.g. Lahore" value={shippingAddress.city || ''} onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark/40 ml-2">Phone</label>
                        <input className="w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20" placeholder="+92 ..." value={shippingAddress.phone || ''} onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })} />
                      </div>
                    </div>
                  </section>

                  {/* Logistics & Payment */}
                  <section className="bg-white p-6 rounded-[2rem] border border-brand-dark/10 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-4">Logistics & Payment</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark/40 ml-2">Payment Method</label>
                        <select className="w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 appearance-none" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                          {paymentMethods.length === 0 && <option value="">No active methods</option>}
                          {paymentMethods.map(m => (
                            <option key={m.code} value={m.code}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark/40 ml-2">Payment Status</label>
                        <select className="w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 appearance-none" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark/40 ml-2">Order Status</label>
                        <select className="w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 appearance-none" value={status} onChange={e => setStatus(e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark/40 ml-2">Admin Notes</label>
                        <input className="w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20" placeholder="Internal notes..." value={notes} onChange={e => setNotes(e.target.value)} />
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-brand-dark/5 flex justify-end items-center gap-4 bg-white">
              <button onClick={onClose} className="px-8 py-3.5 bg-brand-cream/50 text-brand-dark/60 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="px-10 py-3.5 bg-brand-gold text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-dark hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-brand-gold/20"
              >
                {submitting && <Loader2 className="animate-spin" size={14} />}
                {mode === 'create' ? 'Finalize Order' : 'Apply Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderFormModal;
