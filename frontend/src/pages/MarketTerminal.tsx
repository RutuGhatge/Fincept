import React from 'react';

const Terminal: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-32 container mx-auto px-6">
      <h1 className="text-4xl font-black text-stripe-dark mb-8 tracking-tight">Market Terminal</h1>
      <p className="text-xl text-stripe-slate leading-relaxed max-w-2xl bg-slate-50 p-8 rounded-[2rem] border border-slate-100 italic">
        "Pro-level market terminal with live price updates and deep portfolio valuation across all asset classes."
      </p>
      <div className="mt-12 h-96 bg-slate-900 rounded-[3rem] flex items-center justify-center text-slate-500 font-mono">
        [ TERMINAL INTERFACE PLACEHOLDER ]
      </div>
    </div>
  );
};

export default Terminal;
