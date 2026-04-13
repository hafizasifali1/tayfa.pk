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
import { EditModal } from '../../components/admin/EditModal';
import OrderTimeline from '../../components/orders/OrderTimeline';
import OrderStatusHistory from '../../components/orders/OrderStatusHistory';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" size={18} />
              <input 
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-brand-dark/5 rounded-2xl focus:outline-none focus:border-brand-gold transition-colors w-64"
              />
            </div>
            <Button variant="outline" className="rounded-2xl">
              <Filter size={18} className="mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order List */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold" />
              </div>
            ) : !Array.isArray(filteredOrders) || filteredOrders.length === 0 ? (
              <Card className="p-12 text-center text-brand-dark/40">
                <Package size={48} className="mx-auto mb-4 opacity-20" />
                <p>No orders found matching your criteria.</p>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layoutId={order.id}
                  onClick={() => fetchOrderDetails(order.id)}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedOrder?.id === order.id ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                  }`}
                >
                  <Card className={`p-6 border-2 ${
                    selectedOrder?.id === order.id ? 'border-brand-gold' : 'border-transparent'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusColor(order.status)}`}>
                          <Package size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-brand-dark">{order.orderNumber}</h3>
                          <p className="text-xs text-brand-dark/40">{order.customerEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand-dark">PKR {order.totalAmount}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Order Details Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div
                  key={selectedOrder.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="p-8 space-y-8 sticky top-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-serif">Order Details</h2>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl px-4 py-2"
                          onClick={() => setIsEditModalOpen(true)}
                        >
                          Edit
                        </Button>
                        <button onClick={() => setSelectedOrder(null)} className="text-brand-dark/40 hover:text-brand-dark">
                          <ChevronRight size={24} />
                        </button>
                      </div>
                    </div>

                    <OrderTimeline status={selectedOrder.status} />

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                      {selectedOrder.status === 'pending' && (
                        <Button 
                          onClick={() => updateStatus(selectedOrder.id, 'confirmed', 'Order confirmed by admin')}
                          disabled={isUpdating}
                          className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CheckCircle size={18} className="mr-2" />
                          Confirm
                        </Button>
                      )}
                      {selectedOrder.status === 'confirmed' && (
                        <Button 
                          onClick={() => updateStatus(selectedOrder.id, 'processing', 'Order is being processed')}
                          disabled={isUpdating}
                          className="w-full rounded-2xl bg-purple-600 hover:bg-purple-700 text-white"
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
                          className="w-full rounded-2xl border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle size={18} className="mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>

                    {/* Info Sections */}
                    <div className="space-y-6 pt-6 border-t border-brand-dark/5">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-brand-cream rounded-2xl text-brand-gold">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Customer</p>
                          <p className="text-sm font-bold text-brand-dark">{selectedOrder.customerEmail}</p>
                          <p className="text-xs text-brand-dark/60 mt-1">
                            {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-brand-cream rounded-2xl text-brand-gold">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Payment</p>
                          <p className="text-sm font-bold text-brand-dark uppercase">{selectedOrder.paymentStatus}</p>
                          <p className="text-xs text-brand-dark/60 mt-1">Method: {selectedOrder.paymentMethod}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-brand-cream rounded-2xl text-brand-gold">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Order Date</p>
                          <p className="text-sm font-bold text-brand-dark">
                            {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4 pt-6 border-t border-brand-dark/5">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Order Items</h3>
                      <div className="space-y-3">
                        {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-brand-cream/30 rounded-2xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-dark/20">
                                <Package size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-brand-dark">{item.name}</p>
                                <p className="text-[10px] text-brand-dark/40">Qty: {item.quantity} • {item.size}</p>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-brand-dark">PKR {item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status History */}
                    <div className="pt-6 border-t border-brand-dark/5">
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

        {selectedOrder && (
          <EditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title="Edit Order"
            module="Order"
            recordId={selectedOrder.id}
            initialData={selectedOrder}
            endpoint="/api/orders"
            onSuccess={(updated) => {
              setSelectedOrder(updated);
              fetchOrders();
            }}
            fields={[
              {
                name: 'status',
                label: 'Order Status',
                type: 'select',
                options: [
                  { label: 'Pending', value: 'pending' },
                  { label: 'Confirmed', value: 'confirmed' },
                  { label: 'Processing', value: 'processing' },
                  { label: 'Shipped', value: 'shipped' },
                  { label: 'Out for Delivery', value: 'out_for_delivery' },
                  { label: 'Delivered', value: 'delivered' },
                  { label: 'Cancelled', value: 'cancelled' },
                  { label: 'Returned', value: 'returned' }
                ],
                required: true
              },
              {
                name: 'paymentStatus',
                label: 'Payment Status',
                type: 'select',
                options: [
                  { label: 'Pending', value: 'pending' },
                  { label: 'Partial', value: 'partial' },
                  { label: 'Paid', value: 'paid' },
                  { label: 'Failed', value: 'failed' },
                  { label: 'Refunded', value: 'refunded' }
                ],
                required: true
              },
              {
                name: 'notes',
                label: 'Admin Notes',
                type: 'textarea'
              }
            ]}
          />
        )}
      </div>
    );
};

export default OrderManager;
