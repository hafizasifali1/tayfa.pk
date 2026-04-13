import React from 'react';
import { motion } from 'motion/react';

interface GooglePreviewProps {
  title: string;
  description: string;
  url: string;
}

const GooglePreview: React.FC<GooglePreviewProps> = ({ title, description, url = '/' }) => {
  const safeUrl = url || '/';
  const displayUrl = safeUrl.startsWith('http') ? safeUrl : `https://vibrant-fashion.com${safeUrl.startsWith('/') ? '' : '/'}${safeUrl}`;

  return (
    <div className="bg-white p-6 rounded-2xl border border-brand-dark/5 shadow-sm max-w-2xl">
      <div className="flex items-center space-x-2 mb-1">
        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400">
          V
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-[#202124] leading-tight">Vibrant</span>
          <span className="text-[10px] text-[#4d5156] leading-tight truncate max-w-[300px]">{displayUrl}</span>
        </div>
      </div>
      
      <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-medium mb-1 truncate">
        {title || 'Page Title Placeholder'}
      </h3>
      
      <p className="text-sm text-[#4d5156] line-clamp-2 leading-relaxed">
        {description || 'Please provide a meta description to see how your page will appear in Google search results. A good description is between 150-160 characters.'}
      </p>
    </div>
  );
};

export default GooglePreview;
