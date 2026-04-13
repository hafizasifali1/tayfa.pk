import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  MoreVertical, 
  Building, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SellerApplication {
  id: string;
  userId: string;
  businessData: {
    companies: {
      name: string;
      registrationNumber: string;
      taxId: string;
      address: string;
      phone: string;
      email: string;
      brands: {
        name: string;
        description: string;
      }[];
    }[];
  };
  status: 'pending' | 'approved' | 'rejected' | 'more_info_requested';
  adminNotes: string;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
    phone: string;
  };
}

const SellerApplications = () => {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState<SellerApplication | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/admin/seller-applications');
      setApplications(response.data);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    if (!user) return;
    setIsProcessing(true);
    try {
      await axios.patch(`/api/admin/seller-applications/${id}`, {
        status,
        adminNotes,
        adminId: user.id
      });
      fetchApplications();
      setSelectedApp(null);
      setAdminNotes('');
    } catch (err) {
      setError('Failed to update application');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = 
      (app.user?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.businessData?.companies || []).some(c => (c.name || '').toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 size={14} />;
      case 'rejected': return <XCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-brand-dark">Seller Applications</h1>
          <p className="text-sm text-brand-dark/60">Review and manage partner registration requests.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/30" size={16} />
            <input
              type="text"
              placeholder="Search sellers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-brand-dark/10 rounded-xl text-sm focus:ring-2 focus:ring-brand-gold/10 transition-all w-64"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-brand-dark/10 rounded-xl text-sm focus:ring-2 focus:ring-brand-gold/10 transition-all"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-brand-dark/5">
          <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="text-brand-dark/20" size={32} />
          </div>
          <h3 className="text-lg font-serif text-brand-dark">No applications found</h3>
          <p className="text-sm text-brand-dark/60">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List View */}
          <div className="lg:col-span-1 space-y-4">
            {filteredApps.map((app) => (
              <motion.button
                key={app.id}
                layoutId={app.id}
                onClick={() => setSelectedApp(app)}
                className={`w-full text-left p-5 rounded-2xl border transition-all ${
                  selectedApp?.id === app.id 
                    ? 'bg-white border-brand-gold shadow-xl shadow-brand-gold/5 ring-1 ring-brand-gold/20' 
                    : 'bg-white border-brand-dark/5 hover:border-brand-gold/30'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-brand-cream rounded-xl flex items-center justify-center text-brand-dark font-bold">
                      {(app.user?.fullName || '?').charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-dark">{app.user?.fullName || 'Unknown'}</h4>
                      <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest">{app.businessData?.companies?.[0]?.name || 'No Company'}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border flex items-center space-x-1 ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    <span>{app.status}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-brand-dark/40 font-medium">
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                  <ChevronRight size={14} className={selectedApp?.id === app.id ? 'text-brand-gold' : 'text-brand-dark/20'} />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Detail View */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedApp ? (
                <motion.div
                  key={selectedApp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white rounded-3xl border border-brand-dark/5 shadow-xl shadow-brand-dark/5 overflow-hidden"
                >
                  <div className="p-8 border-b border-brand-dark/5 bg-brand-cream/5">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center text-2xl text-brand-dark font-bold">
                          {(selectedApp.user?.fullName || '?').charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-xl font-serif text-brand-dark">{selectedApp.user.fullName}</h2>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border flex items-center space-x-1 ${getStatusColor(selectedApp.status)}`}>
                              {getStatusIcon(selectedApp.status)}
                              <span>{selectedApp.status}</span>
                            </span>
                            <span className="text-[10px] text-brand-dark/40 uppercase tracking-widest font-bold">
                              Applied on {new Date(selectedApp.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {selectedApp.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(selectedApp.id, 'rejected')}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-rose-100 transition-colors flex items-center space-x-2"
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(selectedApp.id, 'approved')}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-brand-dark text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors flex items-center space-x-2"
                          >
                            <CheckCircle2 size={14} />
                            <span>Approve</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-2xl border border-brand-dark/5">
                        <Mail size={16} className="text-brand-gold" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Email</p>
                          <p className="text-xs font-medium text-brand-dark">{selectedApp.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-2xl border border-brand-dark/5">
                        <Phone size={16} className="text-brand-gold" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Phone</p>
                          <p className="text-xs font-medium text-brand-dark">{selectedApp.user.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-2xl border border-brand-dark/5">
                        <Building size={16} className="text-brand-gold" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Companies</p>
                          <p className="text-xs font-medium text-brand-dark">{selectedApp.businessData?.companies?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Companies & Brands */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-dark flex items-center">
                        <Building size={16} className="mr-2 text-brand-gold" />
                        Business Details
                      </h3>
                      
                      <div className="space-y-6">
                        {(selectedApp.businessData?.companies || []).map((company, idx) => (
                          <div key={idx} className="p-6 bg-brand-cream/10 rounded-3xl border border-brand-dark/5 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-base font-serif text-brand-dark">{company.name}</h4>
                                <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest font-bold mt-1">
                                  Reg: {company.registrationNumber || 'N/A'} • Tax: {company.taxId || 'N/A'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-2 text-xs text-brand-dark/60">
                              <MapPin size={14} className="shrink-0 mt-0.5" />
                              <span>{company.address}</span>
                            </div>

                            <div className="pt-4 border-t border-brand-dark/5">
                              <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 mb-3">Brands</p>
                              <div className="flex flex-wrap gap-2">
                                {company.brands.map((brand, bIdx) => (
                                  <div key={bIdx} className="px-3 py-1.5 bg-white border border-brand-dark/5 rounded-lg">
                                    <p className="text-[11px] font-bold text-brand-dark">{brand.name}</p>
                                    {brand.description && (
                                      <p className="text-[9px] text-brand-dark/40 mt-0.5">{brand.description}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="space-y-4 pt-8 border-t border-brand-dark/5">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-dark flex items-center">
                        <MessageSquare size={16} className="mr-2 text-brand-gold" />
                        Admin Review Notes
                      </h3>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add internal notes about this application..."
                        className="w-full p-4 bg-brand-cream/20 border border-brand-dark/5 rounded-2xl text-sm focus:ring-2 focus:ring-brand-gold/10 transition-all resize-none h-32"
                      />
                      {selectedApp.adminNotes && (
                        <div className="p-4 bg-brand-cream/10 rounded-2xl border border-brand-dark/5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-2">Previous Notes</p>
                          <p className="text-xs text-brand-dark/60 italic">{selectedApp.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 bg-brand-cream/5 rounded-3xl border border-brand-dark/5 border-dashed">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg shadow-brand-dark/5 mb-6">
                    <ChevronRight size={32} className="text-brand-dark/20" />
                  </div>
                  <h3 className="text-lg font-serif text-brand-dark">Select an application</h3>
                  <p className="text-sm text-brand-dark/60">Choose a partner request from the left to review details.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerApplications;
