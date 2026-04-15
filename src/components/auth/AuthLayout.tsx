import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-brand-cream/30 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center space-x-0">
            <h2 className="text-2xl sm:text-4xl font-serif text-brand-dark">
              {title}
            </h2>
            <Link to="/">
              <img 
                src="/Tayfa.png" 
                alt="TAYFA" 
                className="h-10 sm:h-12 w-auto object-contain translate-y-1"
              />
            </Link>
          </div>
          <p className="mt-3 text-center text-[10px] sm:text-sm text-brand-dark/60">
            {subtitle}
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-6 sm:py-8 px-5 sm:px-10 shadow-xl rounded-2xl sm:rounded-[2rem] border border-brand-dark/5">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
