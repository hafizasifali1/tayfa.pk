import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, 
  ChevronRight, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  ArrowLeft,
  Download,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import OrderTimeline from '../../components/orders/OrderTimeline';
import OrderStatusHistory from '../../components/orders/OrderStatusHistory';
import ReturnRequestModal from '../../components/orders/ReturnRequestModal';
import RefundRequestModal from '../../components/orders/RefundRequestModal';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Link } from 'react-router-dom';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: any[];
  history: any[];
  shipments: any[];
  returns: any[];
  refundRequests: any[];
  paymentMethod: string;
}

const OrderHistory = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/orders?customerId=${user?.id}`);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (id: string) => {
    try {
      const res = await axios.get(`/api/orders/${id}`);
      if (res.data) setSelectedOrder(res.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const cancelOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await axios.patch(`/api/orders/${id}/status`, {
        status: 'cancelled',
        comment: 'Cancelled by customer',
      });
      await fetchOrderDetails(id);
      await fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleRefundSubmit = async (data: any) => {
    if (!selectedOrder) return;
    try {
      await axios.post(`/api/orders/${selectedOrder.id}/refunds`, {
        ...data,
        userId: user?.id,
      });
      setSuccessMsg('Refund request submitted successfully!');
      await fetchOrderDetails(selectedOrder.id);
      await fetchOrders();
    } catch (error: any) {
      console.error('Refund Error:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleReturnSubmit = async (data: any) => {
    if (!selectedOrder) return;
    try {
      await axios.post(`/api/orders/${selectedOrder.id}/returns`, {
        ...data,
        userId: user?.id,
      });
      setSuccessMsg('Return request submitted successfully!');
      await fetchOrderDetails(selectedOrder.id);
      await fetchOrders();
    } catch (error: any) {
      console.error('Return Error:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  if (selectedOrder) {
    const hasRefund = (selectedOrder.refundRequests || []).length > 0;
    const hasReturn = (selectedOrder.returns || []).length > 0;
    const isOnline = selectedOrder.paymentMethod !== 'cod';
    const status = selectedOrder.status;

    const showReturnBtn = !['return_requested', 'returned'].includes(status) && 
                         !hasRefund &&
                         ((isOnline && ['confirmed', 'processing', 'shipped', 'delivered'].includes(status)) ||
                          (!isOnline && status === 'delivered'));

    const showRefundBtn = !['refund_requested', 'refunded'].includes(status) && 
                         !hasReturn &&
                         ((isOnline && ['confirmed', 'processing', 'shipped', 'delivered'].includes(status)) ||
                          (!isOnline && status === 'delivered'));

    return (
      <div className="min-h-screen bg-brand-cream/20 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <button
            onClick={() => { setSelectedOrder(null); setReturnSuccess(false); }}
            className="flex items-center text-brand-dark/60 hover:text-brand-dark transition-colors font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Orders
          </button>

          {/* Order Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif text-brand-dark">Order {selectedOrder.orderNumber}</h1>
              <p className="text-brand-dark/40 text-sm mt-1">
                Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="rounded-2xl text-xs">
                <Download size={16} className="mr-2" />
                Invoice
              </Button>
              {['pending', 'confirmed'].includes(selectedOrder.status) && (
                <Button
                  variant="outline"
                  onClick={() => cancelOrder(selectedOrder.id)}
                  className="rounded-2xl text-xs border-red-200 text-red-600 hover:bg-red-50"
                >
                  Cancel Order
                </Button>
              )}
              {showReturnBtn && (
                <Button
                  variant="premium"
                  onClick={() => setIsReturnModalOpen(true)}
                  className="rounded-2xl text-xs"
                >
                  Request Return
                </Button>
              )}
              {showRefundBtn && (
                <Button
                  variant="premium"
                  onClick={() => setIsRefundModalOpen(true)}
                  className="rounded-2xl text-xs"
                >
                  Request Refund
                </Button>
              )}
              {hasReturn && (
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest">
                  Return {status === 'returned' ? 'Completed' : 'Pending'}
                </span>
              )}
              {hasRefund && (
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest">
                  Refund {status === 'refunded' ? 'Completed' : 'Pending'}
                </span>
              )}
            </div>
          </div>

          {/* Success Banner */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-5"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="font-bold text-emerald-800 text-sm">{successMsg}</p>
                  <p className="text-emerald-700 text-xs mt-1 leading-relaxed">
                    Our team will review your request and get back to you shortly.
                  </p>
                </div>
                <button onClick={() => setSuccessMsg(null)} className="ml-auto text-emerald-400 hover:text-emerald-600">
                  <XCircle size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="p-8 space-y-12 rounded-[2.5rem]">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Order Progress</h3>
              <OrderTimeline status={selectedOrder.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-brand-dark/5">
              {/* Items */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Items</h3>
                <div className="space-y-4">
                  {(selectedOrder.items || []).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-brand-cream/30 rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-dark/10">
                          <ShoppingBag size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-brand-dark">{item.name}</p>
                          <p className="text-xs text-brand-dark/40">{item.size} • Qty: {item.quantity}</p>
                          {hasReturn && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mt-1 block">
                              Return Requested
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="font-bold text-brand-dark">{formatPrice(Number(item.price))}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Shipping */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Shipping Updates</h3>
                  {(selectedOrder.shipments || []).length > 0 ? (
                    <div className="space-y-4">
                      {selectedOrder.shipments.map((shipment: any) => (
                        <div key={shipment.id} className="p-6 bg-brand-dark text-white rounded-[2rem] relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                          <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                              <Truck className="text-brand-gold" size={24} />
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{shipment.carrier}</p>
                            </div>
                            <div>
                              <p className="text-xs opacity-40 uppercase tracking-widest">Tracking Number</p>
                              <p className="text-lg font-mono tracking-wider mt-1">{shipment.trackingNumber}</p>
                            </div>
                            <Button variant="premium" className="w-full py-3 text-xs">Track Shipment</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-brand-cream/30 rounded-[2rem] border border-dashed border-brand-dark/10 flex flex-col items-center justify-center text-center">
                      <Package className="text-brand-dark/10 mb-2" size={32} />
                      <p className="text-xs text-brand-dark/40">Tracking info will be available once shipped.</p>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-brand-dark/60">
                      <span>Subtotal</span>
                      <span>{formatPrice(Number(selectedOrder.totalAmount))}</span>
                    </div>
                    <div className="flex justify-between text-brand-dark/60">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between font-bold text-brand-dark pt-2 border-t border-brand-dark/5">
                      <span>Total</span>
                      <span>{formatPrice(Number(selectedOrder.totalAmount))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Status History */}
          {Array.isArray(selectedOrder.history) && selectedOrder.history.length > 0 && (
            <Card className="p-8 rounded-[2.5rem]">
              <OrderStatusHistory history={selectedOrder.history} showRoleBadge={false} />
            </Card>
          )}
        </div>

        {/* Refund Modal */}
        <RefundRequestModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          onSubmit={handleReturnSubmit}
          paymentMethod={selectedOrder.paymentMethod}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-serif text-brand-dark">My Orders</h1>
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-brand-dark/5">
            <ShoppingBag className="text-brand-gold" size={24} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <Card className="p-16 text-center rounded-[2.5rem]">
            <div className="w-20 h-20 bg-brand-cream rounded-[2rem] flex items-center justify-center text-brand-dark/10 mx-auto mb-6">
              <ShoppingBag size={40} />
            </div>
            <h3 className="text-xl font-serif text-brand-dark">No orders yet</h3>
            <p className="text-sm text-brand-dark/40 mt-2 mb-8">Start shopping to see your orders here.</p>
            <Link to="/shop">
              <Button variant="premium" className="px-12">Browse Shop</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <motion.div
                key={order.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => fetchOrderDetails(order.id)}
                className="cursor-pointer"
              >
                <Card className="p-6 hover:border-brand-gold/30 transition-all rounded-[2rem]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-gold">
                        <Package size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-dark">{order.orderNumber}</h3>
                        <p className="text-xs text-brand-dark/40">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end md:space-x-8">
                      <div className="text-right">
                        <p className="font-bold text-brand-dark">{formatPrice(Number(order.totalAmount))}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mt-1">
                          {(order.items || []).length} {(order.items || []).length === 1 ? 'Item' : 'Items'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          order.status === 'return_requested' ? 'bg-orange-100 text-orange-700' :
                          order.status === 'refunded' ? 'bg-blue-100 text-blue-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                        <ChevronRight size={20} className="text-brand-dark/20" />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <>
          <RefundRequestModal
            isOpen={isRefundModalOpen}
            onClose={() => setIsRefundModalOpen(false)}
            onSubmit={handleRefundSubmit}
            paymentMethod={selectedOrder.paymentMethod}
          />
          <ReturnRequestModal
            isOpen={isReturnModalOpen}
            onClose={() => setIsReturnModalOpen(false)}
            onSubmit={handleReturnSubmit}
            items={selectedOrder.items}
          />
        </>
      )}
    </div>
  );
};

export default OrderHistory;
