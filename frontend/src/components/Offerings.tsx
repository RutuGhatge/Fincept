import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ShieldCheck, 
  Newspaper, 
  BookOpen, 
  Terminal as TerminalIcon,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const offerings = [
  {
    id: 'portfolio',
    title: "Portfolio Management",
    description: "Create, update, and track investment portfolios with institutional-grade tools and real-time synchronization.",
    icon: <BarChart3 className="w-8 h-8 text-stripe-blue" />,
    color: "bg-blue-500/10",
    tag: "Multi-Broker Sync",
    path: "/portfolio"
  },
  {
    id: 'analysis',
    title: "AI Insights",
    description: "Portfolio performance, risk assessment, and smart recommendations tailored to your unique financial goals.",
    icon: <ShieldCheck className="w-8 h-8 text-stripe-purple" />,
    color: "bg-purple-500/10",
    tag: "Risk Intelligence",
    path: "/analysis"
  },
  {
    id: 'news',
    title: "Market Pulse",
    description: "Fetch, filter, and analyze relevant financial news automatically. Stop the noise, start the insights.",
    icon: <Newspaper className="w-8 h-8 text-stripe-cyan" />,
    color: "bg-cyan-500/10",
    tag: "Real-time Intelligence",
    path: "/news"
  },
  {
    id: 'jargon',
    title: "Jargon Decoder",
    description: "AI-powered explanations of financial terms in simple language. Never feel lost in a term sheet again.",
    icon: <BookOpen className="w-8 h-8 text-orange-500" />,
    color: "bg-orange-500/10",
    tag: "Smart Learning",
    path: "/jargon"
  },
  {
    id: 'terminal',
    title: "Terminal",
    description: "Pro-level market terminal with live price updates and deep portfolio valuation across all asset classes.",
    icon: <TerminalIcon className="w-8 h-8 text-emerald-500" />,
    color: "bg-emerald-500/10",
    tag: "Execution Ready",
    path: "/market-data"
  }
];

const Offerings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mb-20">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stripe-cyan mb-4">Feature Products</h2>
          <h3 className="text-4xl md:text-6xl font-black text-white max-w-2xl leading-tight">
            The backbone of your <br />
            <span className="cool-gradient-text">financial journey.</span>
          </h3>
        </div>

        <div className="space-y-12">
          {offerings.map((offering, index) => (
            <motion.div
              key={offering.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative glass-card p-12 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden"
            >
              {/* Subtle Background Pattern */}
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                {offering.icon}
              </div>

              <div className="flex-1 space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${offering.color} backdrop-blur-md`}>
                    {offering.icon}
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider shadow-sm border border-white/20">
                    {offering.tag}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-3xl font-black text-white mb-4 group-hover:cool-gradient-text transition-all">
                    {offering.title}
                  </h4>
                  <p className="text-xl text-white/70 leading-relaxed max-w-xl group-hover:text-white transition-colors">
                    {offering.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 relative z-10">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(offering.path)}
                  className="px-10 py-5 bg-white text-stripe-dark rounded-full font-black text-xl hover:bg-stripe-light transition-all shadow-2xl flex items-center gap-4"
                >
                  Start Now <ArrowRight className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <button 
            onClick={() => navigate('/benefits')}
            className="text-stripe-blue font-bold text-lg hover:text-stripe-dark transition-all flex items-center justify-center gap-2 group"
          >
            Explore all benefits <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Offerings;
