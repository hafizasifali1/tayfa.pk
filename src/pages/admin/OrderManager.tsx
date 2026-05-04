import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Truck, 
  CheckCircle, 
  XCircle, 
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
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  shippingAddress: any;
  items: any[];
  history: {
    status: string;
    timestamp: string;
    comment?: string;
  }[];
}

const OrderManager = () => {
  const { hasPermission } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewedOrders, setViewedOrders] = useState<string[]>([]);

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
      await axios.patch(`/api/orders/${id}/status`, { status, comment });
      await fetchOrderDetails(id);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-purple-100 text-purple-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif text-brand-dark">Order Management</h1>
            <p className="text-brand-dark/60 mt-2">Monitor and manage the full order lifecycle.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" size={18} />
              <input 
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-brand-dark/5 rounded-2xl focus:outline-none focus:border-brand-gold transition-all w-64 shadow-sm hover:shadow-md focus:shadow-md"
              />
            </div>
            <Button 
              variant="outline" 
              className="rounded-2xl bg-white border-brand-dark/5"
              onClick={fetchOrders}
            >
              <RotateCcw size={18} className={`${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" className="rounded-2xl bg-white border-brand-dark/5">
              <Filter size={18} className="mr-2" />
              Filter
            </Button>
            <PermissionGate module="orders" action="create">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="rounded-2xl bg-brand-dark text-white hover:bg-brand-gold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-dark/10"
              >
                <Plus size={18} className="mr-2" />
                Create Order
              </Button>
            </PermissionGate>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Order List */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-5">
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
              <div className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2 custom-scrollbar">
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layoutId={order.id}
                    onClick={() => fetchOrderDetails(order.id)}
                    className={`group cursor-pointer transition-all duration-500 ${
                      selectedOrder?.id === order.id ? 'scale-[1.01]' : 'hover:scale-[1.005]'
                    }`}
                  >
                    <Card className={`p-6 border-2 transition-all duration-500 rounded-[2rem] ${
                      selectedOrder?.id === order.id 
                        ? 'border-brand-gold bg-white shadow-xl shadow-brand-gold/5' 
                        : 'border-transparent bg-white/50 hover:bg-white hover:border-brand-gold/20 shadow-sm'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 ${getStatusColor(order.status)}`}>
                            <Package size={28} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-brand-dark text-lg">{order.orderNumber}</h3>
                              {new Date(order.createdAt).getTime() > Date.now() - 86400000 && !viewedOrders.includes(order.id) && (
                                <span className="bg-brand-gold/10 text-brand-gold text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">New</span>
                              )}
                            </div>
                            <p className="text-xs text-brand-dark/40 font-medium">{order.customerEmail}</p>
                            <p className="text-[10px] text-brand-dark/30 mt-1 flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-serif font-bold text-brand-dark">PKR {Number(order.totalAmount).toLocaleString()}</p>
                          <div className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] mt-2 px-3 py-1.5 rounded-xl border ${getStatusColor(order.status)}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            {order.status}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Order Details Panel */}
          <div className="lg:col-span-5 xl:col-span-5">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div
                  key={selectedOrder.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="p-8 space-y-8 sticky top-8 rounded-[2.5rem] shadow-xl border-brand-dark/5 bg-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    
                    <div className="relative flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-serif text-brand-dark">Order Details</h2>
                        <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] mt-1">Management Console</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <PermissionGate module="orders" action="edit">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl px-4 py-2 bg-white border-brand-dark/5 hover:border-brand-gold transition-colors"
                            onClick={() => setIsEditModalOpen(true)}
                          >
                            Edit
                          </Button>
                        </PermissionGate>
                        <PermissionGate module="orders" action="delete">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl px-3 py-2 border-red-100 text-red-500 hover:bg-red-50 transition-colors"
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

                    <div className="bg-brand-cream/10 p-2 rounded-[2rem] border border-brand-dark/5">
                      <OrderTimeline status={selectedOrder.status} />
                    </div>

                    {/* Quick Actions */}
                    <PermissionGate module="orders" action="edit">
                      <div className="grid grid-cols-2 gap-4">
                        {selectedOrder.status === 'pending' && (
                          <Button
                            onClick={() => updateStatus(selectedOrder.id, 'confirmed', 'Order confirmed by admin')}
                            disabled={isUpdating}
                            className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all font-bold text-[10px] uppercase tracking-widest"
                          >
                            <CheckCircle size={18} className="mr-2" />
                            Confirm Order
                          </Button>
                        )}
                        {selectedOrder.status === 'confirmed' && (
                          <Button
                            onClick={() => updateStatus(selectedOrder.id, 'processing', 'Order is being processed')}
                            disabled={isUpdating}
                            className="w-full h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all font-bold text-[10px] uppercase tracking-widest"
                          >
                            <Package size={18} className="mr-2" />
                            Process
                          </Button>
                        )}
                        {['pending', 'confirmed', 'processing'].includes(selectedOrder.status) && (
                          <Button
                            onClick={() => updateStatus(selectedOrder.id, 'cancelled', 'Order cancelled by admin')}
                            disabled={isUpdating}
                            variant="outline"
                            className="w-full h-12 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 transition-all font-bold text-[10px] uppercase tracking-widest"
                          >
                            <XCircle size={18} className="mr-2" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </PermissionGate>

                    {/* Info Sections */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="group flex items-start space-x-4 p-4 bg-brand-cream/20 rounded-[1.5rem] border border-transparent hover:border-brand-gold/20 transition-all">
                        <div className="p-3 bg-white rounded-2xl text-brand-gold shadow-sm group-hover:scale-110 transition-transform">
                          <User size={20} />
                        </div>
                        <div className="flex-grow">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Customer Details</p>
                          <p className="text-sm font-bold text-brand-dark mt-0.5">{selectedOrder.customerEmail}</p>
                          <p className="text-[11px] text-brand-dark/60 mt-1.5 leading-relaxed bg-white/50 p-2 rounded-xl border border-brand-dark/5">
                            {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zipCode}
                          </p>
                        </div>
                      </div>

                      <div className="group flex items-start space-x-4 p-4 bg-brand-cream/20 rounded-[1.5rem] border border-transparent hover:border-brand-gold/20 transition-all">
                        <div className="p-3 bg-white rounded-2xl text-brand-gold shadow-sm group-hover:scale-110 transition-transform">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Payment Info</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-brand-dark uppercase">{selectedOrder.paymentStatus}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-brand-dark text-white rounded-full font-bold uppercase tracking-tighter">{selectedOrder.paymentMethod}</span>
                          </div>
                        </div>
                      </div>

                      <div className="group flex items-start space-x-4 p-4 bg-brand-cream/20 rounded-[1.5rem] border border-transparent hover:border-brand-gold/20 transition-all">
                        <div className="p-3 bg-white rounded-2xl text-brand-gold shadow-sm group-hover:scale-110 transition-transform">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Placement Date</p>
                          <p className="text-sm font-bold text-brand-dark mt-0.5">
                            {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Order Items</h3>
                        <span className="text-[10px] text-brand-dark/40 font-bold">{selectedOrder.items?.length || 0} SKU(s)</span>
                      </div>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-brand-dark/5 hover:border-brand-gold/20 transition-all group shadow-sm">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-brand-cream/40 rounded-xl flex items-center justify-center text-brand-dark/20 group-hover:rotate-6 transition-transform">
                                <Package size={24} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-brand-dark leading-tight">{item.name}</p>
                                <p className="text-[10px] text-brand-dark/40 mt-1">Qty: {item.quantity} • {item.size || 'Standard'}</p>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-brand-dark">PKR {Number(item.price).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status History */}
                    <div className="pt-4 border-t border-brand-dark/5">
                      <OrderStatusHistory history={selectedOrder.history} />
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
