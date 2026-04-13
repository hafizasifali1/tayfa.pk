import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  Search, 
  Globe, 
  Settings, 
  FileText, 
  Layout, 
  Save, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  Code,
  Image as ImageIcon,
  BarChart3,
  Package,
  Tags,
  Bookmark,
  Megaphone,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// import SEOSettingsForm from '../../components/admin/SEO/SEOSettingsForm';
import { GlobalSEOSettings, PageSEO, SEOEntity, SEOEntityType } from '../../types';
import { seoService } from '../../services/seoService';

const SEOManager = () => {
  const [activeTab, setActiveTab] = useState<'pages' | 'entities' | 'global' | 'technical'>('pages');
  const [globalSettings, setGlobalSettings] = useState<GlobalSEOSettings | null>(null);
  const [pageSettings, setPageSettings] = useState<PageSEO[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageSEO | null>(null);
  
  // Entity SEO State
  const [entities, setEntities] = useState<SEOEntity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<SEOEntity | null>(null);
  const [entityType, setEntityType] = useState<SEOEntityType>('product');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'entities') {
      fetchEntities();
    }
  }, [activeTab, entityType, searchQuery]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [globalRes, pagesRes] = await Promise.all([
        axios.get('/api/seo/global'),
        axios.get('/api/seo/pages')
      ]);
      setGlobalSettings(globalRes.data);
      if (Array.isArray(pagesRes.data)) {
        setPageSettings(pagesRes.data);
        if (pagesRes.data.length > 0) {
          setSelectedPage(pagesRes.data[0]);
        }
      } else {
        setPageSettings([]);
      }
    } catch (error) {
      console.error('Error fetching SEO data:', error);
      setMessage({ type: 'error', text: 'Failed to load SEO settings.' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEntities = async () => {
    try {
      const data = await seoService.getEntities(entityType, searchQuery);
      setEntities(data);
      if (data.length > 0 && !selectedEntity) {
        setSelectedEntity(data[0]);
      }
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  const handleSaveGlobal = async () => {
    if (!globalSettings) return;
    setIsSaving(true);
    try {
      await axios.put('/api/seo/global', globalSettings);
      setMessage({ type: 'success', text: 'Global SEO settings updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update global SEO settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePage = async () => {
    if (!selectedPage) return;
    setIsSaving(true);
    try {
      await axios.put(`/api/seo/pages/${selectedPage.id}`, selectedPage);
      setPageSettings(prev => Array.isArray(prev) ? prev.map(p => p.id === selectedPage.id ? selectedPage : p) : []);
      setMessage({ type: 'success', text: `${selectedPage.pageName} SEO settings updated.` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update page SEO settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEntity = async () => {
    if (!selectedEntity) return;
    setIsSaving(true);
    try {
      await seoService.updateEntitySEO(selectedEntity.entityType, selectedEntity.entityId, selectedEntity);
      setEntities(prev => prev.map(e => e.id === selectedEntity.id ? selectedEntity : e));
      setMessage({ type: 'success', text: `${selectedEntity.entityName} SEO updated.` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update entity SEO.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshSitemap = async () => {
    setIsSaving(true);
    try {
      await axios.get('/api/seo/sitemap');
      setMessage({ type: 'success', text: 'Sitemap refreshed successfully.' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to refresh sitemap.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  const entityTypes: { id: SEOEntityType; label: string; icon: any }[] = [
    { id: 'product', label: 'Products', icon: Package },
    { id: 'category', label: 'Categories', icon: Tags },
    { id: 'brand', label: 'Brands', icon: Bookmark },
    { id: 'page', label: 'CMS Pages', icon: FileText },
    { id: 'promotion', label: 'Promotions', icon: Megaphone },
    { id: 'blog', label: 'Blog Posts', icon: Layout },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-brand-dark/40">
            <span>System</span>
            <ChevronRight size={14} />
            <span className="text-brand-gold">SEO Management</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => seoService.syncSEO()}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-gold/10 text-brand-gold rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all"
            >
              <RefreshCw size={14} />
              <span>Sync All SEO</span>
            </button>
            <a 
              href="/sitemap.xml" 
              target="_blank" 
              className="flex items-center space-x-2 px-4 py-2 bg-brand-cream/50 text-brand-dark rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-cream transition-all"
            >
              <Globe size={14} />
              <span>View Sitemap</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 border border-brand-dark/5 bg-white rounded-[3rem] overflow-hidden shadow-sm">
          {/* Sidebar Navigation */}
          <div className="lg:border-r border-brand-dark/5 bg-brand-cream/5 p-8 space-y-4">
            <div className="mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 mb-6 font-serif italic">SEO Control Center</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('pages')}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all group ${
                    activeTab === 'pages' ? 'bg-brand-dark text-white shadow-xl' : 'text-brand-dark/60 hover:bg-brand-dark/5 hover:text-brand-dark'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Layout size={16} className={activeTab === 'pages' ? 'text-brand-gold' : 'text-brand-dark/20 group-hover:text-brand-dark/40'} />
                    <span>Page Index</span>
                  </div>
                  {activeTab === 'pages' && <ChevronRight size={14} />}
                </button>
                <button
                  onClick={() => setActiveTab('entities')}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all group ${
                    activeTab === 'entities' ? 'bg-brand-dark text-white shadow-xl' : 'text-brand-dark/60 hover:bg-brand-dark/5 hover:text-brand-dark'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Package size={16} className={activeTab === 'entities' ? 'text-brand-gold' : 'text-brand-dark/20 group-hover:text-brand-dark/40'} />
                    <span>Entity SEO</span>
                  </div>
                  {activeTab === 'entities' && <ChevronRight size={14} />}
                </button>
                <button
                  onClick={() => setActiveTab('global')}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all group ${
                    activeTab === 'global' ? 'bg-brand-dark text-white shadow-xl' : 'text-brand-dark/60 hover:bg-brand-dark/5 hover:text-brand-dark'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Globe size={16} className={activeTab === 'global' ? 'text-brand-gold' : 'text-brand-dark/20 group-hover:text-brand-dark/40'} />
                    <span>Global Meta</span>
                  </div>
                  {activeTab === 'global' && <ChevronRight size={14} />}
                </button>
                <button
                  onClick={() => setActiveTab('technical')}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all group ${
                    activeTab === 'technical' ? 'bg-brand-dark text-white shadow-xl' : 'text-brand-dark/60 hover:bg-brand-dark/5 hover:text-brand-dark'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Settings size={16} className={activeTab === 'technical' ? 'text-brand-gold' : 'text-brand-dark/20 group-hover:text-brand-dark/40'} />
                    <span>Technical</span>
                  </div>
                  {activeTab === 'technical' && <ChevronRight size={14} />}
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-brand-dark/5 space-y-6">
              <div>
                <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold mb-4">Platform Health</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-brand-dark/5">
                    <span className="text-[9px] text-brand-dark/40 uppercase tracking-widest font-mono">INDEX_PAGES</span>
                    <span className="text-xs font-bold text-brand-dark font-mono">{(Array.isArray(pageSettings) ? pageSettings.length : 0) + 50}+</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-brand-dark/5">
                    <span className="text-[9px] text-brand-dark/40 uppercase tracking-widest font-mono">SEO_SCORE</span>
                    <span className="text-xs font-bold text-emerald-500 font-mono">92.4%</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-brand-dark text-white/40 text-[9px] font-mono leading-relaxed">
                <p className="text-brand-gold mb-1 uppercase tracking-widest">Last Update</p>
                {globalSettings?.lastSitemapUpdate ? new Date(globalSettings.lastSitemapUpdate).toISOString() : 'NULL_TIMESTAMP'}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 p-10 space-y-8 bg-white">
            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-5 rounded-2xl flex items-center space-x-4 border ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${message.type === 'success' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest flex-grow">{message.text}</span>
                  <button onClick={() => setMessage(null)} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                    <RefreshCw size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Page SEO Tab */}
            {activeTab === 'pages' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-brand-dark/5">
                  <div>
                    <h3 className="text-3xl font-serif text-brand-dark">Page Indexing</h3>
                    <p className="text-[10px] text-brand-dark/40 uppercase tracking-[0.2em] font-bold mt-1">Manage metadata for core platform nodes</p>
                  </div>
                  <button
                    onClick={handleSavePage}
                    disabled={isSaving}
                    className="flex items-center space-x-3 px-8 py-4 bg-brand-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all disabled:opacity-50 shadow-lg shadow-brand-dark/10"
                  >
                    <Save size={16} />
                    <span>{isSaving ? 'Processing...' : 'Commit Changes'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {Array.isArray(pageSettings) && pageSettings.map((page, index) => (
                    <button
                      key={page.id || page.pagePath || `page-${index}`}
                      onClick={() => setSelectedPage(page)}
                      className={`px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] border transition-all ${
                        selectedPage?.id === page.id
                          ? 'bg-brand-gold text-white border-brand-gold shadow-md'
                          : 'bg-brand-cream/20 text-brand-dark/40 border-brand-dark/5 hover:border-brand-gold hover:text-brand-gold'
                      }`}
                    >
                      {page.pageName}
                    </button>
                  ))}
                </div>

                {selectedPage && (
                  <div className="bg-brand-cream/5 rounded-[2rem] p-8 border border-brand-dark/5">
                    {/* <SEOSettingsForm 
                      metadata={selectedPage} 
                      onChange={(metadata) => setSelectedPage({ ...selectedPage, ...metadata })}
                      pagePath={selectedPage.pagePath}
                    /> */}
                  </div>
                )}
              </motion.div>
            )}

            {/* Entity SEO Tab */}
            {activeTab === 'entities' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-brand-dark/5">
                  <div>
                    <h3 className="text-3xl font-serif text-brand-dark">Entity SEO</h3>
                    <p className="text-[10px] text-brand-dark/40 uppercase tracking-[0.2em] font-bold mt-1">Centralized SEO management for all platform content</p>
                  </div>
                  <button
                    onClick={handleSaveEntity}
                    disabled={isSaving || !selectedEntity}
                    className="flex items-center space-x-3 px-8 py-4 bg-brand-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all disabled:opacity-50 shadow-lg shadow-brand-dark/10"
                  >
                    <Save size={16} />
                    <span>{isSaving ? 'Processing...' : 'Commit Changes'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Entity Selection Sidebar */}
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {entityTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setEntityType(type.id)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border ${
                            entityType === type.id
                              ? 'bg-brand-dark text-white border-brand-dark shadow-md'
                              : 'bg-brand-cream/20 text-brand-dark/40 border-brand-dark/5 hover:border-brand-gold hover:text-brand-gold'
                          }`}
                        >
                          <type.icon size={12} />
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20" size={16} />
                      <input
                        type="text"
                        placeholder="Search entities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold text-xs transition-all"
                      />
                    </div>

                    <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-brand-gold/20">
                      {entities.length > 0 ? (
                        entities.map((entity) => (
                          <button
                            key={entity.id}
                            onClick={() => setSelectedEntity(entity)}
                            className={`w-full text-left px-6 py-4 rounded-2xl transition-all border ${
                              selectedEntity?.id === entity.id
                                ? 'bg-brand-cream/50 border-brand-gold shadow-sm'
                                : 'bg-white border-brand-dark/5 hover:border-brand-gold/30'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-brand-dark block truncate">{entity.entityName}</span>
                              {entity.seoScore && (
                                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                                  Number(entity.seoScore) > 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-yellow-100 text-yellow-600'
                                }`}>
                                  {entity.seoScore}%
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-brand-dark/40 font-mono mt-1 block">/{entity.slug}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center bg-brand-cream/10 rounded-2xl border border-dashed border-brand-dark/10">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">No entities found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Entity SEO Form */}
                  <div className="lg:col-span-2">
                    {selectedEntity ? (
                      <div className="bg-brand-cream/5 rounded-[2rem] p-8 border border-brand-dark/5">
                        <div className="mb-8 pb-6 border-b border-brand-dark/5 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-brand-dark">{selectedEntity.entityName}</h4>
                            <p className="text-[9px] text-brand-dark/40 uppercase tracking-widest font-mono mt-1">ID: {selectedEntity.entityId}</p>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] font-bold text-brand-gold uppercase tracking-widest">
                            <Sparkles size={14} />
                            <span>AI Optimized</span>
                          </div>
                        </div>
                        
                        <SEOSettingsForm 
                          metadata={selectedEntity} 
                          onChange={(metadata) => setSelectedEntity({ ...selectedEntity, ...metadata })}
                          pagePath={`/${selectedEntity.entityType}/${selectedEntity.slug}`}
                          entityType={selectedEntity.entityType}
                          entityData={{ name: selectedEntity.entityName, description: selectedEntity.description }}
                        />
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-12 bg-brand-cream/5 rounded-[2rem] border border-dashed border-brand-dark/10">
                        <div className="p-6 bg-white rounded-full shadow-sm mb-6">
                          <Package size={40} className="text-brand-dark/10" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Select an entity to manage SEO</h4>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Global Settings Tab */}
            {activeTab === 'global' && globalSettings && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-brand-dark/5">
                  <div>
                    <h3 className="text-3xl font-serif text-brand-dark">Global Meta</h3>
                    <p className="text-[10px] text-brand-dark/40 uppercase tracking-[0.2em] font-bold mt-1">Default platform metadata and global site configurations</p>
                  </div>
                  <button
                    onClick={handleSaveGlobal}
                    disabled={isSaving}
                    className="flex items-center space-x-3 px-8 py-4 bg-brand-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all disabled:opacity-50 shadow-lg shadow-brand-dark/10"
                  >
                    <Save size={16} />
                    <span>{isSaving ? 'Processing...' : 'Commit Changes'}</span>
                  </button>
                </div>

                <div className="space-y-10">
                  <section className="bg-brand-cream/5 rounded-[2rem] p-8 border border-brand-dark/5">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mb-8 flex items-center">
                      <Globe size={14} className="mr-3" />
                      Default Metadata Schema
                    </h4>
                    <SEOSettingsForm 
                      metadata={globalSettings.defaultMetadata} 
                      onChange={(metadata) => setGlobalSettings({ ...globalSettings, defaultMetadata: metadata })}
                      showPreview={false}
                    />
                  </section>

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-brand-dark/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mb-8 flex items-center">
                        <BarChart3 size={14} className="mr-3" />
                        Analytics & Tracking
                      </h4>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 font-mono">GA_MEASUREMENT_ID</label>
                          <input
                            type="text"
                            value={globalSettings.googleAnalyticsId}
                            onChange={(e) => setGlobalSettings({ ...globalSettings, googleAnalyticsId: e.target.value })}
                            placeholder="G-XXXXXXXXXX"
                            className="w-full px-6 py-4 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold text-xs font-mono transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 font-mono">GTM_CONTAINER_ID</label>
                          <input
                            type="text"
                            value={globalSettings.googleTagManagerId}
                            onChange={(e) => setGlobalSettings({ ...globalSettings, googleTagManagerId: e.target.value })}
                            placeholder="GTM-XXXXXXX"
                            className="w-full px-6 py-4 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold text-xs font-mono transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-brand-dark/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mb-8 flex items-center">
                        <ImageIcon size={14} className="mr-3" />
                        Identity Assets
                      </h4>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 font-mono">FAVICON_PATH</label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="text"
                              value={globalSettings.favicon}
                              onChange={(e) => setGlobalSettings({ ...globalSettings, favicon: e.target.value })}
                              className="flex-1 px-6 py-4 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold text-xs font-mono transition-all"
                            />
                            <div className="w-14 h-14 bg-brand-cream rounded-2xl flex items-center justify-center border border-brand-dark/5 overflow-hidden shadow-inner">
                              <img src={globalSettings.favicon} alt="Favicon" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {/* Technical SEO Tab */}
            {activeTab === 'technical' && globalSettings && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-brand-dark/5">
                  <div>
                    <h3 className="text-3xl font-serif text-brand-dark">Technical Protocol</h3>
                    <p className="text-[10px] text-brand-dark/40 uppercase tracking-[0.2em] font-bold mt-1">Manage sitemaps and robots.txt configuration</p>
                  </div>
                  <button
                    onClick={handleSaveGlobal}
                    disabled={isSaving}
                    className="flex items-center space-x-3 px-8 py-4 bg-brand-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all disabled:opacity-50 shadow-lg shadow-brand-dark/10"
                  >
                    <Save size={16} />
                    <span>{isSaving ? 'Processing...' : 'Commit Changes'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <div className="bg-brand-cream/5 p-8 rounded-[2rem] border border-brand-dark/5">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold flex items-center">
                          <RefreshCw size={14} className="mr-3" />
                          Sitemap Engine
                        </h4>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${globalSettings.sitemapEnabled ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${globalSettings.sitemapEnabled ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="text-[8px] font-bold uppercase tracking-widest">
                            {globalSettings.sitemapEnabled ? 'Active' : 'Halted'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-brand-dark/60 leading-relaxed mb-8">Automatically generate an XML sitemap for search engines to discover your content nodes and media assets.</p>
                      
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handleRefreshSitemap}
                          disabled={isSaving}
                          className="flex-1 flex items-center justify-center space-x-3 px-6 py-4 bg-brand-gold text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all disabled:opacity-50 shadow-lg shadow-brand-gold/20"
                        >
                          <RefreshCw size={14} className={isSaving ? 'animate-spin' : ''} />
                          <span>Rebuild Sitemap</span>
                        </button>
                        <a 
                          href="/api/seo/sitemap" 
                          target="_blank"
                          className="p-4 bg-white text-brand-dark border border-brand-dark/5 rounded-2xl hover:bg-brand-cream/50 transition-all shadow-sm"
                        >
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    </div>

                    <div className="bg-brand-dark text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Code size={120} />
                      </div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mb-6 flex items-center relative z-10">
                        <Code size={14} className="mr-3" />
                        Schema Protocol
                      </h4>
                      <ul className="space-y-4 relative z-10">
                        {[
                          "Use JSON-LD format for all schema markup.",
                          "Validate your markup using Google's Rich Results Test.",
                          "Ensure product schema includes price, availability, and reviews."
                        ].map((tip, i) => (
                          <li key={`tip-${i}`} className="flex items-start space-x-3">
                            <span className="text-brand-gold font-mono text-[10px]">0{i+1}</span>
                            <span className="text-[10px] text-white/60 leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2rem] border border-brand-dark/5">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mb-6 flex items-center">
                      <FileText size={14} className="mr-3" />
                      Robots.txt Configuration
                    </label>
                    <textarea
                      value={globalSettings.robotsTxt}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, robotsTxt: e.target.value })}
                      className="w-full h-[300px] px-6 py-4 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold text-xs font-mono leading-relaxed transition-all resize-none"
                      placeholder="User-agent: *
Allow: /"
                    />
                    <div className="mt-4 flex items-center space-x-2 text-[9px] text-brand-dark/40 uppercase tracking-widest font-mono">
                      <AlertCircle size={12} />
                      <span>Warning: Improper configuration may impact indexing</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
  );
};

export default SEOManager;
