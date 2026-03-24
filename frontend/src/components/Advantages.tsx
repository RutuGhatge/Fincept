import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Cpu, 
  Layers 
} from 'lucide-react';

const advantages = [
  {
    title: "3 Hours Saved Weekly",
    description: "Our users spend 80% less time on manual tracking and news filtering. Focus on strategy, not data entry.",
    icon: <Zap className="w-8 h-8 text-stripe-blue" />,
    color: "bg-blue-500/10"
  },
  {
    title: "MF X-Ray Technology",
    description: "Deep-dive into your mutual funds. See exactly which stocks you own across all your combined holdings.",
    icon: <Layers className="w-8 h-8 text-stripe-purple" />,
    color: "bg-purple-500/10"
  },
  {
    title: "Institutional-Grade Data",
    description: "Get the same data feeds as the pros. Real-time updates and deep historical context for every move.",
    icon: <Cpu className="w-8 h-8 text-stripe-cyan" />,
    color: "bg-cyan-500/10"
  }
];

const Advantages: React.FC = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mb-24">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stripe-blue mb-4">Professional Grade</h2>
          <h3 className="text-4xl md:text-6xl font-black text-stripe-dark mb-8 leading-tight">
            Intelligence <br />
            <span className="cool-gradient-text text-glow-none">simplified.</span>
          </h3>
          <p className="text-xl text-stripe-slate leading-relaxed max-w-xl font-medium">
            Fincept connects directly to your financial life. We decode the complexity of the Indian markets using secure, borderless intelligence models.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {advantages.map((adv, index) => (
            <motion.div
              key={adv.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
            >
              <div className={`mb-8 p-5 ${adv.color} rounded-2xl w-fit group-hover:scale-110 transition-transform`}>
                {adv.icon}
              </div>
              <h4 className="text-2xl font-black mb-4 text-stripe-dark group-hover:cool-gradient-text transition-all">{adv.title}</h4>
              <p className="text-stripe-slate leading-relaxed font-medium transition-colors group-hover:text-stripe-dark">
                {adv.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
