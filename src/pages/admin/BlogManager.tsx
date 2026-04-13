import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Plus, Search, Filter, MoreVertical, Edit2, Trash2, 
  Eye, Globe, FileText, CheckCircle2, Clock, AlertCircle 
} from 'lucide-react';
import axios from 'axios';
import { BlogPost } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';

const BlogManager = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/blogs');
      if (Array.isArray(response.data)) {
        setBlogs(response.data);
      } else {
        console.error('Blogs response is not an array:', response.data);
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await axios.delete(`/api/admin/blogs/${id}`);
      setBlogs(prev => Array.isArray(prev) ? prev.filter(b => b.id !== id) : []);
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const filteredBlogs = Array.isArray(blogs) ? blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success" icon={Globe}>Published</Badge>;
      case 'draft':
        return <Badge variant="warning" icon={FileText}>Draft</Badge>;
      case 'archived':
        return <Badge variant="neutral" icon={Clock}>Archived</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif mb-4">Blog Management</h1>
          <p className="text-brand-dark/60 font-sans">Create and manage your platform's editorial content.</p>
        </div>
        <Link to="/admin/blogs/new">
          <Button variant="primary" icon={Plus}>
            Create New Post
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <Card variant="technical" className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-dark/20" size={18} />
            <input 
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-none rounded-2xl px-16 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-gold/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  statusFilter === status 
                    ? 'bg-brand-dark text-white' 
                    : 'bg-white text-brand-dark/40 hover:bg-brand-cream/50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Blogs Table */}
      <Card variant="technical" className="overflow-hidden">
        {loading ? (
          <div className="p-24 text-center">
            <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-brand-dark/40 font-bold uppercase tracking-widest text-[10px]">Loading articles...</p>
          </div>
        ) : filteredBlogs.length > 0 ? (
          <Table
            headers={['Article', 'Author', 'Category', 'Status', 'Date', 'Actions']}
          >
            {filteredBlogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-brand-cream/10 transition-colors group">
                <td className="px-10 py-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-cream/50 flex-shrink-0">
                      <img 
                        src={blog.coverImage} 
                        alt={blog.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="font-serif text-brand-dark group-hover:text-brand-gold transition-colors line-clamp-1">
                        {blog.title}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mt-1">
                        {blog.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <p className="text-sm font-medium text-brand-dark">{blog.author.name}</p>
                </td>
                <td className="px-10 py-6">
                  <span className="px-3 py-1 bg-brand-cream/50 rounded-full text-[9px] font-bold uppercase tracking-widest text-brand-dark/60">
                    {blog.category}
                  </span>
                </td>
                <td className="px-10 py-6">
                  {getStatusBadge(blog.status)}
                </td>
                <td className="px-10 py-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link to={`/blog/${blog.slug}`} target="_blank">
                      <Button variant="ghost" size="icon" className="hover:bg-brand-cream">
                        <Eye size={16} />
                      </Button>
                    </Link>
                    <Link to={`/admin/blogs/edit/${blog.id}`}>
                      <Button variant="ghost" size="icon" className="hover:bg-brand-cream">
                        <Edit2 size={16} />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-rose-50 text-rose-500"
                      onClick={() => handleDelete(blog.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="p-24 text-center">
            <div className="w-16 h-16 bg-brand-cream/50 rounded-full flex items-center justify-center text-brand-dark/20 mx-auto mb-6">
              <FileText size={32} />
            </div>
            <h3 className="text-2xl font-serif text-brand-dark mb-2">No articles found</h3>
            <p className="text-brand-dark/60 mb-8">Try adjusting your search or filters.</p>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
              Clear All Filters
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BlogManager;
