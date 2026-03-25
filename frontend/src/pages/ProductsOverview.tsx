import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ShieldCheck, 
  Newspaper, 
  BookOpen, 
  Terminal as TerminalIcon,
  ArrowRight
} from 'lucide-react';

const products = [
  {
    title: "Portfolio Management",
    description: "The most comprehensive portfolio tracker in India. Connect multiple brokers, see your consolidated net worth, and track performance across equity, mutual funds, and cash in a single high-performance dashboard.",
    detail: "Supports Zerodha, Groww, Upstox, Angel One, and 15+ other brokers via secure API sync. Automatic bank statement analysis included for a full financial picture.",
    icon: <BarChart3 className="w-10 h-10 text-stripe-blue" />,
    path: "/portfolio"
  },
  {
    title: "AI Insights",
    description: "Institutional-grade risk analysis for retail investors. Our multi-agent AI system analyzes your holdings every night to detect hidden risks and suggest optimized rebalancing.",
    detail: "Get personalized buy/sell signals based on your risk profile, not generic market sentiment. Avoid over-concentration and emotional selling with data-backed nudges.",
    icon: <ShieldCheck className="w-10 h-10 text-stripe-purple" />,
    path: "/analysis"
  },
  {
    title: "Market Pulse",
    description: "Stop scrolling, start knowing. We filter thousands of news sources and social signals to give you only what affects your specific portfolio and watchlist.",
    detail: "Sentimental analysis on every news item. Understand if a headline is noise or a reason to act. Real-time alerts on corporate actions and regulatory changes.",
    icon: <Newspaper className="w-10 h-10 text-stripe-cyan" />,
    path: "/news"
  },
  {
    title: "Jargon Decoder",
    description: "Finance is complicated, but it shouldn't be. Highlight any financial term or upload a complex term sheet, and our AI will explain it like you're five.",
    detail: "Deep integration with SEBI guidelines and Indian market terminology. Learn while you invest with interactive definitions and real-world examples.",
    icon: <BookOpen className="w-10 h-10 text-orange-500" />,
    path: "/jargon"
  },
  {
    title: "Terminal",
    description: "A fast, lightweight market terminal for the active investor. Real-time L2 data feeds, advanced charting, and deep historical valuation models.",
    detail: "Built for speed. Low-latency updates and customizable workspaces. Track global indices, commodities, and currencies alongside your Indian holdings.",
    icon: <TerminalIcon className="w-10 h-10 text-emerald-500" />,
    path: "/market-data"
  }
];

const ProductsOverview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-24">
          <h1 className="text-5xl md:text-7xl font-black text-stripe-dark mb-8 tracking-tight">
            One platform, <br />
            <span className="text-stripe-blue">unlimited power.</span>
          </h1>
          <p className="text-2xl text-stripe-slate leading-relaxed">
            Explore our suite of specialized tools designed to give you the same edge as institutional investors.
          </p>
        </div>

        <div className="space-y-32">
          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-start gap-16 group`}
            >
              <div className="flex-1 space-y-8">
                <div className="p-5 bg-slate-50 rounded-3xl w-20 h-20 flex items-center justify-center">
                  {product.icon}
                </div>
                <div className="space-y-6">
                  <h2 className="text-4xl font-black text-stripe-dark tracking-tight">{product.title}</h2>
                  <p className="text-2xl text-stripe-slate leading-relaxed">{product.description}</p>
                  <p className="text-lg text-slate-500 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    {product.detail}
                  </p>
                  <button 
                    onClick={() => navigate(product.path)}
                    className="flex items-center gap-3 text-stripe-blue font-bold text-xl hover:text-stripe-dark transition-all group"
                  >
                    Launch {product.title} <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full aspect-video bg-slate-50 rounded-[3rem] border border-slate-100 shadow-inner flex items-center justify-center p-12 overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 blur-3xl bg-gradient-to-br from-stripe-blue to-stripe-cyan" />
                <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none px-4">
                  <h3 className="text-4xl md:text-6xl font-black text-slate-200 uppercase tracking-tighter text-center leading-none opacity-40 transform -rotate-3">
                    {product.title}
                  </h3>
                </div>
                <div className="relative z-10 text-6xl opacity-20 transform rotate-[-5deg] group-hover:scale-110 transition-transform duration-500">
                  {product.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsOverview;
