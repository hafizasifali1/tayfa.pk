import React, { useState, useEffect } from 'react';
import { 
  Bell, Plus, Search, Trash2, CheckCircle2, 
  AlertCircle, Info, X, Save, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

const NotificationManager = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newNotification.title || !newNotification.message) return;
    try {
      await axios.post('/api/notifications', newNotification);
      setIsAdding(false);
      setNewNotification({ title: '', message: '', type: 'info' });
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await axios.patch(`/api/notifications/${id}`, { isRead: true });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const filteredNotifications = Array.isArray(notifications) ? notifications.filter(n => {
    try {
      const title = n?.title || '';
      const message = n?.message || '';
      const query = searchQuery.toLowerCase();
      return title.toLowerCase().includes(query) || message.toLowerCase().includes(query);
    } catch (err) {
      console.error('Error filtering notification:', err, n);
      return false;
    }
  }) : [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'warning': return <AlertCircle className="text-amber-500" size={20} />;
      case 'error': return <X className="text-rose-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-brand-dark">System Notifications</h1>
          <p className="text-brand-dark/60">Broadcast messages and alerts to users.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 bg-brand-dark text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg"
        >
          <Plus size={18} />
          <span>Create Notification</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand-dark/5">
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" size={20} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-brand-cream/30 border-none rounded-2xl focus:ring-2 focus:ring-brand-gold/20 text-sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-brand-dark/40 italic">No notifications found.</div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-6 rounded-3xl border transition-all flex items-start gap-4 ${
                  notification.isRead ? 'bg-white border-brand-dark/5' : 'bg-brand-gold/5 border-brand-gold/20'
                }`}
              >
                <div className="mt-1">{getTypeIcon(notification.type)}</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-brand-dark">{notification.title}</h3>
                    <span className="text-[10px] text-brand-dark/40 uppercase tracking-widest font-mono">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-brand-dark/60 leading-relaxed">{notification.message}</p>
                </div>
                {!notification.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-dark transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif text-brand-dark">Create Notification</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-brand-cream rounded-full transition-colors">
                  <X size={24} className="text-brand-dark/40" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Title</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                    placeholder="e.g. System Update"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Message</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm resize-none"
                    placeholder="Enter message content..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['info', 'success', 'warning', 'error'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewNotification({...newNotification, type: type as any})}
                        className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${
                          newNotification.type === type 
                            ? 'bg-brand-dark text-white border-brand-dark' 
                            : 'bg-white text-brand-dark/60 border-brand-dark/5 hover:border-brand-gold'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-end space-x-4">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest text-brand-dark/60 hover:bg-brand-cream transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  className="px-10 py-4 bg-brand-dark text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg"
                >
                  Broadcast
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationManager;
