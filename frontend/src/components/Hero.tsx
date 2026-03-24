import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-32 pb-16 overflow-hidden bg-white">
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          {/* Top Tagline */}
          <div className="inline-block px-8 py-2.5 rounded-full bg-slate-50 text-stripe-blue text-sm md:text-base font-black mb-12 border border-slate-100 shadow-sm whitespace-nowrap">
            Less hype, more insight. <span className="text-slate-300 mx-3">|</span> <span className="text-stripe-purple">The Fincept Standard.</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-[8rem] font-black mb-12 leading-[1.1] tracking-tighter text-stripe-dark lg:px-4">
            Invest smarter, <br />
            <span className="stripe-gradient-text">not harder.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-stripe-slate mb-14 leading-relaxed max-w-3xl mx-auto font-bold italic">
            "Fincept connects all your brokers, explains every market move, 
            and tells you exactly what to do next — from day one to financial freedom."
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products-overview')}
              className="px-10 py-5 bg-stripe-dark text-white rounded-full font-black text-xl hover:bg-stripe-slate transition-all shadow-2xl"
            >
              Start investing now
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products-overview')}
              className="px-10 py-5 bg-white text-stripe-dark border-2 border-slate-100 rounded-full font-black text-xl hover:border-stripe-blue transition-all flex items-center gap-3 shadow-md"
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
