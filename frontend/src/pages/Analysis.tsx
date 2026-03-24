import React from 'react';
import { TrendingUp, ShieldAlert, Zap, MessageSquare, Send } from 'lucide-react';

const Analysis = () => {
  return (
    <div className="py-24 px-6 max-w-7xl mx-auto space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-5xl font-extrabold text-stripe-dark tracking-tight">AI Analysis & Insights</h1>
        <p className="text-xl text-stripe-slate">Deep-dive technical assessment of your investment strategy.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="stripe-card border-l-4 border-stripe-blue">
          <div className="flex items-center gap-4 mb-6">
            <Zap className="text-stripe-blue" size={24} />
            <h3 className="text-2xl font-bold">Performance Breakdown</h3>
          </div>
          <p className="text-stripe-slate leading-relaxed mb-6">
            Your portfolio has outperformed the benchmark index by <span className="text-stripe-dark font-bold">12.5%</span>. 
            The high tech concentration is paying off, but risk is increasing.
          </p>
          <div className="h-2 bg-stripe-light rounded-full overflow-hidden">
             <div className="h-full bg-stripe-blue w-[85%]"></div>
          </div>
          <p className="text-xs text-stripe-slate mt-2 font-bold uppercase tracking-widest">Efficiency Score: 85/100</p>
        </div>

        <div className="stripe-card border-l-4 border-stripe-purple">
          <div className="flex items-center gap-4 mb-6">
            <ShieldAlert className="text-stripe-purple" size={24} />
            <h3 className="text-2xl font-bold">Risk Exposure</h3>
          </div>
          <p className="text-stripe-slate leading-relaxed mb-6">
            Moderate-High risk detected. Portfolio sensitivity to interest rates is at a 6-month high. 
            Consider hedging with fixed-income assets.
          </p>
          <div className="h-2 bg-stripe-light rounded-full overflow-hidden">
             <div className="h-full bg-stripe-purple w-[72%]"></div>
          </div>
          <p className="text-xs text-stripe-slate mt-2 font-bold uppercase tracking-widest">Risk Factor: 7.2/10</p>
        </div>
      </div>

      <div className="bg-stripe-dark rounded-2xl p-12 text-white relative overflow-hidden group">
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-3xl font-extrabold mb-6">AI Strategy Assistant</h3>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed italic">
            "Hello! I've analyzed your holdings. Based on recent market moves, I recommend a 5% allocation shift from speculative tech to infrastructure bonds."
          </p>
          <div className="flex gap-4">
             <button className="stripe-button bg-stripe-blue hover:bg-stripe-blue/90 text-white px-8 py-3">View Full Report</button>
             <button className="stripe-button bg-white/10 hover:bg-white/20 text-white px-8 py-3 backdrop-blur-md">Chat with Agent</button>
          </div>
        </div>
        <div className="absolute right-[-10%] top-[-10%] w-96 h-96 bg-stripe-blue/20 rounded-full blur-3xl group-hover:bg-stripe-purple/20 transition-all duration-700"></div>
      </div>
    </div>
  );
};

export default Analysis;
