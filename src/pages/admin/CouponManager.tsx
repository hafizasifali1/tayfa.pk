import React, { useState } from 'react';
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
  Ticket,
  Copy,
  Users,
  Store
} from 'lucide-react';
import { motion } from 'motion/react';
import { Coupon } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';

const AdminCouponManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for coupons (Global/Admin view)
  const [coupons, setCoupons] = useState<(Coupon & { sellerName: string })[]>([
    {
      id: 'cp-1',
      sellerId: 'seller-1',
      sellerName: 'Luxe Boutique',
      code: 'WELCOME10',
      description: '10% off for new customers',
      discountType: 'percentage',
      discountValue: 10,
      minPurchaseAmount: 50,
      maxDiscountAmount: 20,
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      usageLimit: 500,
      usageCount: 124,
      isActive: true
    },
    {
      id: 'cp-2',
      sellerId: 'seller-2',
      sellerName: 'Elite Fashion',
      code: 'LUXE50',
      description: '$50 off on orders over $500',
      discountType: 'fixed_amount',
      discountValue: 50,
      minPurchaseAmount: 500,
      startDate: '2024-05-01T00:00:00Z',
      endDate: '2024-06-30T23:59:59Z',
      usageLimit: 100,
      usageCount: 45,
      isActive: true
    }
  ]);

  const headers = [
    'Coupon & Seller',
    'Discount',
    'Usage',
    'Status',
    'Duration',
    <div className="text-right">Actions</div>
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2 text-brand-dark">Global Coupons</h1>
          <p className="text-brand-dark/60">Manage and monitor discount codes across all sellers.</p>
        </div>
        <Button 
          icon={<Plus size={18} />}
        >
          Create Global Coupon
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="Search by code or seller..." 
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

      {/* Coupons Table */}
      <Card className="overflow-hidden border-brand-dark/5 shadow-sm">
        <Table headers={headers}>
          {Array.isArray(coupons) && coupons.map((coupon) => (
            <tr key={coupon.id} className="hover:bg-brand-cream/10 transition-colors group">
              <td className="px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-brand-cream/50 rounded-xl text-brand-gold">
                    <Ticket size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-dark tracking-widest">{coupon.code}</p>
                    <div className="flex items-center space-x-2 text-brand-gold font-bold uppercase tracking-widest text-[10px] mt-1">
                      <Store size={12} />
                      <span>{coupon.sellerName}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className="text-xs font-bold text-brand-dark">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                </span>
              </td>
              <td className="px-8 py-6">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">
                    <span>{coupon.usageCount} / {coupon.usageLimit || '∞'}</span>
                    <span>{Math.round((coupon.usageCount / (coupon.usageLimit || 1)) * 100)}%</span>
                  </div>
                  <div className="w-32 h-1.5 bg-brand-cream rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-gold" 
                      style={{ width: `${(coupon.usageCount / (coupon.usageLimit || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <Badge 
                  variant={coupon.isActive ? 'success' : 'warning'}
                >
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-8 py-6">
                <span className="text-xs text-brand-dark/40">
                  {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
                </span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" icon={<Copy size={16} />} />
                  <Button variant="ghost" size="sm" icon={<Edit2 size={16} />} />
                  <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} className="text-red-500 hover:text-red-600" />
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default AdminCouponManager;
