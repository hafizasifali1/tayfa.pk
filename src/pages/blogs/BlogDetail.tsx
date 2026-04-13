import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowLeft, Tag, Share2, Bookmark } from 'lucide-react';
import axios from 'axios';
import { BlogPost } from '../../types';

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`/api/blogs/${slug}`);
        setBlog(response.data);
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-4xl font-serif text-brand-dark mb-4">Article Not Found</h2>
        <p className="text-brand-dark/60 mb-8">The story you are looking for does not exist or has been removed.</p>
        <Link 
          to="/blogs"
          className="px-8 py-4 bg-brand-dark text-white rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
        >
          Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Article Header */}
      <header className="relative h-[70vh] flex items-end pb-24 px-4 overflow-hidden bg-brand-dark">
        <div className="absolute inset-0 opacity-50">
          <img 
            src={blog.coverImage} 
            alt={blog.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />
        
        <div className="relative z-10 max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-4 mb-6"
          >
            <span className="px-4 py-2 bg-brand-gold/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold border border-brand-gold/20">
              {blog.category}
            </span>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
              {blog.readTime}
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-8 leading-tight"
          >
            {blog.title}
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between border-t border-white/10 pt-8"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-brand-cream/20 flex items-center justify-center text-white font-serif text-xl border border-white/10">
                {(blog.author?.name || '?').charAt(0)}
              </div>
              <div>
                <p className="text-white font-bold uppercase tracking-widest text-[10px]">By {blog.author.name}</p>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                  {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-3 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors">
                <Share2 size={18} />
              </button>
              <button className="p-3 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors">
                <Bookmark size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="md:w-1/4 order-2 md:order-1">
            <div className="sticky top-24 space-y-12">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-6 pb-4 border-b border-brand-dark/5">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-brand-cream/50 rounded-full text-[9px] font-bold uppercase tracking-widest text-brand-dark/60 border border-brand-dark/5">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-6 pb-4 border-b border-brand-dark/5">
                  Share
                </h4>
                <div className="flex space-x-4">
                  <button className="text-brand-dark/40 hover:text-brand-gold transition-colors">Twitter</button>
                  <button className="text-brand-dark/40 hover:text-brand-gold transition-colors">Facebook</button>
                  <button className="text-brand-dark/40 hover:text-brand-gold transition-colors">LinkedIn</button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:w-3/4 order-1 md:order-2">
            <div 
              className="prose prose-lg prose-brand max-w-none font-sans text-brand-dark/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
            
            <div className="mt-24 pt-12 border-t border-brand-dark/5">
              <Link 
                to="/blogs"
                className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark hover:text-brand-gold transition-colors group"
              >
                <ArrowLeft size={14} className="mr-2 transition-transform group-hover:-translate-x-1" />
                Back to Journal
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
