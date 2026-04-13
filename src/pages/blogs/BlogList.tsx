import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import axios from 'axios';
import { BlogPost } from '../../types';

const BlogList = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get('/api/blogs?status=published');
        setBlogs(response.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-brand-cream/20 min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-brand-dark">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000" 
            alt="Editorial" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-brand-gold font-bold uppercase tracking-[0.3em] text-sm mb-4 block"
          >
            Editorial
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-serif text-white mb-6"
          >
            The Tayfa Journal
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-2xl mx-auto font-sans text-lg"
          >
            Exploring the intersection of tradition, craftsmanship, and modern luxury.
          </motion.p>
        </div>
      </section>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <motion.article
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group"
            >
              <Link to={`/blog/${blog.slug}`} className="block relative h-72 overflow-hidden">
                <img 
                  src={blog.coverImage} 
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-dark">
                    {blog.category}
                  </span>
                </div>
              </Link>
              
              <div className="p-10">
                <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-4">
                  <span className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <User size={12} className="mr-1" />
                    {blog.author.name}
                  </span>
                </div>
                
                <Link to={`/blog/${blog.slug}`}>
                  <h2 className="text-2xl font-serif text-brand-dark mb-4 group-hover:text-brand-gold transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                </Link>
                
                <p className="text-brand-dark/60 font-sans text-sm mb-8 line-clamp-3 leading-relaxed">
                  {blog.excerpt}
                </p>
                
                <Link 
                  to={`/blog/${blog.slug}`}
                  className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark hover:text-brand-gold transition-colors group/link"
                >
                  Read Article
                  <ArrowRight size={14} className="ml-2 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {blogs.length === 0 && (
          <div className="text-center py-24">
            <h2 className="text-3xl font-serif text-brand-dark mb-4">No articles found</h2>
            <p className="text-brand-dark/60">Check back soon for new stories and updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
