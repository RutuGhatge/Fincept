import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings2, Cpu, Zap, ShieldAlert, PieChart, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AllocatePage: React.FC = () => {
  const [portfolioFetched] = useState(false); // Simulated state
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-stripe-dark rounded-2xl w-fit mb-12 shadow-2xl"
          >
            <Settings2 className="w-12 h-12 text-emerald-500" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-stripe-dark mb-8 tracking-tighter"
          >
            Fincept <br />
            <span className="text-emerald-500">Allocate.</span>
          </motion.h1>
          
          <p className="text-2xl text-stripe-slate leading-relaxed mb-16 max-w-3xl font-medium">
            Smart, data-driven investment suggestions. Allocate your next capital efficiently by analyzing your linked portfolio holdings and risk profiles.
          </p>

          {!portfolioFetched ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-12 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200 text-center space-y-8"
            >
              <div className="p-6 bg-white rounded-3xl w-fit mx-auto shadow-sm">
                <Lock className="w-12 h-12 text-slate-400" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-stripe-dark mb-4">Portfolio Required</h3>
                <p className="text-xl text-stripe-slate max-w-xl mx-auto font-medium">
                  To provide accurate allocation suggestions, we first need to analyze your existing holdings.
                </p>
              </div>
              <button 
                onClick={() => navigate('/portfolio')}
                className="px-10 py-5 bg-stripe-blue text-white rounded-2xl font-black text-xl hover:bg-stripe-slate transition-all shadow-xl flex items-center gap-3 mx-auto"
              >
                Fetch Portfolio First <ArrowRight className="w-6 h-6" />
              </button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-6">
                <div className="p-3 bg-stripe-dark rounded-xl w-fit">
                  <Cpu className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-black text-stripe-dark">AI Optimization</h3>
                <p className="text-lg text-stripe-slate leading-relaxed font-medium">
                  Our models suggest exactly where to deploy your next capital based on your current asset distribution.
                </p>
              </div>
              
              <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-6">
                <div className="p-3 bg-stripe-dark rounded-xl w-fit">
                  <Zap className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-black text-stripe-dark">Risk Balancing</h3>
                <p className="text-lg text-stripe-slate leading-relaxed font-medium">
                  Automatically identify sector overlaps and rebalance your portfolio with one click.
                </p>
              </div>
            </div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 p-12 bg-emerald-50 rounded-[4rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-10"
          >
            <div className="flex items-start gap-6">
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <PieChart className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-emerald-900 mb-2">Smart Suggestions</h4>
                <p className="text-emerald-700 font-medium">Personalized fund recommendations based on your unique financial goals and risk appetite.</p>
              </div>
            </div>
            <button className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all shadow-lg whitespace-nowrap">
              Get Started
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AllocatePage;
