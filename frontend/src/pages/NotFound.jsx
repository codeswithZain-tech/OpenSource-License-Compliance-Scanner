import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticleBackground from '../components/ParticleBackground';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticleBackground />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center z-10"
      >
        <h1 className="text-[150px] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 leading-none select-none">
          404
        </h1>
        <h2 className="text-3xl font-medium mt-4 mb-8 text-gray-300">Page not found</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link 
          to="/"
          className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-brand-primary hover:bg-brand-secondary transition-colors font-medium shadow-[0_0_20px_rgba(139,92,246,0.4)]"
        >
          Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
