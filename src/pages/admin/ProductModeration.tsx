import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, CheckCircle2, XCircle, Eye, MoreVertical, 
  Package, Shield, AlertCircle, LayoutGrid, List, Kanban 
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Product } from '../../types';
import Price from '../../components/common/Price';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { productService } from '../../services/api';

const getProductImage = (images: any) => {
  if (!images) return 'https://images.unsplash.com/photo-1539109132381-31a1ecdd7ce9?q=80&w=800&auto=format&fit=crop';
  try {
    const parsed = typeof images === 'string' ? JSON.parse(images) : images;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    if (typeof parsed === 'string' && parsed.length > 10) return parsed;
    return 'https://images.unsplash.com/photo-1539109132381-31a1ecdd7ce9?q=80&w=800&auto=format&fit=crop';
  } catch (e) {
    if (typeof images === 'string' && images.length > 10) return images;
    return 'https://images.unsplash.com/photo-1539109132381-31a1ecdd7ce9?q=80&w=800&auto=format&fit=crop';
  }
};

const SortableProductCard = ({ product, onStatusChange }: { product: Product, onStatusChange: (id: string, status: any) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border-brand-dark/5">
        <div className="flex space-x-4">
          <div className="w-16 h-20 rounded-xl overflow-hidden bg-brand-cream flex-shrink-0">
            <img src={getProductImage(product.images)} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-serif text-sm mb-1">{product.name}</p>
                <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest font-bold">{product.brand}</p>
              </div>
              <Price amount={product.price} className="text-xs font-bold" />
            </div>
            <div className="mt-4 flex justify-between items-center">
              <Badge variant={product.status === 'published' ? 'success' : product.status === 'draft' ? 'warning' : 'neutral'} className="text-[8px] py-0.5">
                {product.status}
              </Badge>
              <div className="flex space-x-1">
                <Link to={`/product/${product.slug}`} target="_blank">
                  <Button variant="ghost" size="sm" icon={Eye} className="h-6 w-6 p-0 text-brand-dark/40" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ProductModeration = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getAll();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (product.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.status || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  const handleStatusChange = async (productId: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      await productService.update(productId, { status: newStatus });
      setProducts(prev => Array.isArray(prev) ? prev.map(p => p.id === productId ? { ...p, status: newStatus } : p) : []);
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  const handleBulkStatusChange = async (newStatus: 'draft' | 'published' | 'archived') => {
    try {
      if (!Array.isArray(selectedProductIds)) return;
      await Promise.all(selectedProductIds.map(id => productService.update(id, { status: newStatus })));
      setProducts(prev => Array.isArray(prev) ? prev.map(p => 
        selectedProductIds.includes(p.id) ? { ...p, status: newStatus } : p
      ) : []);
      setSelectedProductIds([]);
    } catch (error) {
      console.error('Failed to update bulk product status:', error);
    }
  };

  const toggleSelectAll = () => {
    if (!Array.isArray(filteredProducts)) return;
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectProduct = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const productId = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a column
    if (['draft', 'published', 'archived'].includes(overId)) {
      handleStatusChange(productId, overId as any);
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif mb-1 sm:mb-2">Product Moderation</h1>
          <p className="text-xs sm:text-sm text-brand-dark/60 font-sans">Review, approve, or reject product listings from sellers.</p>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center border border-brand-dark/10 rounded-full p-1 bg-white">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${viewMode === 'table' ? 'bg-brand-gold text-white' : 'text-brand-dark/40 hover:text-brand-gold'}`}
              title="Table View"
            >
              <List size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${viewMode === 'kanban' ? 'bg-brand-gold text-white' : 'text-brand-dark/40 hover:text-brand-gold'}`}
              title="Kanban View"
            >
              <Kanban size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
          <Badge variant="warning" size="md" className="flex items-center space-x-2 sm:space-x-3 py-2 sm:py-3 px-4 sm:px-6">
            <Shield size={16} className="sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-sm font-bold uppercase tracking-widest">{(Array.isArray(products) ? products : []).filter(p => p.status === 'draft').length} Pending</span>
          </Badge>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedProductIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-brand-dark text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center justify-between shadow-xl gap-3 sm:gap-0"
          >
            <div className="flex items-center space-x-3 sm:space-x-4 sm:ml-4">
              <span className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-brand-gold">
                {selectedProductIds.length} Selected
              </span>
              <div className="hidden sm:block w-px h-6 bg-white/10" />
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => handleBulkStatusChange('published')}
                  variant="success"
                  size="sm"
                  icon={CheckCircle2}
                  className="text-[10px] sm:text-xs py-1.5 sm:py-2"
                >
                  Approve
                </Button>
                <Button 
                  onClick={() => handleBulkStatusChange('archived')}
                  variant="danger"
                  size="sm"
                  icon={XCircle}
                  className="text-[10px] sm:text-xs py-1.5 sm:py-2"
                >
                  Archive
                </Button>
              </div>
            </div>
            <Button 
              onClick={() => setSelectedProductIds([])}
              variant="ghost"
              size="sm"
              className="text-white hover:text-brand-gold text-[10px] sm:text-xs"
            >
              Cancel
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search */}
      <Card variant="default" className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          <div className="relative flex-grow">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40 sm:w-[18px] sm:h-[18px]" />
            <input 
              type="text" 
              placeholder="Search by name, brand, or status..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-cream/50 border-none rounded-xl sm:rounded-2xl pl-10 sm:pl-12 pr-4 sm:pr-6 py-2.5 sm:py-3 text-xs sm:text-sm focus:ring-2 focus:ring-brand-gold/20 font-sans"
            />
          </div>
          <div className="flex gap-3 sm:gap-4">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="flex-grow md:flex-none bg-brand-cream/50 border-none rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold uppercase tracking-widest focus:ring-2 focus:ring-brand-gold/20 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="draft">Pending Approval</option>
              <option value="published">Live Products</option>
              <option value="archived">Archived</option>
            </select>
            <Button variant="outline" icon={Filter} className="p-2.5 sm:p-3" />
          </div>
        </div>
      </Card>

      {/* Products Display */}
      {viewMode === 'kanban' ? (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-8 overflow-x-auto pb-12 custom-scrollbar min-h-[700px] -mx-4 px-4">
            {(['draft', 'published', 'archived'] as const).map((status) => {
              const statusProducts = filteredProducts.filter(p => p.status === status);
              const statusLabel = status === 'draft' ? 'Pending Review' : status === 'published' ? 'Live on Platform' : 'Archived';
              const statusColor = status === 'published' ? 'bg-emerald-500' : status === 'draft' ? 'bg-brand-gold' : 'bg-brand-dark/40';
              const statusBg = status === 'published' ? 'bg-emerald-500/5' : status === 'draft' ? 'bg-brand-gold/5' : 'bg-brand-dark/5';

              return (
                <div key={status} id={status} className={`flex-shrink-0 w-96 ${statusBg} rounded-[3rem] p-8 border border-brand-dark/5 h-fit shadow-sm`}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${statusColor} rounded-full shadow-sm shadow-${statusColor}/20 animate-pulse`}></div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark">
                        {statusLabel}
                      </h3>
                    </div>
                    <span className="bg-white px-3 py-1 rounded-xl text-[10px] font-mono font-bold text-brand-dark/40 border border-brand-dark/5 shadow-sm">
                      {statusProducts.length.toString().padStart(2, '0')}
                    </span>
                  </div>

                  <SortableContext 
                    id={status}
                    items={statusProducts.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-5 min-h-[300px]">
                      {statusProducts.map((product) => (
                        <SortableProductCard 
                          key={product.id} 
                          product={product} 
                          onStatusChange={handleStatusChange} 
                        />
                      ))}
                      {statusProducts.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-brand-dark/5 rounded-[2.5rem] bg-white/50">
                          <Package size={32} className="mx-auto text-brand-dark/10 mb-4" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/20">No items in this stage</p>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
          <DragOverlay>
            {activeId ? (
              <div className="opacity-90 scale-105 rotate-2 shadow-2xl">
                <SortableProductCard 
                  product={(Array.isArray(products) ? products : []).find(p => p.id === activeId)!} 
                  onStatusChange={handleStatusChange} 
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="bg-white border border-brand-dark/5 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-dark/5 bg-brand-cream/10">
                  <th className="px-8 py-5 w-16">
                    <input 
                      type="checkbox" 
                      checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded-lg border-brand-dark/10 text-brand-gold focus:ring-brand-gold/20 cursor-pointer transition-all"
                    />
                  </th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 font-serif italic">Product Identity</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 font-serif italic">Vendor Details</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 font-serif italic">Valuation</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 font-serif italic">Moderation Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 font-serif italic text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.tr 
                      key={product.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`hover:bg-brand-cream/20 transition-all group ${selectedProductIds.includes(product.id) ? 'bg-brand-gold/5' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <input 
                          type="checkbox" 
                          checked={selectedProductIds.includes(product.id)}
                          onChange={() => toggleSelectProduct(product.id)}
                          className="w-5 h-5 rounded-lg border-brand-dark/10 text-brand-gold focus:ring-brand-gold/20 cursor-pointer transition-all"
                        />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-5">
                          <div className="w-16 h-20 rounded-2xl overflow-hidden bg-brand-cream flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                            <img src={getProductImage(product.images)} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="font-serif text-xl leading-none mb-1.5 text-brand-dark">{product.name}</p>
                            <p className="text-[10px] text-brand-dark/40 uppercase tracking-[0.2em] font-bold">{product.brand}</p>
                            <p className="text-[9px] text-brand-dark/20 font-mono mt-1">SKU: {product.id.substring(0, 8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-2xl bg-brand-dark/5 flex items-center justify-center text-[10px] font-bold text-brand-dark/40">
                            {(product.sellerId || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-brand-dark/80">Vendor ID</p>
                            <p className="text-[10px] text-brand-dark/40 font-mono">{(product.sellerId || '').slice(0, 12)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <Price amount={product.price} className="text-lg font-serif text-brand-dark" />
                          <span className="text-[9px] text-brand-dark/30 uppercase tracking-widest font-bold mt-1">Base Price</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge 
                          variant={
                            product.status === 'published' ? 'success' : 
                            product.status === 'draft' ? 'warning' : 
                            'neutral'
                          }
                          className="flex items-center text-[9px] px-3 py-1 rounded-full uppercase tracking-widest"
                        >
                          {product.status === 'published' ? <CheckCircle2 size={12} className="mr-2" /> : 
                           product.status === 'draft' ? <AlertCircle size={12} className="mr-2" /> : 
                           <XCircle size={12} className="mr-2" />}
                          {product.status === 'published' ? 'Live' : 
                           product.status === 'draft' ? 'Pending' : 'Archived'}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end space-x-2">
                          {product.status !== 'published' && (
                            <button 
                              onClick={() => handleStatusChange(product.id, 'published')}
                              className="p-3 rounded-xl bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                              title="Approve"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          {product.status !== 'archived' && (
                            <button 
                              onClick={() => handleStatusChange(product.id, 'archived')}
                              className="p-3 rounded-xl bg-rose-500/5 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                              title="Reject/Archive"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                          <Link to={`/product/${product.slug}`} target="_blank">
                            <button className="p-3 rounded-xl bg-brand-cream/50 text-brand-dark/40 hover:bg-brand-gold hover:text-white transition-all shadow-sm">
                              <Eye size={18} />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="py-32 text-center bg-brand-cream/5">
              <div className="w-20 h-20 bg-brand-dark/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={32} className="text-brand-dark/20" />
              </div>
              <p className="text-brand-dark/40 italic font-serif text-lg">No products found matching your criteria.</p>
              <Button variant="ghost" className="mt-4" onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductModeration;
