import React from 'react';
import { Clock, MessageSquare } from 'lucide-react';

interface StatusHistoryItem {
  status: string;
  timestamp: string;
  comment?: string;
}

interface OrderStatusHistoryProps {
  history: StatusHistoryItem[];
}

const OrderStatusHistory: React.FC<OrderStatusHistoryProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6 bg-brand-cream/20 rounded-2xl border border-dashed border-brand-dark/10">
        <p className="text-xs text-brand-dark/40 italic">No status history available.</p>
      </div>
    );
  }

  // Sort history by timestamp descending (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Status History</h3>
        <span className="text-[10px] text-brand-dark/40 font-medium">{history.length} updates</span>
      </div>
      
      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-gold before:via-brand-gold/20 before:to-transparent">
        {sortedHistory.map((item, index) => (
          <div key={index} className="relative flex items-start group">
            <div className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-brand-gold shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Clock size={12} className="text-brand-gold" />
            </div>
            
            <div className="ml-12 flex-grow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-dark">
                  {item.status.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-brand-dark/40 font-medium">
                  {new Date(item.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
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
        ))}
      </div>
    </div>
  );
};

export default OrderStatusHistory;
