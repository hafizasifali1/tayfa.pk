import React from 'react';
import { Clock, MessageSquare, CheckCircle, Package, Truck, XCircle, RotateCcw, CreditCard } from 'lucide-react';

interface StatusHistoryItem {
  status: string;
  createdAt?: string;
  timestamp?: string;
  comment?: string;
  processedByRole?: string;
  processedByName?: string;
  processedById?: string;
}

interface OrderStatusHistoryProps {
  history: StatusHistoryItem[];
  showRoleBadge?: boolean;
}

const getTime = (item: StatusHistoryItem) => item.createdAt || item.timestamp;

const formatTime = (raw?: string) => {
  if (!raw) return '';
  // MySQL returns timestamps without timezone; treat them as local time
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const STATUS_META: Record<string, { color: string; bg: string; border: string; Icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  pending:          { color: 'text-yellow-600',  bg: 'bg-yellow-50',  border: 'border-yellow-300',  Icon: Clock },
  confirmed:        { color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-300',    Icon: CheckCircle },
  processing:       { color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-300',  Icon: Package },
  shipped:          { color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-300',  Icon: Truck },
  out_for_delivery: { color: 'text-indigo-700',  bg: 'bg-indigo-50',  border: 'border-indigo-400',  Icon: Truck },
  delivered:        { color: 'text-green-600',   bg: 'bg-green-50',   border: 'border-green-300',   Icon: CheckCircle },
  cancelled:        { color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-300',     Icon: XCircle },
  return_requested: { color: 'text-orange-600',  bg: 'bg-orange-50',  border: 'border-orange-300',  Icon: RotateCcw },
  returned:         { color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-300',    Icon: RotateCcw },
  refunded:         { color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-300',    Icon: CreditCard },
};

const OrderStatusHistory: React.FC<OrderStatusHistoryProps> = ({ history, showRoleBadge }) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'super_admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'seller': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6 bg-brand-cream/20 rounded-2xl border border-dashed border-brand-dark/10">
        <p className="text-xs text-brand-dark/40 italic">No status history available.</p>
      </div>
    );
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(getTime(b) || 0).getTime() - new Date(getTime(a) || 0).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Status History</h3>
        <span className="text-[10px] text-brand-dark/40 font-medium">{history.length} updates</span>
      </div>

      <div className="relative space-y-5 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-brand-gold/60 before:via-brand-gold/20 before:to-transparent">
        {sortedHistory.map((item, index) => {
          const meta = STATUS_META[item.status] || { color: 'text-brand-dark', bg: 'bg-brand-cream/40', border: 'border-brand-dark/10', Icon: Clock };
          const Icon = meta.Icon;
          const time = formatTime(getTime(item));
          return (
            <div key={index} className="relative flex items-start group">
              <div className={`absolute left-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 ${meta.border} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={12} className={meta.color} />
              </div>

              <div className="ml-12 flex-grow min-w-0">
                {/* Single row: status name LEFT, badge + time RIGHT */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-xs font-bold uppercase tracking-widest ${meta.color}`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2 ml-auto">
                    {showRoleBadge && item.processedByRole && (
                      <div className={`inline-flex flex-col px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${getRoleBadgeColor(item.processedByRole)}`}>
                        <span className="uppercase tracking-widest font-bold text-[9px]">
                          {item.processedByRole.replace(/_/g, ' ')}
                        </span>
                        {item.processedByName && (
                          <span className="font-medium mt-0.5">{item.processedByName}</span>
                        )}
                        {item.processedByRole === 'seller' && item.processedById && (
                          <span className="opacity-70 text-[8px] mt-0.5">ID: {item.processedById}</span>
                        )}
                      </div>
                    )}
                    {time && (
                      <span className="text-[10px] text-brand-dark/50 font-medium whitespace-nowrap">
                        {time}
                      </span>
                    )}
                  </div>
                </div>

                {item.comment && (
                  <div className="mt-2 p-3 bg-brand-cream/30 rounded-xl border border-brand-dark/5 flex items-start space-x-2">
                    <MessageSquare size={10} className="text-brand-dark/30 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-brand-dark/70 leading-relaxed italic">
                      "{item.comment}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusHistory;
