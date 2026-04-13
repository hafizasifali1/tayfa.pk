import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Save, ArrowLeft, Image as ImageIcon, Tag, 
  Eye, Globe, FileText, CheckCircle2, Clock, AlertCircle,
  Bold, Italic, List, Link as LinkIcon, Type, Layout,
  User, Calendar, Trash2, Plus, X
} from 'lucide-react';
import axios from 'axios';
// import SEOSettingsForm from '../../components/admin/SEO/SEOSettingsForm';
import { BlogPost, SEOMetadata } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

const BlogEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [blog, setBlog] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1200',
    tags: [],
    category: 'Editorial',
    status: 'draft',
    author: { id: user?.id || '', name: user?.fullName || '' },
    seo: {
      title: '',
      description: '',
      keywords: '',
      robots: 'index, follow'
    } as SEOMetadata
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`/api/blogs/${id}`);
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
      alert('Failed to load blog post.');
      navigate('/admin/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (statusOverride?: 'published' | 'draft') => {
    if (!blog.title || !blog.content) {
      alert('Please fill in at least the title and content.');
      return;
    }

    try {
      setSaving(true);
      const payload = { 
        ...blog, 
        status: statusOverride || blog.status,
        slug: blog.slug || blog.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
      };

      if (isEdit) {
        await axios.patch(`/api/admin/blogs/${id}`, payload);
      } else {
        await axios.post('/api/admin/blogs', payload);
      }
      
      navigate('/admin/blogs');
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog post.');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (newTag && !blog.tags?.includes(newTag)) {
      setBlog({ ...blog, tags: [...(blog.tags || []), newTag] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setBlog({ ...blog, tags: blog.tags?.filter(t => t !== tagToRemove) });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center space-x-6">
          <Link to="/admin/blogs">
            <Button variant="ghost" size="icon" className="hover:bg-brand-cream">
              <ArrowLeft size={24} />
            </Button>
          </Link>
          <div>
            <h1 className="text-5xl font-serif mb-4">{isEdit ? 'Edit Article' : 'Create New Article'}</h1>
            <p className="text-brand-dark/60 font-sans">Craft compelling stories for your audience.</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            icon={FileText}
            onClick={() => handleSave('draft')}
            loading={saving}
          >
            Save Draft
          </Button>
          <Button 
            variant="primary" 
            icon={Globe}
            onClick={() => handleSave('published')}
            loading={saving}
          >
            {isEdit && blog.status === 'published' ? 'Update Article' : 'Publish Article'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-8">
          <Card variant="technical" className="p-10">
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-4 block">
                  Article Title
                </label>
                <input 
                  type="text"
                  placeholder="Enter a captivating title..."
                  value={blog.title}
                  onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                  className="w-full bg-brand-cream/20 border-none rounded-2xl px-8 py-6 text-3xl font-serif text-brand-dark focus:ring-2 focus:ring-brand-gold/20 transition-all placeholder:text-brand-dark/10"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-4 block">
                  Article Content
                </label>
                <div className="border border-brand-dark/5 rounded-[2.5rem] overflow-hidden bg-white">
                  {/* Toolbar */}
                  <div className="flex items-center space-x-2 px-6 py-4 bg-brand-cream/30 border-b border-brand-dark/5">
                    <button className="p-2 hover:bg-white rounded-lg text-brand-dark/60 transition-colors"><Bold size={18} /></button>
                    <button className="p-2 hover:bg-white rounded-lg text-brand-dark/60 transition-colors"><Italic size={18} /></button>
                    <div className="w-px h-6 bg-brand-dark/5 mx-2" />
                    <button className="p-2 hover:bg-white rounded-lg text-brand-dark/60 transition-colors"><List size={18} /></button>
                    <button className="p-2 hover:bg-white rounded-lg text-brand-dark/60 transition-colors"><LinkIcon size={18} /></button>
                    <button className="p-2 hover:bg-white rounded-lg text-brand-dark/60 transition-colors"><ImageIcon size={18} /></button>
                    <div className="w-px h-6 bg-brand-dark/5 mx-2" />
                    <button className="p-2 hover:bg-white rounded-lg text-brand-dark/60 transition-colors"><Type size={18} /></button>
                    <button className="p-2 hover:bg-white rounded-lg text-brand-dark/60 transition-colors"><Layout size={18} /></button>
                  </div>
                  {/* Textarea */}
                  <textarea 
                    placeholder="Write your story here..."
                    value={blog.content}
                    onChange={(e) => setBlog({ ...blog, content: e.target.value })}
                    rows={20}
                    className="w-full border-none p-10 text-lg font-sans text-brand-dark/80 focus:ring-0 transition-all placeholder:text-brand-dark/10 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card variant="technical" className="p-10">
            <h3 className="text-xl font-serif text-brand-dark mb-8">Article Excerpt</h3>
            <p className="text-sm text-brand-dark/40 mb-6">A short summary of the article for the listing page.</p>
            <textarea 
              placeholder="Enter a brief summary..."
              value={blog.excerpt}
              onChange={(e) => setBlog({ ...blog, excerpt: e.target.value })}
              rows={4}
              className="w-full bg-brand-cream/20 border-none rounded-2xl px-8 py-6 text-sm font-sans text-brand-dark focus:ring-2 focus:ring-brand-gold/20 transition-all placeholder:text-brand-dark/10 resize-none"
            />
          </Card>

          <Card variant="technical" className="p-10">
            <h3 className="text-xl font-serif text-brand-dark mb-8">SEO Optimization</h3>
            {/* <SEOSettingsForm 
              metadata={blog.seo || { title: '', description: '', keywords: '', robots: 'index, follow' }}
              onChange={(seo) => setBlog(prev => ({ ...prev, seo }))}
              pagePath={`/blogs/${blog.slug || blog.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')}`}
            /> */}
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
          <Card variant="technical" className="p-10">
            <h3 className="text-xl font-serif text-brand-dark mb-8">Publishing</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-brand-dark/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Status</span>
                <Badge variant={blog.status === 'published' ? 'success' : 'warning'}>
                  {blog.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-brand-dark/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Author</span>
                <span className="text-sm font-medium text-brand-dark">{blog.author?.name}</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-brand-dark/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Created</span>
                <span className="text-sm font-medium text-brand-dark">
                  {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'Now'}
                </span>
              </div>
            </div>
          </Card>

          <Card variant="technical" className="p-10">
            <h3 className="text-xl font-serif text-brand-dark mb-8">Cover Image</h3>
            <div className="space-y-6">
              <div className="aspect-video rounded-2xl overflow-hidden bg-brand-cream/50 mb-6">
                <img 
                  src={blog.coverImage} 
                  alt="Cover Preview" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <input 
                type="text"
                placeholder="Image URL..."
                value={blog.coverImage}
                onChange={(e) => setBlog({ ...blog, coverImage: e.target.value })}
                className="w-full bg-brand-cream/20 border-none rounded-xl px-4 py-3 text-xs font-sans text-brand-dark focus:ring-2 focus:ring-brand-gold/20 transition-all"
              />
              <p className="text-[10px] text-brand-dark/40 italic">Recommended size: 1200x800px</p>
            </div>
          </Card>

          <Card variant="technical" className="p-10">
            <h3 className="text-xl font-serif text-brand-dark mb-8">Organization</h3>
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-4 block">
                  Category
                </label>
                <select 
                  value={blog.category}
                  onChange={(e) => setBlog({ ...blog, category: e.target.value })}
                  className="w-full bg-brand-cream/20 border-none rounded-xl px-4 py-3 text-sm font-sans text-brand-dark focus:ring-2 focus:ring-brand-gold/20 transition-all"
                >
                  <option value="Editorial">Editorial</option>
                  <option value="Trends">Trends</option>
                  <option value="Craftsmanship">Craftsmanship</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="News">News</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-4 block">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags?.map(tag => (
                    <span 
                      key={tag} 
                      className="px-3 py-1 bg-brand-dark text-white rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-2 hover:text-brand-gold">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 bg-brand-cream/20 border-none rounded-xl px-4 py-3 text-xs font-sans text-brand-dark focus:ring-2 focus:ring-brand-gold/20 transition-all"
                  />
                  <Button variant="outline" size="sm" onClick={addTag}>
                    <Plus size={14} />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-4 block">
                  URL Slug
                </label>
                <input 
                  type="text"
                  placeholder="article-url-slug"
                  value={blog.slug}
                  onChange={(e) => setBlog({ ...blog, slug: e.target.value })}
                  className="w-full bg-brand-cream/20 border-none rounded-xl px-4 py-3 text-xs font-sans text-brand-dark focus:ring-2 focus:ring-brand-gold/20 transition-all"
                />
                <p className="text-[10px] text-brand-dark/40 mt-2 italic">Leave empty to auto-generate from title.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
