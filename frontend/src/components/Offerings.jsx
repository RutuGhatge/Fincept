import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ShieldCheck, Newspaper, BookOpen, Settings2, ArrowRight } from 'lucide-react';

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
    id: 'allocate',
    title: "Smart Capital Allocate",
    description: "Smart allocation suggests exactly where to invest your next money by analyzing your linked portfolio holdings and risk profiles.",
    icon: <Settings2 className="w-8 h-8 text-emerald-500" />,
    color: "bg-emerald-500/10",
    tag: "Capital Optimizer",
    path: "/allocate"
  }
];

const Offerings = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-background-light dark:bg-background-dark relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <h3 className="text-4xl md:text-6xl font-black text-heading-light dark:text-heading-dark max-w-2xl leading-tight">
            The backbone of your <br />
            <span className="cool-gradient-text">financial journey.</span>
          </h3>
        </div>

        <div className="space-y-8">
          {offerings.map((offering, index) => (
            <motion.div
              key={offering.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group relative bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 p-8 md:p-12 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-8 overflow-hidden hover:bg-card-light dark:hover:bg-card-dark hover:shadow-2xl hover:border-stripe-purple/30 transition-all duration-300"
            >
              <div className="flex-1 space-y-5 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-2xl ${offering.color}`}>
                    {offering.icon}
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-stripe-blue/10 text-stripe-blue text-xs font-bold uppercase tracking-wider border border-stripe-blue/20">
                    {offering.tag}
                  </span>
                </div>

                <div>
                  <h4 className="text-2xl md:text-3xl font-black text-heading-light dark:text-heading-dark mb-3 group-hover:cool-gradient-text transition-all">
                    {offering.title}
                  </h4>
                  <p className="text-base md:text-lg text-stripe-slate dark:text-slate-400 leading-relaxed max-w-2xl group-hover:text-heading-light dark:group-hover:text-heading-dark transition-colors">
                    {offering.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 relative z-10 w-full md:w-auto">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(offering.path)}
                  className="w-full md:w-auto px-8 py-4 bg-stripe-dark text-white rounded-full font-black text-base hover:bg-stripe-slate transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  Start Now <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offerings;
