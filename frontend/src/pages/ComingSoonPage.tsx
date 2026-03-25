import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Construction, Clock } from 'lucide-react';

const ComingSoonPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stripe-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stripe-purple/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-stripe-cyan/10 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full bg-white/5 backdrop-blur-xl border border-white/10 p-12 md:p-20 rounded-[4rem] text-center relative z-10 shadow-2xl"
      >
        <div className="w-24 h-24 bg-stripe-dark rounded-3xl mb-12 flex items-center justify-center mx-auto border border-white/10 shadow-xl">
          <Clock className="w-12 h-12 text-stripe-cyan animate-pulse" />
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
          Enterprise <br />
          <span className="text-stripe-cyan">Coming Soon.</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed mb-16 max-w-xl mx-auto">
          Our specialized team is currently building the institutional-grade experience for power users. Sales inquiries and enterprise onboarding will be available shortly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-10 py-5 bg-white text-stripe-dark rounded-2xl font-black text-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
          >
            <ArrowLeft className="w-6 h-6" /> Back to Home
          </button>
          <a 
            href="mailto:sales@fincept.co"
            className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white rounded-2xl font-black text-xl hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-3"
          >
            <Mail className="w-6 h-6" /> Contact Sales
          </a>
        </div>

        <div className="mt-20 pt-12 border-t border-white/5 flex items-center justify-center gap-3 text-slate-500 font-bold uppercase tracking-widest text-sm">
          <Construction className="w-5 h-5" /> Under Construction
        </div>
      </motion.div>
    </div>
  );
};

export default ComingSoonPage;
