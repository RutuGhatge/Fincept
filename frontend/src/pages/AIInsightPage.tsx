import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Target,
  ArrowUpRight,
  PieChart
} from 'lucide-react';

const AIInsightPage: React.FC = () => {
  return (
    <div className="pt-32 pb-24 bg-[#f8fafc] min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stripe-purple/10 text-stripe-purple text-sm font-bold mb-8"
          >
            <Zap className="w-4 h-4" /> AI-Powered Intelligent Analysis
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-stripe-dark mb-8 tracking-tight"
          >
            AI Portfolio <br />
            <span className="text-stripe-purple">Insights.</span>
          </motion.h1>
          <p className="text-2xl text-stripe-slate leading-relaxed">
            Gain the edge with our multi-agent AI. Once your data is connected, Fincept provides institutional-grade assessment and smart recommendations.
          </p>
        </div>

        {/* Mock Analysis Dashboard */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-stripe-dark">Performance Assessment</h3>
                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest">Optimized</span>
              </div>
              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Annualized Yield</p>
                      <p className="text-2xl font-black text-stripe-dark">18.4%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-500 font-bold flex items-center justify-end gap-1">
                      +2.3% <ArrowUpRight className="w-4 h-4" />
                    </p>
                    <p className="text-xs text-slate-400 font-medium whitespace-nowrap">vs Benchmark (Nifty 50)</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <PieChart className="w-6 h-6 text-stripe-blue" />
                    <div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sector Concentration</p>
                      <p className="text-2xl font-black text-stripe-dark">Well Diversified</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-stripe-blue font-bold">12 Sectors</p>
                    <p className="text-xs text-slate-400 font-medium">Auto-rebalanced weekly</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-stripe-dark p-10 rounded-[3rem] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-10 translate-x-1/4">
                <ShieldCheck className="w-64 h-64" />
              </div>
              <h3 className="text-3xl font-black mb-6 relative z-10">Risk Intelligence</h3>
              <p className="text-xl text-slate-400 mb-8 relative z-10 font-medium">
                Our AI identified an overlap between active mutual funds. You are over-exposed to <span className="text-white font-bold">HDFC Bank (8.4%)</span> across 3 different instruments.
              </p>
              <button className="px-8 py-3 bg-white text-stripe-dark rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-all relative z-10">
                Resolve Overlap <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 h-full">
              <h3 className="text-2xl font-black text-stripe-dark mb-10 flex items-center gap-3">
                <Target className="w-6 h-6 text-stripe-purple" /> Smart Recs
              </h3>
              <div className="space-y-6">
                {[
                  { title: "Buy Tata Motors", reason: "AI detects undervaluation vs peers", type: "Opportunity" },
                  { title: "Reduce Pharma", reason: "Sectoral momentum slowing down", type: "Risk Avoidance" },
                  { title: "Diversify into Gold", reason: "Hedging against market volatility", type: "Portfolio Health" }
                ].map((rec, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:border-stripe-purple transition-all">
                    <p className="text-xs font-black text-stripe-purple uppercase tracking-widest mb-2">{rec.type}</p>
                    <h4 className="text-lg font-black text-stripe-dark mb-2 group-hover:text-stripe-purple transition-colors">{rec.title}</h4>
                    <p className="text-sm text-stripe-slate leading-relaxed">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 text-center italic text-stripe-slate font-medium">
          Note: These insights are generated using your connected portfolio data. Connect via API or Manual Upload to activate analysis.
        </div>
      </div>
    </div>
  );
};

export default AIInsightPage;
