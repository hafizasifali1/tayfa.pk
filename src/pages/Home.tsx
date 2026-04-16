import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';
import { products as mockProducts } from '../data/products';
import Price from '../components/common/Price';
import ProductCard from '../components/common/ProductCard';
import SellerOnboarding from '../components/home/SellerOnboarding';
import SEO from '../components/common/SEO';
import { useSEO } from '../hooks/useSEO';
import { productService } from '../services/api';

const Home = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productService.getAll(),
          axios.get('/api/categories?isFeatured=true&isActive=true')
        ]);
        setProducts(productsData.length > 0 ? productsData : mockProducts);
        setCategories(categoriesData.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setProducts(mockProducts);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const { globalSettings, pageMetadata } = useSEO('/');

  return (
    <div className="space-y-12 pb-12">
      <SEO metadata={pageMetadata || undefined} defaultMetadata={globalSettings?.defaultMetadata} />
      {/* Hero Section */}
      <section className="relative h-[95vh] overflow-hidden">
        <div className="absolute inset-0">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src="/homepage-background-color.png" 
            alt="Luxury Fashion" 
            className="w-full h-full object-fit"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/80 via-brand-dark/40 to-transparent" />
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-start text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="text-brand-gold uppercase tracking-[0.5em] font-bold text-xs mb-6 block">
              Est. 2026 • Global Luxury Marketplace
            </span>
            {/* <h1 className="text-4xl sm:text-7xl md:text-9xl font-serif mb-8 leading-[0.9] tracking-tight">
              Discover Comfort. <br />
              <span className="italic text-brand-gold">Shop Effortlessly.</span>
            </h1> */}
   
            <h1 className="text-3xl sm:text-6xl md:text-8xl font-serif mb-8 leading-[0.9] tracking-tight">
  Discover Comfort. <br />
  <span className="italic text-brand-gold">Shop Effortlessly.</span>
</h1>
           <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-lg leading-relaxed font-normal">
  A curated marketplace for modern everyday wear.
</p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link 
                to="/shop" 
                className="group flex items-center justify-center space-x-3 bg-brand-gold text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold tracking-widest uppercase hover:bg-white hover:text-brand-dark transition-all duration-500 shadow-xl shadow-brand-gold/20"
              >
                <span>Shop New Arrivals</span>
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link 
                to="/shop?filter=popular" 
                className="group flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold tracking-widest uppercase hover:bg-white/20 transition-all duration-500"
              >
                <span>View Lookbook</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-brand-gold to-transparent" />
        </motion.div>
      </section>

      {/* Brand Story Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                // src="https://picsum.photos/seed/crt/800/1000" 
                src="/OurHeritage/OurHeritage-image.png"
                alt="Craftsmanship" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-brand-gold p-12 rounded-[2.5rem] hidden md:block shadow-2xl">
              <p className="text-white text-4xl font-serif italic mb-2">100%</p>
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Authentic Designer Wear</p>
            </div>
          </div>
          <div className="space-y-8">
            <span className="text-brand-gold uppercase tracking-[0.3em] font-bold text-xs">Our Heritage</span>
            <h2 className="text-5xl md:text-6xl font-serif leading-tight font-medium">Where Comfort Meets Curated Style
</h2>
            <p className="text-brand-dark-muted leading-relaxed text-lg font-normal">
              At TAYFA, we believe fashion should feel as good as it looks. That’s why we bring together brands that focus on comfort, quality, and effortless design. Our platform makes it easy to explore, discover, and shop pieces that fit seamlessly into your everyday life.
            </p>
            <div className="grid grid-cols-2 gap-x-12 gap-y-10 pt-10">
              {[
                { icon: '/OurHeritage/Free_shipping_v2.png', title: 'Free Shipping', desc: 'On orders over PKR 3,000' },
                { icon: '/OurHeritage/Easy-returns.png', title: 'Easy Returns', desc: '7-day return policy' },
                { icon: '/OurHeritage/Secure-payment.png', title: 'Secure Payment', desc: '100% secure checkout' },
                { icon: '/OurHeritage/Support.png', title: 'Support', desc: '24/7 customer service' },
              ].map((item) => (
                <div key={item.title} className="flex items-center space-x-5 group">
                  <div className={`${item.title === 'Free Shipping' ? 'w-14 h-14' : 'w-12 h-12'} shrink-0 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center`}>
                    <img src={item.icon} alt={item.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-serif font-semibold text-brand-dark tracking-tight leading-none">{item.title}</h4>
                    <p className="text-xs font-medium text-brand-dark/60 tracking-wide uppercase">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* <Link to="/about" className="inline-flex items-center space-x-2 text-brand-gold font-bold uppercase tracking-widest text-xs hover:underline pt-4">
              <span>Read Our Story</span>
              <ArrowRight size={14} />
            </Link> */}
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif mb-4">Our Collections</h2>
            <div className="w-20 h-1 bg-brand-gold mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.slice(0, 3).map((collection) => (
              <motion.div
                key={collection.id}
                whileHover={{ y: -10 }}
                className="group relative h-[400px] sm:h-[600px] overflow-hidden rounded-[2.5rem] cursor-pointer"
              >
                <img 
                  src={collection.icon || `https://picsum.photos/seed/${collection.slug}/800/1000`} 
                  alt={collection.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10">
                  <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] mb-2 block">Explore Collection</span>
                  <h3 className="text-white text-4xl font-serif mb-6">{collection.name}</h3>
                  <Link 
                    to={collection.parentId ? `/shop?categoryId=${collection.id}` : `/shop?parentCategoryId=${collection.id}`} 
                    className="inline-flex items-center space-x-2 bg-white text-brand-dark px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all"
                  >
                    <span>Shop Collection</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-serif mb-2 font-medium">Featured Collection</h2>
              <p className="text-brand-dark-muted font-medium">Handpicked luxury pieces for your wardrobe</p>
            </div>
            <Link to="/shop" className="text-brand-gold font-medium hover:underline flex items-center space-x-2">
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-7">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Truck, title: 'Global Express', desc: 'Fast and secure delivery to over 100+ countries with real-time tracking.' },
            { icon: ShieldCheck, title: 'Certified Authentic', desc: 'Every piece is 100% original, sourced directly from authorized designer houses.' },
            { icon: Star, title: 'Curated Excellence', desc: 'Our fashion experts handpick each item to ensure the highest standards of quality.' },
          ].map((feature, idx) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="group flex flex-col items-center text-center space-y-6 p-10 rounded-[3rem] bg-white border border-brand-dark/5 hover:border-brand-gold/20 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-gold/5"
            >
              <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all duration-500">
                <feature.icon size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-semibold">{feature.title}</h3>
                <p className="text-brand-dark-muted text-sm leading-relaxed font-normal">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Seller Onboarding */}
      <SellerOnboarding />

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-[#2C2926] rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-serif">Join the TAYFA Circle</h2>
            <p className="text-white/60">Subscribe to receive updates on new collections, exclusive events, and seasonal sales.</p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow bg-white/10 border border-white/20 rounded-full px-8 py-4 focus:outline-none focus:border-brand-gold transition-colors"
                required
              />
              <button className="bg-brand-gold text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-brand-dark transition-all">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
