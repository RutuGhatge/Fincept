import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Cpu, 
  Layers 
} from 'lucide-react';
import earthGlobeImg from '../assets/earth_globe.png';

const advantages = [
  {
    title: "3 Hours Saved Weekly",
    description: "Our users spend 80% less time on manual tracking and news filtering. Focus on strategy, not data entry.",
    icon: <Zap className="w-8 h-8 text-stripe-blue" />,
    color: "bg-blue-500/20"
  },
  {
    title: "MF X-Ray Technology",
    description: "Deep-dive into your mutual funds. See exactly which stocks you own across all your combined holdings.",
    icon: <Layers className="w-8 h-8 text-stripe-purple" />,
    color: "bg-purple-500/20"
  },
  {
    title: "Institutional-Grade Data",
    description: "Get the same data feeds as the pros. Real-time updates and deep historical context for every move.",
    icon: <Cpu className="w-8 h-8 text-stripe-cyan" />,
    color: "bg-cyan-500/20"
  }
];

const Advantages: React.FC = () => {
  return (
    <section className="py-24 bg-[#0a2540] relative overflow-hidden text-white">
      {/* Earth Globe Background Section - Restricted to this section */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-40 pointer-events-none overflow-hidden h-full">
        <img 
          src={earthGlobeImg}
          alt="Global Network"
          className="w-full h-full object-contain transform translate-x-1/4 scale-150 rotate-12"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a2540] via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mb-24">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stripe-cyan mb-4">The Backbone of Finance</h2>
          <h3 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
            Professional-grade <br />
            <span className="text-stripe-blue text-glow">intelligence.</span>
          </h3>
          <p className="text-xl text-slate-300 leading-relaxed max-w-xl font-medium">
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
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-10 group"
            >
              <div className={`mb-8 p-5 ${adv.color} rounded-2xl w-fit group-hover:scale-110 transition-transform shadow-inner`}>
                {adv.icon}
              </div>
              <h4 className="text-2xl font-black mb-4 text-white group-hover:cool-gradient-text transition-all">{adv.title}</h4>
              <p className="text-slate-200 leading-relaxed font-medium">
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
