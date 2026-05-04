import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Package,
  ChevronRight,
  User,
  CreditCard,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import OrderTimeline from '../../components/orders/OrderTimeline';
import { useAuth } from '../../context/AuthContext';

interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  totalAmount: string;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress: any;
  items: any[];
  history: any[];
}

const SellerOrderManager = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({ carrier: '', trackingNumber: '' });

  useEffect(() => {
    if (user?.id) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/orders?sellerId=${user?.id}`);
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching seller orders:', error);
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
      await axios.patch(`/api/orders/${id}/status`, { status, comment, changedBy: user?.id });
      await fetchOrderDetails(id);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const createShipment = async (id: string) => {
    try {
      setIsUpdating(true);
      await axios.post(`/api/orders/${id}/shipments`, {
        sellerId: user?.id,
        carrier: trackingInfo.carrier,
        trackingNumber: trackingInfo.trackingNumber,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // Mock 3 days
      });
      await fetchOrderDetails(id);
      await fetchOrders();
      setTrackingInfo({ carrier: '', trackingNumber: '' });
    } catch (error) {
      console.error('Error creating shipment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex flex-col md:items-start justify-between gap-4">
          <h1 className="text-4xl font-serif text-brand-dark">Order Fulfillment</h1>
          <p className="text-brand-dark/60">Manage your assigned orders and update shipment tracking.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" size={18} />
              <input 
                type="text"
                placeholder="Search by order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-brand-dark/5 rounded-[2rem] focus:outline-none focus:border-brand-gold transition-colors shadow-sm"
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card className="p-12 text-center text-brand-dark/40 rounded-[2.5rem]">
                <Package size={48} className="mx-auto mb-4 opacity-20" />
                <p>No orders assigned to you yet.</p>
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
                  <Card className={`p-6 border-2 rounded-[2rem] ${
                    selectedOrder?.id === order.id ? 'border-brand-gold bg-brand-gold/5' : 'border-transparent bg-white'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusColor(order.status)}`}>
                          <Package size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-brand-dark">{order.orderNumber}</h3>
                          <p className="text-xs text-brand-dark/40">
                            {(order.items || []).filter((i: any) => i.sellerId === user?.id).length} items assigned
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand-dark">{order.currency} {order.totalAmount}</p>
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
                  <Card className="p-8 space-y-8 sticky top-8 rounded-[2.5rem] shadow-xl">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-serif">Order Details</h2>
                      <button onClick={() => setSelectedOrder(null)} className="text-brand-dark/40 hover:text-brand-dark">
                        <ChevronRight size={24} />
                      </button>
                    </div>

                    <OrderTimeline status={selectedOrder.status} />

                    {/* Quick Actions */}
                    <div className="space-y-4">
                      {selectedOrder.status === 'confirmed' && (
                        <Button 
                          onClick={() => updateStatus(selectedOrder.id, 'processing', 'Seller is preparing your order')}
                          disabled={isUpdating}
                          className="w-full rounded-2xl bg-brand-dark text-white py-6"
                        >
                          <Package size={18} className="mr-2" />
                          Start Processing
                        </Button>
                      )}
                      
                      {selectedOrder.status === 'processing' && (
                        <div className="space-y-4 p-6 bg-brand-cream/30 rounded-3xl border border-brand-dark/5">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Tracking Details</h3>
                          <div className="space-y-3">
                            <input 
                              type="text"
                              placeholder="Carrier (e.g. TCS)"
                              value={trackingInfo.carrier}
                              onChange={(e) => setTrackingInfo(prev => ({ ...prev, carrier: e.target.value }))}
                              className="w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-xl text-sm focus:outline-none focus:border-brand-gold"
                            />
                            <input 
                              type="text"
                              placeholder="Tracking Number"
                              value={trackingInfo.trackingNumber}
                              onChange={(e) => setTrackingInfo(prev => ({ ...prev, trackingNumber: e.target.value }))}
                              className="w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-xl text-sm focus:outline-none focus:border-brand-gold"
                            />
                            <Button 
                              onClick={() => createShipment(selectedOrder.id)}
                              disabled={isUpdating || !trackingInfo.carrier || !trackingInfo.trackingNumber}
                              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <Truck size={18} className="mr-2" />
                              Mark as Shipped
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Items List (Only Seller's Items) */}
                    <div className="space-y-4 pt-6 border-t border-brand-dark/5">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Assigned Items</h3>
                      <div className="space-y-3">
                        {selectedOrder.items?.filter(i => i.sellerId === user?.id).map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-brand-cream/30 rounded-2xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-dark/20">
                                <Package size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-brand-dark">{item.name}</p>
                                <p className="text-[10px] text-brand-dark/40">Qty: {item.quantity} • {item.size}</p>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-brand-dark">{selectedOrder.currency} {item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="pt-6 border-t border-brand-dark/5">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">Shipping Address</h3>
                      <div className="p-4 bg-brand-cream/30 rounded-2xl text-sm space-y-1">
                        <p className="font-bold">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                        <p className="text-brand-dark/60">{selectedOrder.shippingAddress.address}</p>
                        <p className="text-brand-dark/60">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                        <p className="text-brand-dark/60">{selectedOrder.shippingAddress.phone}</p>
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
                    <h3 className="text-xl font-serif text-brand-dark/40">Select an order</h3>
                    <p className="text-sm text-brand-dark/30 mt-2">View details and update tracking information for your assigned orders.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
};

export default SellerOrderManager;
