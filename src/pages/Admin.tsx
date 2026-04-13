import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Image as ImageIcon, 
  Settings, 
  FileText, 
  Truck, 
  RotateCcw, 
  Globe, 
  DollarSign, 
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'brands', label: 'Brands', icon: ImageIcon },
    { id: 'blogs', label: 'Blogs', icon: FileText },
    { id: 'shipping', label: 'Shipping Policy', icon: Truck },
    { id: 'returns', label: 'Returns & Exchanges', icon: RotateCcw },
    { id: 'currency', label: 'Currency & Country', icon: Globe },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'seo', label: 'SEO Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-brand-dark text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          {isSidebarOpen && <span className="text-xl font-serif font-bold tracking-widest">ADMIN</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded">
            <LayoutDashboard size={20} />
          </button>
        </div>
        
        <nav className="flex-grow py-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-4 px-6 py-4 transition-colors ${
                activeTab === item.id ? 'bg-brand-gold text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif capitalize">{activeTab.replace('-', ' ')}</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your website content and settings</p>
          </div>
          <button className="bg-brand-dark text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-brand-gold transition-all">
            <Plus size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Add New</span>
          </button>
        </header>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 min-h-[600px]">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Products', value: '124', icon: Package, color: 'blue' },
                { label: 'Active Promotions', value: '5', icon: Tag, color: 'green' },
                { label: 'Blog Posts', value: '12', icon: FileText, color: 'purple' },
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-${stat.color}-100 text-${stat.color}-600`}>
                      <stat.icon size={24} />
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
                  <p className="text-3xl font-serif mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
              <Package size={48} className="mb-4 opacity-20" />
              <p className="text-sm italic">Content management for {activeTab} is being initialized...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
