import React, { useState } from 'react';
import { BookOpen, Search, Sparkles, ChevronRight } from 'lucide-react';

const termsByAlpha = [
  { term: 'EBITDA', definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortization. A measure of a company\'s overall financial performance.', simple: 'Essentially, how much money a business makes before paying bills and accounting for equipment wear and tear.' },
  { term: 'Quantitative Easing', definition: 'A monetary policy where a central bank purchases government securities or other financial assets to inject money into the economy.', simple: 'The central bank printing money to stimulate spending and lending.' },
  { term: 'Capital Gains', definition: 'The profit realized from the sale of an asset that has increased in value.', simple: 'The money you make when you sell something for more than you bought it for.' },
  { term: 'Dividend Yield', definition: 'A financial ratio that shows how much a company pays out in dividends each year relative to its stock price.', simple: 'The interest rate you get on your stock investment from the company\'s profits.' },
  { term: 'Expense Ratio', definition: 'A measure of what it costs an investment company to operate a mutual fund or ETF.', simple: 'The hidden fee you pay to the fund manager to manage your money.' },
];

const Jargon = () => {
  return (
    <div className="py-24 px-6 max-w-7xl mx-auto space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-5xl font-extrabold text-stripe-dark tracking-tight">Jargon Explainer</h1>
        <p className="text-xl text-stripe-slate">Complex financial terms decoded into simple language using AI.</p>
      </div>

      <div className="relative max-w-3xl mx-auto">
        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-stripe-blue">
          <Search size={28} strokeWidth={2.5} />
        </span>
        <input 
          type="text" 
          placeholder="Search for a term (e.g. EBITDA)"
          className="w-full bg-white border border-gray-200 shadow-stripe rounded-2xl py-6 pl-16 pr-8 text-xl focus:outline-none focus:ring-2 focus:ring-stripe-blue/20 transition-all placeholder:text-gray-300 font-display font-medium"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 px-4 py-2 bg-stripe-blue/5 text-stripe-blue border border-stripe-blue/10 rounded-xl text-xs font-bold flex items-center gap-2">
           <Sparkles size={16} />
           Smart Suggest
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
        {termsByAlpha.map((item) => (
          <div key={item.term} className="bg-white p-8 rounded-xl shadow-stripe hover:shadow-stripe-hover transition-all cursor-pointer group border border-gray-500/5 hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-stripe-dark mb-6 flex justify-between items-center group-hover:text-stripe-blue transition-colors">
              {item.term}
              <ChevronRight size={20} className="text-gray-300 group-hover:text-stripe-blue transition-transform" />
            </h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-stripe-slate font-black uppercase tracking-widest mb-2 opacity-50">Standard Definition</p>
                <p className="text-sm leading-relaxed text-stripe-slate italic">{item.definition}</p>
              </div>
              <div className="p-5 bg-stripe-blue/5 rounded-xl border border-stripe-blue/10">
                <p className="text-[10px] text-stripe-blue font-black uppercase tracking-widest mb-2">Simplicity Check</p>
                <p className="text-[15px] font-medium leading-relaxed text-stripe-dark">{item.simple}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jargon;
