import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ChevronRight, ExternalLink, Truck, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Price from '../components/common/Price';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Order } from '../types';
import OrderTimeline from '../components/orders/OrderTimeline';
import OrderStatusHistory from '../components/orders/OrderStatusHistory';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const response = await fetch(`/api/orders?customerId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'shipped': return <Truck className="text-blue-500" size={16} />;
      case 'pending': return <Clock className="text-amber-500" size={16} />;
      default: return <Package className="text-brand-dark/40" size={16} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-5xl font-serif mb-4">My Orders</h1>
        <p className="text-brand-dark/60">
          Track your orders and view your purchase history.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden border-brand-dark/5 hover:border-brand-gold/20 transition-all">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-brand-dark/5">
                    <div className="grid grid-cols-2 md:flex md:items-center gap-4 sm:gap-6 flex-grow">
                      <div className="space-y-1">
                        <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Order Number</p>
                        <p className="font-mono font-bold text-sm sm:text-lg">{order.id}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Date Placed</p>
                        <p className="font-bold text-xs sm:text-base">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Total Amount</p>
                        <Price amount={order.totalAmount} className="font-bold text-sm sm:text-lg text-brand-gold" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-brand-cream/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full self-start md:self-center">
                      {getStatusIcon(order.status)}
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{order.status}</span>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-4 sm:space-x-6">
                        <div className="w-16 h-20 sm:w-20 sm:h-24 bg-brand-cream rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0">
                          <img 
                            src={item.images[0]} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-serif text-base sm:text-lg truncate max-w-[150px] sm:max-w-none">{item.name}</h4>
                          <p className="text-xs text-brand-dark/60">
                            Size: {item.selectedSize} | Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <Price 
                            amount={(item.price + (item.discount || 0)) * item.quantity} 
                            discount={(item.discount || 0) * item.quantity} 
                            productId={item.id}
                            className="font-bold text-sm sm:text-base" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-brand-dark/5 flex flex-wrap gap-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center space-x-2"
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    >
                      <ExternalLink size={14} />
                      <span>{expandedOrderId === order.id ? 'Hide Details' : 'View Details'}</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Truck size={14} />
                      <span>Track Order</span>
                    </Button>
                  </div>

                  <AnimatePresence>
                    {expandedOrderId === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-8 pt-8 border-t border-brand-dark/5 space-y-8">
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">Order Progress</h3>
                            <OrderTimeline status={order.status} />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">Shipping Address</h3>
                              <div className="bg-brand-cream/30 p-6 rounded-[2rem] border border-brand-dark/5">
                                <p className="font-bold text-brand-dark">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                                <p className="text-sm text-brand-dark/60 mt-1">{order.shippingAddress?.address}</p>
                                <p className="text-sm text-brand-dark/60">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                                <p className="text-sm text-brand-dark/60 mt-2">{order.shippingAddress?.phone}</p>
                              </div>
                            </div>
                            
                            <div>
                              <OrderStatusHistory history={order.history || []} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-brand-dark/5 shadow-sm">
          <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={32} className="text-brand-dark/20" />
          </div>
          <h2 className="text-3xl font-serif mb-4">No orders yet</h2>
          <p className="text-brand-dark/60 mb-8 max-w-md mx-auto">
            You haven't placed any orders yet. Start shopping to see your history here.
          </p>
          <Button onClick={() => window.location.href = '/shop'} variant="premium">
            Explore Collection
          </Button>
        </div>
      )}
    </div>
  );
};

export default Orders;
