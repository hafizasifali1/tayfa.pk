import React, { useState } from 'react';
import { products } from '../../data/products';
import Price from '../../components/common/Price';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Tag,
  Calendar,
  DollarSign,
  Percent,
  ArrowRight,
  Store
} from 'lucide-react';
import { motion } from 'motion/react';
import { Discount } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';

const AdminDiscountManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for discounts (Global/Admin view)
  const [discounts, setDiscounts] = useState<(Discount & { sellerName: string })[]>([
    {
      id: 'ds-1',
      sellerId: 'seller-1',
      sellerName: 'Luxe Boutique',
      productId: '1',
      percentage: 20,
      startDate: '2024-03-01T00:00:00Z',
      endDate: '2024-03-31T23:59:59Z',
      isActive: true
    },
    {
      id: 'ds-2',
      sellerId: 'seller-2',
      sellerName: 'Elite Fashion',
      productId: '2',
      percentage: 15,
      startDate: '2024-04-01T00:00:00Z',
      endDate: '2024-04-15T23:59:59Z',
      isActive: false
    }
  ]);

  const headers = [
    'Product & Seller',
    'Original Price',
    'Discount',
    'Sale Price',
    'Status',
    <div className="text-right">Actions</div>
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2 text-brand-dark">Global Discounts</h1>
          <p className="text-brand-dark/60">Monitor and manage direct product discounts across all sellers.</p>
        </div>
        <Button 
          icon={<Plus size={18} />}
        >
          Apply Global Discount
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="Search by product or seller..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-brand-dark/5 rounded-2xl pl-12 pr-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
            />
          </div>
          <Button 
            variant="outline"
            icon={<Filter size={18} />}
          >
            Filters
          </Button>
        </div>
      </Card>

      {/* Discounts Table */}
      <Card className="overflow-hidden border-brand-dark/5 shadow-sm">
        <Table headers={headers}>
          {Array.isArray(discounts) && discounts.map((discount) => {
            const product = Array.isArray(products) ? products.find(p => p.id === discount.productId) : null;
            if (!product) return null;
            const salePrice = product.price * (1 - discount.percentage / 100);

            return (
              <tr key={discount.id} className="hover:bg-brand-cream/10 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-brand-dark/5">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark">{product.name}</p>
                      <div className="flex items-center space-x-2 text-brand-gold font-bold uppercase tracking-widest text-[10px] mt-1">
                        <Store size={12} />
                        <span>{discount.sellerName}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <Price amount={product.price} className="text-sm text-brand-dark/40 line-through" />
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-2 text-rose-500 font-bold">
                    <Percent size={14} />
                    <span className="text-sm">{discount.percentage}%</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <Price amount={salePrice} className="text-sm font-bold text-brand-dark" />
                </td>
                <td className="px-8 py-6">
                  <Badge 
                    variant={discount.isActive ? 'success' : 'warning'}
                  >
                    {discount.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" icon={<Edit2 size={16} />} />
                    <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} className="text-red-500 hover:text-red-600" />
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
};

export default AdminDiscountManager;
