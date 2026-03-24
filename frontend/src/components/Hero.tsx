import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-5xl mx-auto glass-card p-12 md:p-20"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-block px-6 py-2 rounded-full bg-stripe-blue/20 text-white text-sm font-bold mb-10 backdrop-blur-xl border border-white/30 tracking-wider uppercase"
          >
            Less hype, more insight.
          </motion.div>
          
          <h1 className="text-6xl md:text-9xl font-black mb-10 leading-[0.95] tracking-tighter text-white">
            Invest smarter, <br />
            <span className="cool-gradient-text">not harder.</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-white/80 mb-14 leading-relaxed max-w-3xl mx-auto font-medium">
            Fincept connects all your brokers, explains every market move, 
            and tells you exactly what to do next — from day one to financial freedom.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products-overview')}
              className="px-10 py-5 bg-white text-stripe-dark rounded-full font-black text-xl hover:bg-stripe-light transition-all shadow-2xl"
            >
              Start investing now
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products-overview')}
              className="px-10 py-5 bg-transparent text-white border-2 border-white/40 rounded-full font-black text-xl hover:bg-white/10 backdrop-blur-md transition-all flex items-center gap-3 shadow-xl"
            >
              Contact sales <span className="text-2xl">→</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
