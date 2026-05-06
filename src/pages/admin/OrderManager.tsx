import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye,
  RotateCcw,
  Package,
  ChevronRight,
  User,
  CreditCard,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import OrderTimeline from '../../components/orders/OrderTimeline';
import OrderStatusHistory from '../../components/orders/OrderStatusHistory';
import OrderActionButtons from '../../components/orders/OrderActionButtons';
import OrderFormModal from '../../components/admin/OrderFormModal';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2 as TrashIcon } from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  totalAmount: string;
  taxAmount?: string;
  discountAmount?: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  shippingAddress: any;
  paymentMethodName?: string;
  items: any[];
  history: {
    status: string;
    timestamp: string;
    comment?: string;
  }[];
}

const OrderManager = () => {
  const { hasPermission, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewedOrders, setViewedOrders] = useState<string[]>([]);
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {
    const saved = localStorage.getItem('tayfa_viewed_orders');
    if (saved) {
      try { setViewedOrders(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const markAsViewed = (id: string) => {
    if (!viewedOrders.includes(id)) {
      const updated = [...viewedOrders, id];
      setViewedOrders(updated);
      localStorage.setItem('tayfa_viewed_orders', JSON.stringify(updated));
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await axios.delete(`/api/orders/${id}`);
      setSelectedOrder(null);
      setConfirmDeleteId(null);
      await fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/orders');
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        console.error('Orders response is not an array:', res.data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (id: string) => {
    try {
      const res = await axios.get(`/api/orders/${id}`);
      setSelectedOrder(res.data);
      markAsViewed(id);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const updateStatus = async (id: string, status: string, comment: string) => {
    try {
      setIsUpdating(true);
      await axios.patch(`/api/orders/${id}/status`, { 
        status, 
        comment,
        processedByRole: user?.role || 'admin',
        processedByName: user?.fullName || 'Admin',
        processedById: user?.id
      });
      await fetchOrderDetails(id);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const createShipment = async (id: string, data: { carrier: string; trackingNumber: string }) => {
    try {
      setIsUpdating(true);
      await axios.post(`/api/orders/${id}/shipments`, {
        carrier: data.carrier,
        trackingNumber: data.trackingNumber,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
      await fetchOrderDetails(id);
      await fetchOrders();
    } catch (error) {
      console.error('Error creating shipment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-purple-100 text-purple-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'return_requested': return 'bg-orange-100 text-orange-700';
      case 'refunded': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif text-brand-dark order-page-title">Order Management</h1>
            <p className="text-brand-dark/60 mt-2 order-page-subtitle">Monitor and manage the full order lifecycle.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" size={18} />
              <input 
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-brand-dark/5 rounded-2xl focus:outline-none focus:border-brand-gold transition-all w-64 shadow-sm hover:shadow-md focus:shadow-md order-toolbar-btn"
              />
            </div>
            <Button 
              variant="outline" 
              className="rounded-2xl bg-white border-brand-dark/5 order-toolbar-btn"
              onClick={fetchOrders}
            >
              <RotateCcw size={18} className={`${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" className="rounded-2xl bg-white border-brand-dark/5 order-toolbar-btn">
              <Filter size={18} className="mr-2" />
              Filter
            </Button>
            <PermissionGate module="orders" action="create">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="rounded-2xl bg-brand-dark text-white hover:bg-brand-gold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-dark/10 order-toolbar-btn"
              >
                <Plus size={18} className="mr-2" />
                Create Order
              </Button>
            </PermissionGate>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 order-main-container">
          {/* Order List */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-5 order-list-panel-wrap">
            {isLoading && orders.length === 0 ? (
              <div className="flex items-center justify-center h-64 bg-brand-cream/10 rounded-[2.5rem] border-2 border-dashed border-brand-dark/5">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold" />
              </div>
            ) : !Array.isArray(filteredOrders) || filteredOrders.length === 0 ? (
              <Card className="p-12 text-center text-brand-dark/40 border-2 border-dashed border-brand-dark/5 bg-brand-cream/10 rounded-[2.5rem]">
                <Package size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-serif italic">No orders found matching your criteria.</p>
                <Button variant="outline" size="sm" className="mt-4 rounded-xl" onClick={() => setSearchTerm('')}>Clear Search</Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {paginatedOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    onClick={() => fetchOrderDetails(order.id)}
                    className={`group cursor-pointer transition-all duration-500 ${
                      selectedOrder?.id === order.id ? 'scale-[1.01]' : 'hover:scale-[1.005]'
                    }`}
                  >
                    <Card className={`p-6 border-2 transition-all duration-500 rounded-[2rem] order-item-card ${
                      selectedOrder?.id === order.id 
                        ? 'border-brand-gold bg-white shadow-xl shadow-brand-gold/5' 
                        : 'border-transparent bg-white/50 hover:bg-white hover:border-brand-gold/20 shadow-sm'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 order-item-avatar ${getStatusColor(order.status)}`}>
                            <Package size={28} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-brand-dark text-lg order-item-id">{order.orderNumber}</h3>
                              {new Date(order.createdAt).getTime() > Date.now() - 86400000 && !viewedOrders.includes(order.id) && (
                                <span className="bg-brand-gold/10 text-brand-gold text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">New</span>
                              )}
                            </div>
                            <p className="text-xs text-brand-dark/40 font-medium order-customer-text">{order.customerEmail}</p>
                            <p className="text-[10px] text-brand-dark/30 mt-1 flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-serif font-bold text-brand-dark order-item-amount">PKR {Number(order.totalAmount).toLocaleString()}</p>
                          <div className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] mt-2 px-3 py-1.5 rounded-xl border order-item-status ${getStatusColor(order.status)}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            {order.status.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-2 pt-4 border-t border-brand-dark/5">
                    <p className="text-xs font-bold text-brand-dark/40 uppercase tracking-widest">
                      Page {currentPage} of {totalPages} &nbsp;·&nbsp; {filteredOrders.length} orders
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="rounded-xl px-4"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="rounded-xl px-4"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Details Panel */}
          <div className="lg:col-span-7 xl:col-span-7 order-details-panel-wrap">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div
                  key={selectedOrder.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="p-8 space-y-5 sticky top-8 rounded-[2.5rem] shadow-xl border-brand-dark/5 bg-white overflow-hidden relative order-detail-card">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    
                    <div className="relative flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-serif text-brand-dark order-detail-title">Order Details</h2>
                        <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] mt-1">Management Console</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <PermissionGate module="orders" action="edit">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl px-4 py-2 bg-white border-brand-dark/5 hover:border-brand-gold transition-colors order-toolbar-btn"
                            onClick={() => setIsEditModalOpen(true)}
                          >
                            Edit
                          </Button>
                        </PermissionGate>
                        <PermissionGate module="orders" action="delete">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl px-3 py-2 border-red-100 text-red-500 hover:bg-red-50 transition-colors order-toolbar-btn"
                            onClick={() => setConfirmDeleteId(selectedOrder.id)}
                          >
                            <TrashIcon size={16} />
                          </Button>
                        </PermissionGate>
                        <button 
                          onClick={() => setSelectedOrder(null)} 
                          className="w-10 h-10 flex items-center justify-center bg-brand-cream/40 text-brand-dark/40 hover:text-brand-dark rounded-xl transition-all"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>

                    <OrderTimeline status={selectedOrder.status} />

                    {/* Quick Actions */}
                    <PermissionGate module="orders" action="edit">
                      <OrderActionButtons
                        orderId={selectedOrder.id}
                        status={selectedOrder.status}
                        isUpdating={isUpdating}
                        onUpdateStatus={updateStatus}
                        onCreateShipment={createShipment}
                      />
                    </PermissionGate>

                    {/* Customer Details */}
                    <div className="rounded-2xl border border-brand-dark/10 bg-brand-cream/20 overflow-hidden shadow-sm">
                      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-brand-dark/8 bg-white/80">
                        <User size={15} className="text-brand-gold" />
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Customer Details</p>
                      </div>
                      <div className="px-5 py-4 space-y-1.5">
                        {(() => {
                          const raw = selectedOrder.shippingAddress;
                          const a = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return {}; } })() : (raw || {});
                          const fullName = [a.firstName, a.lastName].filter(Boolean).join(' ').trim();
                          const addressLine = [a.address, a.city, a.state, a.zipCode].filter(Boolean).join(', ');
                          return (
                            <>
                              <p className="text-sm font-bold text-brand-dark order-customer-text">{selectedOrder.customerEmail}</p>
                              {fullName && <p className="text-sm text-brand-dark/80 font-semibold order-customer-text">{fullName}</p>}
                              {a.phone && <p className="text-sm text-brand-dark/60 order-customer-text">{a.phone}</p>}
                              {addressLine && <p className="text-sm text-brand-dark/50 mt-2 pt-2 border-t border-brand-dark/8 order-customer-text">{addressLine}</p>}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="rounded-2xl border border-brand-dark/10 bg-brand-cream/20 overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between px-5 py-3 border-b border-brand-dark/8 bg-white/80">
                        <div className="flex items-center gap-2.5">
                          <CreditCard size={15} className="text-brand-gold" />
                          <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Payment Info</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase text-brand-dark/50">{selectedOrder.paymentStatus}</span>
                          <span className="text-xs px-3 py-1 bg-brand-dark text-white rounded-full font-bold uppercase tracking-tight">
                            {selectedOrder.paymentMethodName || selectedOrder.paymentMethod}
                          </span>
                        </div>
                      </div>
                      <div className="px-5 py-4 space-y-3">
                        {(() => {
                          const subtotal = Array.isArray(selectedOrder.items)
                            ? selectedOrder.items.reduce((s: number, i: any) => s + Number(i.price) * (i.quantity || 1), 0)
                            : 0;
                          const discount = Number(selectedOrder.discountAmount || 0);
                          const tax = Number(selectedOrder.taxAmount || 0);
                          const total = Number(selectedOrder.totalAmount || 0);
                          const fmt = (n: number) => `PKR ${n.toLocaleString()}`;
                          return (
                            <>
                              <div className="flex justify-between text-sm text-brand-dark/70 order-payment-row">
                                <span>Subtotal</span>
                                <span className="font-semibold">{fmt(subtotal)}</span>
                              </div>
                              {discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 order-payment-row">
                                  <span>Discount</span>
                                  <span className="font-semibold">− {fmt(discount)}</span>
                                </div>
                              )}
                              {tax > 0 && (
                                <div className="flex justify-between text-sm text-brand-dark/70 order-payment-row">
                                  <span>Tax</span>
                                  <span className="font-semibold">+ {fmt(tax)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-base font-bold text-brand-dark pt-3 border-t border-brand-dark/10 order-payment-row">
                                <span>Total</span>
                                <span>{fmt(total)}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Placement Date */}
                    <div className="rounded-2xl border border-brand-dark/10 bg-brand-cream/20 overflow-hidden shadow-sm">
                      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-brand-dark/8 bg-white/80">
                        <Calendar size={15} className="text-brand-gold" />
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Placement Date</p>
                      </div>
                      <div className="px-5 py-4">
                        <p className="text-base font-bold text-brand-dark">
                          {new Date(selectedOrder.createdAt).toLocaleString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="rounded-2xl border border-brand-dark/10 bg-brand-cream/20 overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between px-5 py-3 border-b border-brand-dark/8 bg-white/80">
                        <div className="flex items-center gap-2.5">
                          <Package size={15} className="text-brand-gold" />
                          <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Order Items</p>
                        </div>
                        <span className="text-xs text-brand-dark/40 font-bold">{selectedOrder.items?.length || 0} SKU(s)</span>
                      </div>
                      <div className="space-y-2 p-4">
                        {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-brand-dark/5 hover:border-brand-gold/20 transition-all group">
                            <div className="flex items-center space-x-3">
                              <div className="w-11 h-11 bg-brand-cream/40 rounded-xl flex items-center justify-center text-brand-dark/20 group-hover:rotate-6 transition-transform shrink-0">
                                <Package size={22} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-brand-dark leading-tight">{item.name}</p>
                                <p className="text-xs text-brand-dark/50 mt-0.5">Qty: {item.quantity} • {item.size || 'Standard'}</p>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-brand-dark shrink-0 ml-2">PKR {Number(item.price).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status History */}
                    <div className="rounded-2xl border border-brand-dark/10 bg-brand-cream/20 overflow-hidden shadow-sm">
                      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-brand-dark/8 bg-white/80">
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Status History</p>
                      </div>
                      <div className="p-5">
                        <OrderStatusHistory 
                          history={selectedOrder.history} 
                          showRoleBadge={true}
                        />
                      </div>
                    </div>
                  </Card>

                </motion.div>
              ) : (
                <div className="hidden lg:block h-full">
                  <div className="sticky top-8 h-[calc(100vh-8rem)] bg-brand-cream/30 rounded-[2.5rem] border-2 border-dashed border-brand-dark/5 flex flex-col items-center justify-center text-center p-12">
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-brand-dark/10 mb-6 shadow-sm">
                      <Eye size={40} />
                    </div>
                    <h3 className="text-xl font-serif text-brand-dark/40">Select an order to view details</h3>
                    <p className="text-sm text-brand-dark/30 mt-2">Click on any order from the list to see full information and manage its status.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {hasPermission('orders', 'create') && (
          <OrderFormModal
            isOpen={isCreateModalOpen}
            mode="create"
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={async (created) => {
              await fetchOrders();
              if (created?.id) await fetchOrderDetails(created.id);
            }}
          />
        )}

        {selectedOrder && hasPermission('orders', 'edit') && (
          <OrderFormModal
            isOpen={isEditModalOpen}
            mode="edit"
            order={selectedOrder}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={async (updated) => {
              await fetchOrders();
              if (updated?.id) await fetchOrderDetails(updated.id);
              else setSelectedOrder(updated);
            }}
          />
        )}

        <ConfirmModal
          isOpen={!!confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={() => confirmDeleteId && deleteOrder(confirmDeleteId)}
          title="Delete Order?"
          message="This permanently removes the order, its items and history. This action cannot be undone."
          confirmText="Delete"
          cancelText="Keep Order"
          variant="danger"
        />
      </div>
    );
};

export default OrderManager;
