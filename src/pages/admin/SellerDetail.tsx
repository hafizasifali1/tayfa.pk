import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { 
  ArrowLeft, 
  Building, 
  Globe, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  FileText, 
  MessageSquare, 
  Share2, 
  Layout, 
  User, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  AlertCircle,
  FileIcon,
  ShieldCheck,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useAuth } from '../../context/AuthContext';

// --- Skeleton Loading Component ---
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-brand-dark/5 p-8 animate-pulse space-y-4">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-100 rounded-xl" />
      <div className="space-y-2">
        <div className="w-32 h-4 bg-gray-100 rounded" />
        <div className="w-24 h-3 bg-gray-50 rounded" />
      </div>
    </div>
    <div className="space-y-3 pt-4 border-t border-gray-50">
      <div className="w-full h-3 bg-gray-50 rounded" />
      <div className="w-full h-3 bg-gray-50 rounded" />
      <div className="w-3/4 h-3 bg-gray-50 rounded" />
    </div>
  </div>
);

interface Brand {
  id: string;
  name: string;
  description: string;
  website: string;
}

interface Company {
  id: string;
  name: string;
  registrationNumber: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
  brands: Brand[];
}

interface SellerDetailData {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    createdAt: string;
    lastLogin?: string;
  };
  application: {
    id: string;
    businessData: {
      category: string;
      customCategory?: string;
      overviewDocumentUrl?: string;
      overviewDocumentName?: string;
      gender?: string;
      dateOfBirth?: string;
    };
    status: string;
    adminNotes: string;
    reviewedAt?: string;
    createdAt: string;
  };
  companies: Company[];
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
  } | null;
}

const SellerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [data, setData] = useState<SellerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Notes state
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchSellerDetails();
  }, [id]);

  const fetchSellerDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/admin/sellers/${id}`);
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch seller details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await axios.patch(`/api/admin/sellers/${id}/approve`, {
        adminId: currentUser?.id
      });
      setIsApproveModalOpen(false);
      fetchSellerDetails();
      // In a real app, use a toast here
      alert('Seller approved successfully!');
    } catch (err) {
      alert('Failed to approve seller');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert('Please provide a reason for rejection');
      return;
    }
    setIsProcessing(true);
    try {
      await axios.patch(`/api/admin/sellers/${id}/reject`, {
        reason: rejectReason,
        adminId: currentUser?.id
      });
      setIsRejectModalOpen(false);
      fetchSellerDetails();
      alert('Seller application rejected');
    } catch (err) {
      alert('Failed to reject application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteText) return;
    try {
      // Re-using the admin PATCH endpoint to update notes
      await axios.patch(`/api/admin/users/${id}`, {
        // This is a simple way since we don't have a dedicated notes table/endpoint yet
        // In reality, notes should be in seller_applications.admin_notes
        // We'll update the application notes instead
      });
      
      // Since we don't have a specific notes timeline storage yet, we'll just mock it or 
      // simple update the adminNotes field in seller_applications
      await axios.patch(`/api/admin/seller-applications/${data?.application?.id}`, {
        adminNotes: noteText,
        adminId: currentUser?.id
      });
      
      setNoteText('');
      fetchSellerDetails();
      alert('Notes updated');
    } catch (err) {
      alert('Failed to save note');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
            <CheckCircle2 size={12} />
            <span>Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
            <XCircle size={12} />
            <span>Rejected</span>
          </div>
        );
      case 'pending':
        return (
          <motion.div 
            animate={{ opacity: [1, 0.6, 1] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Pending</span>
          </motion.div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 border border-gray-100 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
            <span>{status}</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-10 p-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
          <div className="w-48 h-10 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="space-y-8">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h2 className="text-2xl font-serif text-brand-dark mb-2">Error Loading Seller</h2>
        <p className="text-brand-dark/40 mb-8">{error}</p>
        <Button onClick={() => navigate('/admin/users')}>Back to Users</Button>
      </div>
    );
  }

  const { user, application, companies, stats } = data;

  return (
    <div className="max-w-[1440px] mx-auto px-4 pt-2 pb-8 md:px-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">
        <Link to="/admin/dashboard" className="hover:text-brand-gold transition-colors">Admin</Link>
        <ChevronRight size={10} />
        <Link to="/admin/users" className="hover:text-brand-gold transition-colors">User Management</Link>
        <ChevronRight size={10} />
        <span className="text-brand-dark">Seller Detail</span>
        <ChevronRight size={10} />
        <span className="text-brand-gold">{user.fullName}</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
        <div className="flex items-center gap-6">

          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-brand-gold text-white flex items-center justify-center font-serif text-3xl font-bold shadow-xl shadow-brand-gold/20">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-serif text-brand-dark mb-2">{user.fullName}</h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-brand-dark/60">
                  <Mail size={14} className="text-brand-gold" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-xs font-medium text-brand-dark/60">
                    <Phone size={14} className="text-brand-gold" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs font-medium text-brand-dark/60">
                  <Calendar size={14} className="text-brand-gold" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                {getStatusBadge(user.status)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {user.status === 'pending' || user.status === 'rejected' ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsRejectModalOpen(true)}
                className="px-8 py-4 bg-white border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm flex items-center gap-2"
              >
                <XCircle size={14} />
                Reject
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsApproveModalOpen(true)}
                className="px-8 py-4 bg-brand-gold text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:shadow-xl hover:shadow-brand-gold/30 transition-all flex items-center gap-2"
              >
                <CheckCircle2 size={14} />
                Approve Seller
              </motion.button>
            </>
          ) : null}
        </div>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-10"
      >
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Personal Information */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <Card className="p-8 border-brand-dark/5 shadow-xl shadow-brand-dark/2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 bg-brand-gold h-12" />
              <div className="flex items-center gap-4 mb-4 bg-brand-cream/10 -mx-8 -mt-8 p-6 border-b border-brand-dark/5">
                <div className="w-10 h-10 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold shadow-inner shadow-brand-gold/20">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold uppercase tracking-[0.3em] text-brand-gold">Personal Information</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Full Name</p>
                    <p className="text-sm font-medium text-brand-dark">{user.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Email Address</p>
                    <p className="text-sm font-medium text-brand-dark">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Joined Date</p>
                    <p className="text-sm font-medium text-brand-dark">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Phone Number</p>
                    <p className="text-sm font-medium text-brand-dark">{user.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Company Information */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-3 ml-2">
              <div className="w-10 h-10 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold shadow-inner shadow-brand-gold/20">
                <Building size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-[0.3em] text-brand-gold">Company & Brand Assets</h3>
              </div>
            </div>

            {(() => {
              const displayCompanies = companies.length > 0 ? companies : (application?.businessData?.companies || []);
              
              if (displayCompanies.length === 0) {
                return (
                  <Card className="p-16 text-center border-brand-dark/10 bg-brand-cream/10 border-dashed">
                    <Building className="mx-auto text-brand-dark/10 mb-6" size={64} />
                    <p className="text-lg font-serif text-brand-dark/30 italic">No companies or brands associated with this application.</p>
                    <p className="text-[10px] uppercase tracking-widest text-brand-dark/20 mt-2 font-bold font-sans">Contact seller for missing documentation</p>
                  </Card>
                );
              }
              return displayCompanies.map((company, cIndex) => (
                <div key={company.id || cIndex} className="space-y-6">
                  {/* Company Card */}
                  <Card className="p-8 border-brand-dark/5 border-l-4 border-l-brand-gold shadow-xl shadow-brand-dark/2">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h4 className="text-2xl font-serif text-brand-dark mb-1">{company.name}</h4>
                        <div className="px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-lg inline-block">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-gold">Business Unit</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Reg. Number</p>
                            <p className="text-sm font-medium text-brand-dark">{company.registrationNumber || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Tax ID</p>
                            <p className="text-sm font-medium text-brand-dark">{company.taxId || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Full Address</p>
                          <p className="text-sm font-medium text-brand-dark leading-relaxed">{company.address || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Company Phone</p>
                          <p className="text-sm font-medium text-brand-dark">{company.phone || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Company Email</p>
                          <p className="text-sm font-medium text-brand-dark">{company.email || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Brands under this company */}
                    <div className="mt-10 pt-8 border-t border-brand-dark/5">
                      <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mb-6 flex items-center gap-2 underline underline-offset-8 decoration-brand-gold/20">
                        <div className="w-5 h-px bg-brand-gold/30" />
                        Registered Brands Assets
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {company.brands.length === 0 ? (
                          <div className="p-4 bg-brand-cream/20 rounded-xl text-center border border-brand-dark/5">
                            <p className="text-[10px] text-brand-dark/30 uppercase tracking-widest">No brands registered</p>
                          </div>
                        ) : (
                          company.brands.map((brand, bIndex) => (
                            <div key={brand.id || bIndex} className="p-5 bg-brand-cream/10 rounded-2xl border border-brand-dark/5 border-l-4 border-l-brand-gold group hover:bg-white hover:shadow-lg transition-all">
                              <div className="flex justify-between items-start mb-3">
                                <h6 className="text-sm font-bold text-brand-dark">{brand.name}</h6>
                                {brand.website && (
                                  <a href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`} 
                                     target="_blank" rel="noopener noreferrer"
                                     className="text-brand-dark/20 hover:text-brand-gold transition-colors"
                                  >
                                    <Globe size={14} />
                                  </a>
                                )}
                              </div>
                              <p className="text-xs text-brand-dark/50 leading-relaxed italic">{brand.description || 'No description provided.'}</p>
                              {brand.website && (
                                <div className="mt-3 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span>Visit Website</span>
                                  <ChevronRight size={10} />
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ));
            })()}
          </motion.div>

          {/* Business Verification */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <Card className="p-8 border-brand-dark/5 shadow-xl shadow-brand-dark/2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 bg-brand-gold h-12" />
              <div className="flex items-center gap-4 mb-10 bg-brand-cream/10 -mx-8 -mt-8 p-6 border-b border-brand-dark/5">
                <div className="w-10 h-10 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold shadow-inner shadow-brand-gold/20">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold uppercase tracking-[0.3em] text-brand-gold">Business Verification</h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/30 mt-0.5">Application Status & Compliance Review</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-gold border-l-2 border-brand-gold pl-3">Business Category</p>
                    <div className="px-6 py-4 bg-brand-dark text-white rounded-2xl text-xs font-bold inline-block uppercase tracking-[0.3em] shadow-xl shadow-brand-dark/30 border border-brand-gold/20">
                      {application?.businessData?.category === 'Other' ? application.businessData.customCategory : application?.businessData?.category}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-dark/30 ml-1 italic">Verification Documents</p>
                    {application?.businessData?.overviewDocumentUrl ? (
                      <div className="flex items-center gap-4 p-4 bg-brand-cream/30 rounded-2xl border border-brand-dark/5">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-gold shadow-sm">
                          <FileText size={24} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-bold text-brand-dark truncate">{application.businessData.overviewDocumentName || 'Overview_Document.pdf'}</p>
                          <p className="text-[10px] text-brand-dark/40 font-mono">UPLOADED: {new Date(application.createdAt).toLocaleDateString()}</p>
                        </div>
                        <a 
                          href={application.businessData.overviewDocumentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          download
                          className="p-3 bg-brand-dark text-white rounded-xl hover:bg-brand-gold transition-colors shadow-lg shadow-brand-dark/10"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 p-4 bg-brand-cream/30 rounded-2xl border border-brand-dark/5 border-dashed">
                        <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center text-brand-dark/10">
                          <FileIcon size={24} />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/20">No document uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-10">
          
          {/* Account Status & Timeline */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <Card className="p-6 border-brand-dark/5 shadow-xl shadow-brand-dark/5 bg-brand-dark text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-brand-gold">
                  <Clock size={16} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Review History</h3>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-brand-gold shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
                    <div className="w-px h-8 bg-white/10 mt-1" />
                  </div>
                  <div className="pb-2">
                    <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Received</p>
                    <p className="text-[11px] font-semibold text-white">{new Date(application.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${application.reviewedAt ? 'bg-brand-gold' : 'bg-white/10'}`} />
                    <div className="w-px h-8 bg-white/10 mt-1" />
                  </div>
                  <div className="pb-2">
                    <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Processed</p>
                    <p className="text-[11px] font-semibold text-white">{application.reviewedAt ? new Date(application.reviewedAt).toLocaleDateString() : 'Pending'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${application.status !== 'pending' ? (application.status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-white/10'}`} />
                  </div>
                  <div>
                    <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Status</p>
                    <p className="text-[11px] font-semibold text-white uppercase tracking-wider">
                      {application.status === 'pending' ? 'Decision Pending' : (application.status === 'approved' ? 'Approved' : 'Rejected')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>



          {/* Quick Stats (If Approved) */}
          {user.status === 'active' && stats && (
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >
              <Card className="p-8 border-brand-dark/5 shadow-xl shadow-brand-dark/2 overflow-hidden bg-brand-cream/5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <BarChart3 size={16} />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Performance Glance</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-brand-dark/5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><Package size={18} /></div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 text-left">Products</p>
                    </div>
                    <p className="text-lg font-serif font-bold text-brand-dark">{stats.totalProducts}</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-brand-dark/5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><ShoppingCart size={18} /></div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 text-left">Orders</p>
                    </div>
                    <p className="text-lg font-serif font-bold text-brand-dark">{stats.totalOrders}</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-brand-dark text-white rounded-2xl border border-brand-dark/5 shadow-xl shadow-brand-dark/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center"><CheckCircle2 size={18} /></div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 text-left">Total Revenue</p>
                    </div>
                    <p className="text-lg font-serif font-bold text-brand-gold">PKR {stats.totalRevenue.toLocaleString()}</p>
                  </div>
                
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApprove}
        isLoading={isProcessing}
        title="Approve Seller"
        message={`Are you sure you want to approve ${user.fullName} as an official TAYFA seller? This will grant them access to the seller dashboard and allowed them to list products.`}
        confirmText="Approve Now"
        variant="primary"
      />

      {/* Rejection Modal with Reason */}
      <AnimatePresence>
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-10 bg-rose-50 text-rose-600">
                <XCircle size={48} className="mb-4 opacity-50" />
                <h2 className="text-3xl font-serif">Reject Application</h2>
                <p className="text-rose-600/60 text-xs mt-1 font-medium italic">Please provide a valid reason for declining this partner's request.</p>
              </div>

              <div className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-1">Rejection Reason (Required)</label>
                  <textarea 
                    autoFocus
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Business documents were invalid or expired..."
                    className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 py-5 text-sm focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500/20 transition-all outline-none h-40 resize-none h-40"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsRejectModalOpen(false)}
                    className="flex-1 py-4 border border-brand-dark/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-brand-dark hover:bg-brand-cream/30 transition-all outline-none"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleReject}
                    disabled={!rejectReason || isProcessing}
                    className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-500/30 transition-all outline-none disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SellerDetail;
