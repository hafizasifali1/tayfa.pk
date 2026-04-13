import React, { useState, useEffect } from 'react';
import { SEOMetadata, SEOEntityType } from '../../../types';
import { AlertCircle, CheckCircle2, Info, Share2, Globe, Eye, Image as ImageIcon, Bot, ShieldAlert } from 'lucide-react';
import GooglePreview from './GooglePreview';

interface SEOSettingsFormProps {
  metadata: SEOMetadata;
  onChange: (metadata: SEOMetadata) => void;
  pagePath?: string;
  showPreview?: boolean;
  entityType?: SEOEntityType;
  entityData?: any;
}

const SEOSettingsForm: React.FC<SEOSettingsFormProps> = ({ 
  metadata, 
  onChange, 
  pagePath = '/', 
  showPreview = true,
  entityType,
  entityData
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState<'google' | 'social'>('google');
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (pagePath && !metadata.canonicalUrl) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const formattedPath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
      const fullUrl = `${origin}${formattedPath}`;
      onChange({
        ...metadata,
        canonicalUrl: fullUrl
      });
    }
  }, [pagePath, metadata.canonicalUrl, onChange]);

  if (!metadata) {
    return (
      <div className="p-8 text-center bg-brand-cream/10 rounded-2xl border border-dashed border-brand-dark/10">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">No metadata available</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...metadata, [name]: value });
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    handleInputChange(e);
    
    if (!value) {
      setJsonError(null);
      return;
    }

    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (err) {
      setJsonError('Invalid JSON format. Please ensure it is a valid JSON-LD object.');
    }
  };

  const handleRobotsChange = (directive: string, enabled: boolean) => {
    let currentDirectives = (metadata.robots || 'index, follow')
      .split(',')
      .map(d => d.trim().toLowerCase())
      .filter(Boolean);
    
    if (directive === 'noindex') {
      currentDirectives = currentDirectives.filter(d => d !== 'index' && d !== 'noindex');
      currentDirectives.push(enabled ? 'noindex' : 'index');
    } else if (directive === 'nofollow') {
      currentDirectives = currentDirectives.filter(d => d !== 'follow' && d !== 'nofollow');
      currentDirectives.push(enabled ? 'nofollow' : 'follow');
    } else {
      if (enabled) {
        if (!currentDirectives.includes(directive)) currentDirectives.push(directive);
      } else {
        currentDirectives = currentDirectives.filter(d => d !== directive);
      }
    }
    
    const uniqueDirectives = Array.from(new Set(currentDirectives)).join(', ');
    onChange({ ...metadata, robots: uniqueDirectives });
  };

  const titleLength = (metadata.title || '').length;
  const descriptionLength = (metadata.description || '').length;

  const getStatusColor = (length: number, min: number, max: number) => {
    if (length === 0) return 'text-gray-400';
    if (length < min) return 'text-yellow-500';
    if (length > max) return 'text-red-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold flex items-center">
          <Globe size={14} className="mr-3" />
          Metadata Configuration
        </h4>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Meta Title */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60">
                Meta Title *
              </label>
              <span className={`text-[10px] font-bold ${getStatusColor(titleLength, 30, 60)}`}>
                {titleLength}/60
              </span>
            </div>
            <input
              type="text"
              name="title"
              value={metadata.title || ''}
              onChange={handleInputChange}
              placeholder="Enter a descriptive title"
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
            />
            <p className="mt-1 text-[10px] text-brand-dark/40 italic">
              Ideal length: 30-60 characters.
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60">
                Meta Description *
              </label>
              <span className={`text-[10px] font-bold ${getStatusColor(descriptionLength, 120, 160)}`}>
                {descriptionLength}/160
              </span>
            </div>
            <textarea
              name="description"
              value={metadata.description || ''}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter a brief summary of the page content"
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
            />
            <p className="mt-1 text-[10px] text-brand-dark/40 italic">
              Ideal length: 120-160 characters.
            </p>
          </div>

          {/* Meta Keywords */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">
              Meta Keywords
            </label>
            <input
              type="text"
              name="keywords"
              value={metadata.keywords || ''}
              onChange={handleInputChange}
              placeholder="e.g. fashion, luxury, designer"
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
            />
            <p className="mt-1 text-[10px] text-brand-dark/40 italic">
              Separate keywords with commas.
            </p>
          </div>

          {/* Canonical URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">
              Canonical URL
            </label>
            <input
              type="text"
              name="canonicalUrl"
              value={metadata.canonicalUrl || ''}
              onChange={handleInputChange}
              placeholder="https://example.com/page-url"
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
            />
            <p className="mt-1 text-[10px] text-brand-dark/40 italic">
              The preferred version of this page for search engines.
            </p>
          </div>

          {/* Robots Settings */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 flex items-center">
              <Bot size={14} className="mr-2" />
              Robots Directives
            </label>
            <div className="grid grid-cols-2 gap-3 bg-brand-cream/10 p-4 rounded-xl border border-brand-dark/5">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!metadata.robots?.toLowerCase().includes('noindex')}
                  onChange={(e) => handleRobotsChange('noindex', !e.target.checked)}
                  className="w-4 h-4 rounded border-brand-dark/10 text-brand-gold focus:ring-brand-gold transition-all"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 group-hover:text-brand-dark transition-colors">Index</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!metadata.robots?.toLowerCase().includes('nofollow')}
                  onChange={(e) => handleRobotsChange('nofollow', !e.target.checked)}
                  className="w-4 h-4 rounded border-brand-dark/10 text-brand-gold focus:ring-brand-gold transition-all"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 group-hover:text-brand-dark transition-colors">Follow</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={metadata.robots?.toLowerCase().includes('noarchive')}
                  onChange={(e) => handleRobotsChange('noarchive', e.target.checked)}
                  className="w-4 h-4 rounded border-brand-dark/10 text-brand-gold focus:ring-brand-gold transition-all"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 group-hover:text-brand-dark transition-colors">No Archive</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={metadata.robots?.toLowerCase().includes('nosnippet')}
                  onChange={(e) => handleRobotsChange('nosnippet', e.target.checked)}
                  className="w-4 h-4 rounded border-brand-dark/10 text-brand-gold focus:ring-brand-gold transition-all"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 group-hover:text-brand-dark transition-colors">No Snippet</span>
              </label>
            </div>
            <p className="text-[9px] text-brand-dark/40 italic leading-relaxed">
              Control how search engines crawl and display this page. Default is Index, Follow.
            </p>
          </div>
        </div>

        {showPreview && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Live Preview</h4>
              <div className="flex bg-brand-cream/50 rounded-lg p-1">
                <button
                  onClick={() => setIsPreviewMode('google')}
                  className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all flex items-center space-x-2 ${
                    isPreviewMode === 'google' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-dark/40'
                  }`}
                >
                  <Eye size={12} />
                  <span>Google</span>
                </button>
                <button
                  onClick={() => setIsPreviewMode('social')}
                  className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all flex items-center space-x-2 ${
                    isPreviewMode === 'social' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-dark/40'
                  }`}
                >
                  <Share2 size={12} />
                  <span>Social</span>
                </button>
              </div>
            </div>

            {isPreviewMode === 'google' ? (
              <GooglePreview 
                title={metadata.title} 
                description={metadata.description} 
                url={pagePath} 
              />
            ) : (
              <div className="bg-white border border-brand-dark/5 rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-[1.91/1] bg-brand-cream/20 flex items-center justify-center relative overflow-hidden">
                  {metadata.ogImage ? (
                    <img src={metadata.ogImage} alt="Social Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon size={40} className="text-brand-dark/10" />
                  )}
                </div>
                <div className="p-4 bg-brand-cream/5 border-t border-brand-dark/5">
                  <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest mb-1">{new URL(window.location.href).hostname}</p>
                  <h5 className="text-sm font-bold text-brand-dark line-clamp-1">{metadata.title || 'Page Title'}</h5>
                  <p className="text-xs text-brand-dark/60 line-clamp-2 mt-1">{metadata.description || 'Page description will appear here...'}</p>
                </div>
              </div>
            )}
            
            <div className="bg-brand-cream/30 p-6 rounded-2xl border border-brand-gold/10 space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-widest text-brand-gold flex items-center">
                <Info size={14} className="mr-2" />
                SEO Health Check
              </h5>
              
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  {titleLength >= 30 && titleLength <= 60 ? (
                    <CheckCircle2 size={14} className="text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle size={14} className="text-yellow-500 mt-0.5" />
                  )}
                  <span className="text-[10px] text-brand-dark/60">
                    Title length is {titleLength} characters. {titleLength < 30 ? 'Too short.' : titleLength > 60 ? 'Too long.' : 'Perfect!'}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  {descriptionLength >= 120 && descriptionLength <= 160 ? (
                    <CheckCircle2 size={14} className="text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle size={14} className="text-yellow-500 mt-0.5" />
                  )}
                  <span className="text-[10px] text-brand-dark/60">
                    Description length is {descriptionLength} characters. {descriptionLength < 120 ? 'Too short.' : descriptionLength > 160 ? 'Too long.' : 'Perfect!'}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  {metadata.keywords ? (
                    <CheckCircle2 size={14} className="text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle size={14} className="text-yellow-500 mt-0.5" />
                  )}
                  <span className="text-[10px] text-brand-dark/60">
                    {metadata.keywords ? 'Keywords are provided.' : 'No keywords provided.'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Structured Data */}
      <div className="pt-6 border-t border-brand-dark/5">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60">
            Structured Data (JSON-LD)
          </label>
          {jsonError && (
            <span className="text-[10px] font-bold text-rose-500 flex items-center">
              <ShieldAlert size={12} className="mr-1" />
              {jsonError}
            </span>
          )}
        </div>
        <textarea
          name="structuredData"
          value={metadata.structuredData || ''}
          onChange={handleJsonChange}
          rows={6}
          placeholder='{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product Description"
}'
          className={`w-full px-4 py-3 border rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm font-mono transition-all ${
            jsonError ? 'border-rose-500 bg-rose-50/30' : 'border-brand-dark/10 bg-white'
          }`}
        />
        <p className="mt-2 text-[10px] text-brand-dark/40 italic flex items-start">
          <Info size={12} className="mr-2 mt-0.5 flex-shrink-0" />
          Advanced: Add schema.org markup (JSON-LD) to help search engines understand your content and enable rich results in search.
        </p>
      </div>
    </div>
  );
};

export default SEOSettingsForm;