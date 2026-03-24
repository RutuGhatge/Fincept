import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-24 pb-16 overflow-hidden bg-white">
      {/* Rainbow Background Removed per User Request */}
      
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-stripe-blue/10 text-stripe-blue text-sm font-bold mb-8 backdrop-blur-sm border border-stripe-blue/20">
            Less hype, more insight.
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight text-stripe-dark">
            Invest smarter, <br />
            <span className="stripe-gradient-text">not harder.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-stripe-slate mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            Fincept connects all your brokers, explains every market move, 
            and tells you exactly what to do next — from day one to financial freedom.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/products-overview')}
              className="px-8 py-4 bg-stripe-dark text-white rounded-full font-bold text-lg hover:bg-stripe-slate transition-all transform hover:scale-105 shadow-xl"
            >
              Start investing now
            </button>
            <button 
              onClick={() => navigate('/products-overview')}
              className="px-8 py-4 bg-white/80 backdrop-blur-md text-stripe-dark border border-stripe-dark/10 rounded-full font-bold text-lg hover:bg-white transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              Contact sales <span className="text-xl">→</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
