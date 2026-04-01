import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ShieldCheck, 
  Newspaper, 
  BookOpen, 
  Settings2,
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
    id: 'allocate',
    title: "Allocate",
    description: "Smart allocation suggests exactly where to invest your next money by analyzing your linked portfolio holdings and risk profiles.",
    icon: <Settings2 className="w-8 h-8 text-emerald-500" />,
    color: "bg-emerald-500/10",
    tag: "Capital Optimizer",
    path: "/allocate"
  }

];

const Offerings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-background-light dark:bg-background-dark relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mb-20">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stripe-blue mb-4">Feature Products</h2>
          <h3 className="text-4xl md:text-6xl font-black text-heading-light dark:text-heading-dark max-w-2xl leading-tight">
            The backbone of your <br />
            <span className="cool-gradient-text">financial journey.</span>
          </h3>
        </div>

        <div className="space-y-12">
          {offerings.map((offering, index) => (
            <motion.div
              key={offering.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-12 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden hover:bg-card-light dark:hover:bg-card-dark hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
            >
              <div className="flex-1 space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${offering.color}`}>
                    {offering.icon}
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-stripe-blue/10 text-stripe-blue text-xs font-bold uppercase tracking-wider shadow-sm border border-stripe-blue/20">
                    {offering.tag}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-3xl font-black text-heading-light dark:text-heading-dark mb-4 group-hover:cool-gradient-text transition-all">
                    {offering.title}
                  </h4>
                  <p className="text-xl text-stripe-slate dark:text-slate-400 leading-relaxed max-w-xl group-hover:text-heading-light dark:group-hover:text-heading-dark transition-colors">
                    {offering.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 relative z-10">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(offering.path)}
                  className="px-10 py-5 bg-stripe-dark text-white rounded-full font-black text-xl hover:bg-stripe-slate transition-all shadow-xl flex items-center gap-4"
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
            className="text-stripe-blue font-bold text-lg hover:text-heading-light dark:hover:text-heading-dark transition-all flex items-center justify-center gap-2 group"
          >
            Explore all benefits <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Offerings;
