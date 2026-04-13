import React from 'react';

interface TableProps {
  headers: React.ReactNode[];
  children: React.ReactNode;
  className?: string;
}

export const Table = ({
  headers,
  children,
  className = '',
}: TableProps) => {
  return (
    <div className={`overflow-x-auto scrollbar-hide ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-brand-cream/30 border-b border-brand-dark/5">
            {headers.map((header, idx) => (
              <th 
                key={idx} 
                className={`px-4 py-5 sm:px-10 sm:py-7 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 ${idx === headers.length - 1 ? 'text-right' : ''}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-dark/5">
          {children}
        </tbody>
      </table>
    </div>
  );
};

