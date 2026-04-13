import React from 'react';
import { motion } from 'motion/react';
import { Store, TrendingUp, Users, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-all duration-300 group"
  >
    <div className="w-12 h-12 bg-brand-gold/20 rounded-2xl flex items-center justify-center text-brand-gold mb-6 group-hover:bg-brand-gold group-hover:text-white transition-colors duration-300">
      <Icon size={24} />
    </div>
    <h3 className="text-white text-xl font-serif mb-2">{title}</h3>
    <p className="text-white/40 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const SellerOnboarding = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="bg-brand-dark rounded-[4rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-dark to-[#1a1510]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Content Area */}
          <div className="space-y-8">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-brand-gold uppercase tracking-[0.4em] font-bold text-xs block"
            >
              Join Our Marketplace
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl text-white font-serif leading-tight"
            >
              Become a <span className="italic text-brand-gold">TAYFA</span> Seller
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/60 text-lg leading-relaxed font-light max-w-lg"
            >
              Join hundreds of brands selling on TAYFA. Reach a growing customer base, manage your inventory with ease, and grow your fashion business.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link 
                to="/seller/register" 
                className="inline-block bg-brand-gold text-white px-10 py-5 rounded-full font-bold tracking-widest uppercase hover:bg-white hover:text-brand-dark transition-all duration-500 shadow-xl shadow-brand-gold/20"
              >
                Start Selling Today
              </Link>
            </motion.div>
          </div>

          {/* Right Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard 
              icon={Store} 
              title="Your Own Store" 
              description="Set up your brand storefront and showcase your collections." 
            />
            <FeatureCard 
              icon={TrendingUp} 
              title="Grow Sales" 
              description="Reach thousands of customers globally and scale your brand." 
            />
            <FeatureCard 
              icon={Users} 
              title="Support" 
              description="Access our 24/7 seller support team to help you at every step." 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Secure" 
              description="Safe and secure payments with real-time tracking and analytics." 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerOnboarding;
