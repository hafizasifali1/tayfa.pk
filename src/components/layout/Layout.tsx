import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'motion/react';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-grow"
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  );
};

export default Layout;
