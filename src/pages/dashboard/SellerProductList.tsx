import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Price from '../../components/common/Price';
import axios from 'axios';
import { 
  Plus, 
  Package, 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';

const SellerProductList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, productId: string | null, isBulk: boolean }>({
    isOpen: false,
    productId: null,
    isBulk: false
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const getProductImage = (images: any) => {
    if (!images) return null;
    try {
      const parsed = typeof images === 'string' ? JSON.parse(images) : images;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      if (typeof parsed === 'string' && parsed.length > 10) return parsed;
      return null;
    } catch (e) {
      if (typeof images === 'string' && images.length > 10) return images;
      return null;
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchProducts = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/products?sellerId=${user.id}`);
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user?.id]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [products, statusFilter, searchQuery]);

  const deleteProduct = async (id: string) => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      setNotification({ type: 'success', message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      setNotification({ type: 'error', message: 'Failed to delete product' });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = async (product: any) => {
    const newStatus = product.status === 'published' ? 'archived' : 'published';
    try {
      const response = await axios.patch(`/admin/products/${product.id}`, { status: newStatus });
      setProducts(prev => prev.map(p => p.id === product.id ? response.data : p));
      setNotification({ type: 'success', message: `Product ${newStatus === 'published' ? 'Published' : 'Archived'} successfully` });
    } catch (error) {
      console.error('Error updating status:', error);
      setNotification({ type: 'error', message: 'Failed to update status' });
    }
  };

  const confirmDeleteAction = async () => {
    if (deleteModal.isBulk) {
      if (selectedIds.length === 0) return;
      try {
        setIsDeleting(true);
        await axios.post('/api/products/bulk-delete', { ids: selectedIds });
        setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
        setNotification({ type: 'success', message: `${selectedIds.length} products deleted successfully` });
      } catch (error) {
        console.error('Error bulk deleting products:', error);
        setNotification({ type: 'error', message: 'Failed to bulk delete products' });
      } finally {
        setIsDeleting(false);
      }
    } else if (deleteModal.productId) {
      await deleteProduct(deleteModal.productId);
    }
    setDeleteModal({ isOpen: false, productId: null, isBulk: false });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full"
        />
        <p className="text-brand-dark/40 font-bold uppercase tracking-[0.2em] text-[10px]">Loading Products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center space-x-3 ${
              notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-bold tracking-wide">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null, isBulk: false })}
        onConfirm={confirmDeleteAction}
        title={deleteModal.isBulk ? "Delete Selected Products?" : "Delete Product?"}
        message={
          deleteModal.isBulk 
            ? `Are you sure you want to delete ${selectedIds.length} products? This action cannot be undone.`
            : "Are you sure you want to delete this product? All its data will be permanently removed."
        }
        confirmText="Permanently Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-brand-dark/5">
        <div>
          <h1 className="text-4xl sm:text-5xl font-serif text-brand-dark">Product</h1>
          <p className="text-brand-dark/60 mt-3 text-lg font-light italic">Detailed list view of your luxury product collection.</p>
        </div>
        
        <Link to="/seller/add-product">
          <Button icon={<Plus size={20} />} className="shadow-xl shadow-brand-dark/10 py-3.5 px-8 text-sm uppercase tracking-widest font-bold bg-brand-dark hover:bg-brand-gold text-white">
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 relative group flex items-center">
          <Search size={18} className="absolute left-6 text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Search Products by Name, Brand, or Category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border border-brand-dark/5 rounded-[2rem] text-xs font-medium focus:outline-none focus:ring-4 focus:ring-brand-gold/5 focus:border-brand-gold/20 transition-all placeholder:text-brand-dark/20 shadow-sm"
          />
        </div>
        
        <div className="lg:col-span-7 flex flex-wrap items-center justify-start lg:justify-end gap-3">
          {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
                statusFilter === status
                  ? 'bg-brand-dark text-white border-brand-dark shadow-xl shadow-brand-dark/10 scale-105'
                  : 'bg-white text-brand-dark/40 border-brand-dark/5 hover:border-brand-gold/30 hover:text-brand-dark'
              }`}
            >
              {status} Product
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center justify-between bg-brand-dark text-white p-6 rounded-[2rem] shadow-2xl"
          >
            <div className="flex items-center space-x-6">
              <span className="text-sm font-bold uppercase tracking-widest text-brand-gold">{selectedIds.length} Selected</span>
              <div className="w-px h-6 bg-white/10" />
              <Button 
                variant="danger" 
                size="sm" 
                icon={<Trash2 size={16} />} 
                onClick={() => setDeleteModal({ isOpen: true, productId: null, isBulk: true })}
                loading={isDeleting}
              >
                Delete Selected
              </Button>
            </div>
            <button 
              onClick={() => setSelectedIds([])}
              className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Section */}
      <Card className="p-0 border-brand-dark/5 shadow-2xl shadow-brand-dark/5 rounded-[2.5rem] overflow-hidden">
        <Table headers={[
          <input 
            type="checkbox" 
            checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
            onChange={toggleSelectAll}
            className="w-5 h-5 rounded-lg border-brand-dark/10 text-brand-gold focus:ring-brand-gold/20"
          />,
          'Product Information', 'Pricing & Category', 'Inventory', 'Status', 'Actions'
        ]}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <tr key={product.id} className={`hover:bg-brand-cream/10 transition-colors group ${selectedIds.includes(product.id) ? 'bg-brand-gold/5' : ''}`}>
                <td className="px-10 py-8">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleSelectProduct(product.id)}
                    className="w-5 h-5 rounded-lg border-brand-dark/10 text-brand-gold focus:ring-brand-gold/20"
                  />
                </td>
                <td className="px-10 py-8">
                  <Link to={`/seller/edit-product/${product.id}`} className="flex items-center space-x-6 group/item cursor-pointer">
                    <div className="w-20 h-20 rounded-3xl overflow-hidden border border-brand-dark/5 shadow-sm flex-shrink-0 bg-brand-cream/50 relative group-hover/item:scale-105 transition-transform">
                      {getProductImage(product.images) ? (
                        <img 
                          src={getProductImage(product.images)!} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1539109132381-31a1ecdd7ce9?q=80&w=800&auto=format&fit=crop';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-dark/10">
                          <Package size={32} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-brand-dark group-hover/item:text-brand-gold transition-colors truncate">{product.name}</p>
                      <p className="text-[10px] text-brand-dark/40 uppercase tracking-[0.2em] font-bold mt-1 flex items-center">
                        <span className="text-brand-gold mr-2">/</span> {product.brand || 'No Brand'}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="px-10 py-8">
                  <div className="space-y-2">
                    <Price amount={product.price} currency={product.currency} className="text-lg font-serif italic text-brand-dark" />
                    <p className="text-[10px] text-brand-dark/30 uppercase tracking-[0.1em] font-medium">
                      {product.category || 'Uncategorized'}
                    </p>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${product.stock < 10 ? 'text-rose-500' : 'text-brand-dark/40'}`}>
                        {product.stock} in stock
                      </span>
                    </div>
                    <div className="w-24 h-1 bg-brand-cream/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                        className={`h-full ${product.stock < 10 ? 'bg-rose-500' : 'bg-brand-gold'}`} 
                      />
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <Badge 
                    variant={product.status === 'published' ? 'success' : product.status === 'archived' ? 'danger' : 'warning'} 
                    className="text-[10px] px-4 py-1.5 rounded-full"
                  >
                    {product.status}
                  </Badge>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex items-center justify-end space-x-3 transition-opacity">
                    <Link to={`/seller/edit-product/${product.id}`}>
                      <Button variant="ghost" size="icon" icon={<Edit size={16} />} className="hover:bg-brand-gold hover:text-white transition-all shadow-sm" />
                    </Link>
                    {/* Removed View In Store icon */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      icon={<Plus size={16} className={`transition-transform duration-300 ${product.status === 'published' ? 'rotate-45' : ''}`} />} 
                      onClick={() => toggleStatus(product)}
                      className={`hover:bg-brand-cream transition-all shadow-sm ${product.status === 'published' ? 'text-rose-500' : 'text-emerald-500'}`}
                      title={product.status === 'published' ? 'Archive Product' : 'Publish Product'}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      icon={<Trash2 size={16} />} 
                      onClick={() => setDeleteModal({ isOpen: true, productId: product.id, isBulk: false })}
                      className="hover:bg-rose-500 hover:text-white transition-all text-rose-400 shadow-sm"
                      title="Delete Product"
                    />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-10 py-32 text-center">
                <div className="flex flex-col items-center justify-center space-y-6 text-brand-dark/20 p-20 bg-brand-cream/5 rounded-[3rem] border-2 border-dashed border-brand-dark/5">
                  <div className="w-24 h-24 bg-brand-cream/30 rounded-[2rem] flex items-center justify-center">
                    <Package size={48} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-serif italic text-brand-dark/40">No items found matching your criteria.</p>
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">Try adjusting your filters or search query.</p>
                  </div>
                  <Link to="/seller/add-product">
                    <Button>Add Your First Product</Button>
                  </Link>
                </div>
              </td>
            </tr>
          )}
        </Table>
        
        {/* Pagination Placeholder */}
        <div className="px-10 py-8 border-t border-brand-dark/5 bg-brand-cream/5 flex items-center justify-between">
          <p className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-widest">
            Showing {filteredProducts.length} of {products.length} Products
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl" disabled><ChevronLeft size={16} /></Button>
            <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl" disabled><ChevronRight size={16} /></Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SellerProductList;
