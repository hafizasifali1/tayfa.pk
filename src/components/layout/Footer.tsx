import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-dark text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="text-3xl font-serif font-bold tracking-[0.2em]">
              TAYFA<span className="text-brand-gold">.</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Curating the finest fashion from Pakistan's top designers. Experience luxury, heritage, and style in every stitch.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-brand-gold transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-brand-gold transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-brand-gold transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-brand-gold font-serif text-lg mb-6">Shopping</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link to="/shop" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link to="/shop?type=clothing" className="hover:text-white transition-colors">Clothing</Link></li>
              <li><Link to="/shop?type=accessories" className="hover:text-white transition-colors">Accessories</Link></li>
              <li><Link to="/shop?type=footwear" className="hover:text-white transition-colors">Footwear</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-brand-gold font-serif text-lg mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-brand-gold font-serif text-lg mb-6">Get in Touch</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-brand-gold" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-brand-gold" />
                <span>support@laam.pk</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin size={16} className="text-brand-gold" />
                <span>Lahore, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 text-center text-white/40 text-xs tracking-widest uppercase">
          © {new Date().getFullYear()} TAYFA Luxe Marketplace. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
