import React from 'react';
import { motion } from 'framer-motion';
import { 
  Newspaper, 
  TrendingUp, 
  AlertCircle,
  ExternalLink,
  Filter,
  ArrowRight
} from 'lucide-react';

const newsData = [
  {
    category: "Indian Equity",
    title: "Reliance to invest $10B in Green Energy over next 3 years",
    summary: "RIL's pivot to renewable energy gathers pace as board approves massive capital expenditure for solar and hydrogen projects.",
    sentiment: "Positive",
    time: "2 hours ago"
  },
  {
    category: "Regulatory",
    title: "SEBI proposes new norms for Index Provider registration",
    summary: "Market regulator looks to bring index providers under its direct oversight to improve transparency and governance.",
    sentiment: "Neutral",
    time: "4 hours ago"
  },
  {
    category: "Macro",
    title: "India's GST collection hits record high in March",
    summary: "Robust economic activity and improved compliance drive tax collections to an all-time peak of ₹1.82 lakh crore.",
    sentiment: "Positive",
    time: "6 hours ago"
  }
];

const MarketPulsePage: React.FC = () => {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-stripe-dark mb-8 tracking-tight"
          >
            Market <br />
            <span className="text-stripe-cyan">Pulse.</span>
          </motion.h1>
          <p className="text-2xl text-stripe-slate leading-relaxed">
            Stop the noise, start the insights. We filter thousands of news sources and social signals to give you only what affects your specific portfolio.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-12">
          {/* Filtering Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
              <h3 className="font-bold text-stripe-dark mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5 text-stripe-cyan" /> Filters
              </h3>
              <div className="space-y-4">
                {['All News', 'My Portfolio', 'Watchlist', 'Institutional', 'Regulatory'].map((f) => (
                  <label key={f} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-stripe-cyan focus:ring-stripe-cyan" checked={f === 'All News'} />
                    <span className="text-stripe-slate font-medium group-hover:text-stripe-dark transition-colors">{f}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
              <h3 className="font-bold text-stripe-dark mb-4">API Source</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium italic">
                Market news API keys will be provided soon to fetch global and local real-time data.
              </p>
            </div>
          </div>

          {/* News Feed */}
          <div className="lg:col-span-3 space-y-8">
            {newsData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-stripe-cyan/5 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-1 rounded-full bg-white text-stripe-dark text-xs font-black uppercase tracking-widest shadow-sm">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                      {item.time}
                    </span>
                  </div>
                  <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                    item.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {item.sentiment === 'Positive' ? <TrendingUp className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {item.sentiment} Sentiment
                  </div>
                </div>
                
                <h2 className="text-3xl font-black text-stripe-dark mb-4 group-hover:text-stripe-cyan transition-colors leading-tight">
                  {item.title}
                </h2>
                <p className="text-xl text-stripe-slate leading-relaxed mb-8">
                  {item.summary}
                </p>
                
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-stripe-cyan font-bold hover:text-stripe-dark transition-all">
                    Read more <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 font-bold hover:text-stripe-dark transition-all">
                    Show impact on my portfolio <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            
            <button className="w-full py-6 bg-slate-100 text-stripe-slate rounded-[2rem] font-bold hover:bg-slate-200 transition-all border border-slate-200 shadow-inner">
              Load More Insights
            </button>
          </div>
        </div>
        {/* External News Sources Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-12 bg-stripe-dark rounded-[4rem] text-center space-y-12 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-stripe-cyan/10 blur-[80px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="space-y-4 relative z-10">
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
              Read more news in details, <br />
              <span className="text-stripe-cyan">gain more information.</span>
            </h3>
            <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">
              Deepen your research by visiting our trusted external financial intelligence partners.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {[
              { name: "Moneycontrol", url: "https://www.moneycontrol.com/" },
              { name: "Chittorgarh", url: "https://www.chittorgarh.com/" },
              { name: "Financial Express", url: "https://www.financialexpress.com/" },
              { name: "The Economic Times", url: "https://economictimes.indiatimes.com/" }
            ].map((source) => (
              <a 
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-stripe-cyan/50 transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <span className="text-white font-black text-lg tracking-tight group-hover:text-stripe-cyan transition-colors">
                    {source.name}
                  </span>
                  <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>

  );
};

export default MarketPulsePage;
