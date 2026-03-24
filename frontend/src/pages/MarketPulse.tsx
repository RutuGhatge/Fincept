import React from 'react';
import { Newspaper, Bell, TrendingUp, TrendingDown, ExternalLink, Search } from 'lucide-react';

const newsItems = [
  { title: 'Market Trends: Top 5 Stocks to Watch This Week', category: 'Stocks', time: '2h ago', sentiment: 'Positive', impact: 'Medium' },
  { title: 'The Future of Decentralized Finance: A deep dive into DeFI', category: 'Crypto', time: '4h ago', sentiment: 'Neutral', impact: 'High' },
  { title: 'Interest rate hikes: What it means for your portfolio', category: 'Economy', time: '6h ago', sentiment: 'Negative', impact: 'High' },
  { title: 'Apple expands into health tech with new AI features', category: 'Tech', time: '8h ago', sentiment: 'Positive', impact: 'Low' },
  { title: 'Energy sector rally continues amidst global supply concerns', category: 'Energy', time: '12h ago', sentiment: 'Positive', impact: 'Medium' },
];

const News = () => {
  return (
    <div className="py-24 px-6 max-w-7xl mx-auto space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-stripe-dark tracking-tight">Market Intelligence</h1>
          <p className="text-lg text-stripe-slate mt-4 max-w-2xl">Real-time financial news analyzed and filtered by our specialized AI agents.</p>
        </div>
        <button className="stripe-button-secondary">
          <Bell size={18} />
          Manage Alerts
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-8">
          {newsItems.map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-xl shadow-stripe hover:shadow-stripe-hover transition-all cursor-pointer group border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                 <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-stripe-blue/10 text-stripe-blue border border-stripe-blue/20">
                    {item.category}
                 </span>
                 <span className="text-xs text-stripe-slate font-medium">{item.time}</span>
              </div>
              <h3 className="text-2xl font-bold text-stripe-dark group-hover:text-stripe-blue transition-colors leading-tight mb-8">
                {item.title}
              </h3>
              <div className="flex flex-wrap gap-6 items-center pt-6 border-t border-gray-100">
                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stripe-slate">
                    Sentiment: 
                    <span className={item.sentiment === 'Positive' ? 'text-green-500' : 'text-red-500'}>
                      {item.sentiment}
                    </span>
                 </div>
                 <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stripe-slate">
                    Impact: <span className="text-stripe-dark">{item.impact}</span>
                 </div>
                 <div className="ml-auto">
                    <div className="flex items-center gap-2 text-stripe-blue font-bold text-sm">
                       Read Full Article <ExternalLink size={16} />
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          <div className="stripe-card !p-6">
            <h3 className="text-lg font-bold mb-6">Contextual Search</h3>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search news..."
                className="w-full bg-stripe-light border border-gray-200 rounded-lg py-2.5 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-stripe-blue"
              />
            </div>
          </div>

          <div className="stripe-card !p-6 bg-gradient-to-br from-stripe-blue to-stripe-cyan text-white border-0 shadow-lg shadow-stripe-blue/20">
            <h3 className="text-lg font-bold mb-4">AI Sentiment Pulse</h3>
            <p className="text-sm leading-relaxed opacity-90 mb-6 italic">
              "The current sentiment for Indian tech indices is high, driven by strong earnings from IT services leaders."
            </p>
            <div className="flex justify-between items-end">
               <span className="text-2xl font-black">78%</span>
               <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Bullish Trend</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
