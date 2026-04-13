import React, { useState, useEffect } from 'react';
import { 
  Bell, Shield, Megaphone, Mail, Save, RefreshCcw, 
  CheckCircle2, AlertCircle, Info, ChevronRight,
  Globe, Lock, Eye, EyeOff, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Settings state
  const [settings, setSettings] = useState({
    announcement: {
      text: 'Welcome to TAYFA! New seasonal collections are now live.',
      isActive: true,
      type: 'info'
    },
    moderation: {
      autoApproveProducts: false,
      flagKeywords: 'fake, scam, cheap, replica',
      requireSellerVerification: true,
      maxProductsPerSeller: 50
    },
    emailTemplates: {
      welcome: 'Dear {name}, welcome to TAYFA...',
      orderConfirmation: 'Your order #{orderId} has been confirmed...',
      sellerApproval: 'Congratulations! Your seller account has been approved...'
    },
    notificationSettings: {
      newOrderAlerts: true,
      sellerRegistration: true,
      productFlagged: true,
      lowStockAlerts: true
    }
  });

  useEffect(() => {
    fetchSettings();
    fetchNotifications();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/admin/settings');
      if (Array.isArray(response.data)) {
        const newSettings = { ...settings };
        response.data.forEach((s: any) => {
          try {
            const value = JSON.parse(s.value);
            if (s.key === 'announcement') newSettings.announcement = value;
            if (s.key === 'moderation') newSettings.moderation = value;
            if (s.key === 'emailTemplates') newSettings.emailTemplates = value;
            if (s.key === 'notificationSettings') newSettings.notificationSettings = value;
          } catch (e) {
            console.error('Error parsing setting:', s.key, e);
          }
        });
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      if (Array.isArray(response.data)) {
        setNotifications(response.data.slice(0, 10)); // Top 10
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save each category of settings
      const categories = [
        { key: 'announcement', value: settings.announcement },
        { key: 'moderation', value: settings.moderation },
        { key: 'emailTemplates', value: settings.emailTemplates },
        { key: 'notificationSettings', value: settings.notificationSettings }
      ];

      for (const cat of categories) {
        await axios.post('/api/admin/settings', {
          key: cat.key,
          value: JSON.stringify(cat.value)
        });
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'moderation', label: 'Moderation', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'emails', label: 'Email Templates', icon: Mail },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif mb-4">Platform Settings</h1>
          <p className="text-brand-dark/60">Configure application-wide policies and content.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-3 bg-brand-dark text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg disabled:opacity-50"
        >
          {isSaving ? <RefreshCcw size={20} className="animate-spin" /> : <Save size={20} />}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center space-x-3"
        >
          <CheckCircle2 size={20} className="text-emerald-500" />
          <span className="font-medium">Settings updated successfully!</span>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Tabs */}
        <aside className="lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-brand-gold shadow-sm font-bold' 
                  : 'text-brand-dark/40 hover:bg-white/50 hover:text-brand-dark'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-sm uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="flex-grow bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-brand-dark/5">
          {activeTab === 'general' && (
            <div className="space-y-10">
              <h3 className="text-2xl font-serif border-b border-brand-dark/5 pb-6">General Platform Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Platform Name</label>
                  <input 
                    type="text" 
                    defaultValue="TAYFA Luxury Marketplace"
                    className="w-full bg-brand-cream/50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Support Email</label>
                  <input 
                    type="email" 
                    defaultValue="support@tayfa.com"
                    className="w-full bg-brand-cream/50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-bold uppercase tracking-widest text-brand-dark">Maintenance Mode</h4>
                <div className="flex items-center justify-between p-6 bg-brand-cream/30 rounded-3xl border border-brand-dark/5">
                  <div className="space-y-1">
                    <p className="font-bold">Enable Maintenance Mode</p>
                    <p className="text-xs text-brand-dark/60">Restrict access to the platform for all users except administrators.</p>
                  </div>
                  <button className="w-14 h-8 bg-brand-dark/10 rounded-full relative transition-colors">
                    <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-10">
              <h3 className="text-2xl font-serif border-b border-brand-dark/5 pb-6">Site-wide Announcements</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-brand-dark">Active Announcement</h4>
                  <button 
                    onClick={() => setSettings({...settings, announcement: {...settings.announcement, isActive: !settings.announcement.isActive}})}
                    className={`w-14 h-8 rounded-full relative transition-colors ${settings.announcement.isActive ? 'bg-brand-gold' : 'bg-brand-dark/10'}`}
                  >
                    <motion.div 
                      animate={{ x: settings.announcement.isActive ? 24 : 0 }}
                      className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm" 
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Message Content</label>
                  <textarea 
                    value={settings.announcement.text}
                    onChange={(e) => setSettings({...settings, announcement: {...settings.announcement, text: e.target.value}})}
                    rows={4}
                    className="w-full bg-brand-cream/50 border-none rounded-3xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/20 resize-none"
                    placeholder="Enter announcement text..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['info', 'success', 'warning'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSettings({...settings, announcement: {...settings.announcement, type}})}
                      className={`px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all ${
                        settings.announcement.type === type 
                          ? 'bg-brand-dark text-white border-brand-dark shadow-md' 
                          : 'bg-white text-brand-dark/60 border-brand-dark/5 hover:border-brand-gold'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-brand-cream/30 rounded-3xl border border-brand-dark/5 flex items-start space-x-4">
                <Info size={20} className="text-brand-gold flex-shrink-0 mt-1" />
                <p className="text-sm text-brand-dark/60 leading-relaxed">
                  Announcements are displayed as a banner at the top of every page for all visitors. Use them for important updates, sales, or maintenance alerts.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="space-y-10">
              <h3 className="text-2xl font-serif border-b border-brand-dark/5 pb-6">Content Moderation Policies</h3>
              
              <div className="space-y-6">
                {[
                  { 
                    key: 'autoApproveProducts', 
                    label: 'Auto-Approve Products', 
                    desc: 'Automatically publish products from trusted sellers without manual review.' 
                  },
                  { 
                    key: 'requireSellerVerification', 
                    label: 'Require Identity Verification', 
                    desc: 'Sellers must complete ID verification before they can list products.' 
                  }
                ].map((policy) => (
                  <div key={policy.key} className="flex items-center justify-between p-6 bg-brand-cream/30 rounded-3xl border border-brand-dark/5">
                    <div className="space-y-1">
                      <p className="font-bold">{policy.label}</p>
                      <p className="text-xs text-brand-dark/60">{policy.desc}</p>
                    </div>
                    <button 
                      onClick={() => setSettings({
                        ...settings, 
                        moderation: {
                          ...settings.moderation, 
                          //@ts-ignore
                          [policy.key]: !settings.moderation[policy.key]
                        }
                      })}
                      className={`w-14 h-8 rounded-full relative transition-colors ${
                        //@ts-ignore
                        settings.moderation[policy.key] ? 'bg-brand-gold' : 'bg-brand-dark/10'
                      }`}
                    >
                      <motion.div 
                        //@ts-ignore
                        animate={{ x: settings.moderation[policy.key] ? 24 : 0 }}
                        className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm" 
                      />
                    </button>
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Flagged Keywords</label>
                  <input 
                    type="text" 
                    value={settings.moderation.flagKeywords}
                    onChange={(e) => setSettings({...settings, moderation: {...settings.moderation, flagKeywords: e.target.value}})}
                    className="w-full bg-brand-cream/50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/20"
                    placeholder="Enter keywords separated by commas..."
                  />
                  <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest font-bold">Products containing these words will be automatically flagged for review.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Max Products per Seller</label>
                  <input 
                    type="number" 
                    value={settings.moderation.maxProductsPerSeller}
                    onChange={(e) => setSettings({...settings, moderation: {...settings.moderation, maxProductsPerSeller: parseInt(e.target.value)}})}
                    className="w-full bg-brand-cream/50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'emails' && (
            <div className="space-y-10">
              <h3 className="text-2xl font-serif border-b border-brand-dark/5 pb-6">Email Notification Templates</h3>
              
              <div className="space-y-8">
                {Object.entries(settings.emailTemplates).map(([key, value]) => (
                  <div key={key} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-brand-dark capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                      <button className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-dark transition-colors">Preview Template</button>
                    </div>
                    <textarea 
                      value={value}
                      onChange={(e) => setSettings({
                        ...settings, 
                        emailTemplates: {...settings.emailTemplates, [key]: e.target.value}
                      })}
                      rows={6}
                      className="w-full bg-brand-cream/50 border-none rounded-3xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/20 font-mono text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      {['{name}', '{orderId}', '{date}', '{total}'].map(tag => (
                        <span key={tag} className="px-2 py-1 bg-brand-dark/5 rounded text-[10px] font-mono text-brand-dark/60">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-10">
              <h3 className="text-2xl font-serif border-b border-brand-dark/5 pb-6">System Notifications</h3>
              
              <div className="space-y-6">
                {[
                  { key: 'newOrderAlerts', label: 'New Order Alerts', desc: 'Notify admins when a new order is placed.' },
                  { key: 'sellerRegistration', label: 'Seller Registration', desc: 'Notify admins when a new seller applies.' },
                  { key: 'productFlagged', label: 'Product Flagged', desc: 'Notify admins when a product is flagged by the system.' },
                  { key: 'lowStockAlerts', label: 'Low Stock Alerts', desc: 'Notify sellers when their stock is low.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-6 bg-brand-cream/30 rounded-3xl border border-brand-dark/5">
                    <div className="space-y-1">
                      <p className="font-bold">{item.label}</p>
                      <p className="text-xs text-brand-dark/60">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => setSettings({
                        ...settings,
                        notificationSettings: {
                          ...settings.notificationSettings,
                          [item.key]: !((settings.notificationSettings as any)[item.key])
                        }
                      })}
                      className={`w-14 h-8 rounded-full relative transition-colors ${
                        (settings.notificationSettings as any)[item.key] ? 'bg-brand-gold' : 'bg-brand-dark/10'
                      }`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${
                        (settings.notificationSettings as any)[item.key] ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <h4 className="text-xl font-serif mb-6">Recent Notifications</h4>
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-brand-dark/40 italic bg-brand-cream/10 rounded-3xl border border-dashed border-brand-dark/10">
                      No recent notifications.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-4 bg-white rounded-2xl border border-brand-dark/5 flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          n.type === 'order' ? 'bg-emerald-100 text-emerald-600' :
                          n.type === 'system' ? 'bg-blue-100 text-blue-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          <Bell size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-sm truncate">{n.title}</p>
                            <span className="text-[10px] text-brand-dark/40">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-brand-dark/60 line-clamp-1">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
