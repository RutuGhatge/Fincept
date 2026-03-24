import React from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, Cpu, Zap, ShieldAlert } from 'lucide-react';

const TerminalPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-stripe-dark rounded-2xl w-fit mb-12 shadow-2xl"
          >
            <TerminalIcon className="w-12 h-12 text-emerald-500" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-stripe-dark mb-8 tracking-tighter"
          >
            Fincept <br />
            <span className="text-emerald-500">Terminal.</span>
          </motion.h1>
          
          <p className="text-2xl text-stripe-slate leading-relaxed mb-16 max-w-3xl font-medium">
            The power of institutional terminals, reimagined for the modern interface. High-fidelity data, instant execution, and zero clutter.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-6">
              <div className="p-3 bg-stripe-dark rounded-xl w-fit">
                <Cpu className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-3xl font-black text-stripe-dark">Raw High-Fidelity Data</h3>
              <p className="text-lg text-stripe-slate leading-relaxed font-medium">
                Direct access to NSE/BSE feeds with sub-second latency. No middleman, no delays.
              </p>
            </div>
            
            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-6">
              <div className="p-3 bg-stripe-dark rounded-xl w-fit">
                <Zap className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-3xl font-black text-stripe-dark">Instant Execution</h3>
              <p className="text-lg text-stripe-slate leading-relaxed font-medium">
                One-click orders across multiple brokers. Manage your entire trading day from a single terminal.
              </p>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 p-12 bg-emerald-50 rounded-[4rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-10"
          >
            <div className="flex items-start gap-6">
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <ShieldAlert className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-emerald-900 mb-2">Alpha Access</h4>
                <p className="text-emerald-700 font-medium">The Terminal is currently in private Alpha testing for select institutional partners.</p>
              </div>
            </div>
            <button className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all shadow-lg whitespace-nowrap">
              Join Waitlist
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TerminalPage;
