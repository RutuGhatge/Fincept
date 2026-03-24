import React from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Building2, Users, ArrowRight, ShieldCheck, Globe, Zap } from 'lucide-react';

const SolutionContainer: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}> = ({ title, subtitle, icon, color, features }) => (
  <div className="pt-32 pb-24 min-h-screen bg-white">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 ${color} rounded-2xl w-fit mb-12`}
        >
          {icon}
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-black text-stripe-dark mb-8 tracking-tighter"
        >
          Fincept <br />
          <span className={color.replace('bg-', 'text-').replace('/10', '')}>{title}.</span>
        </motion.h1>
        
        <p className="text-2xl text-stripe-slate leading-relaxed mb-16 max-w-3xl font-medium">
          {subtitle}
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-4 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
              <Zap className={`w-6 h-6 mt-1 flex-shrink-0 ${color.replace('bg-', 'text-').replace('/10', '')}`} />
              <p className="text-xl font-bold text-stripe-dark leading-tight">{f}</p>
            </div>
          ))}
        </div>

        <div className="p-12 bg-stripe-dark rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h3 className="text-3xl font-black mb-4">Ready to upgrade your wealth?</h3>
            <p className="text-slate-400 font-medium italic">Join 5,000+ {title.toLowerCase()} users on the Fincept platform.</p>
          </div>
          <button className="px-10 py-5 bg-white text-stripe-dark rounded-2xl font-black text-xl hover:bg-slate-100 transition-all">
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const Retail: React.FC = () => (
  <SolutionContainer 
    title="Retail" 
    subtitle="Designed for the modern individual investor. Track, analyze, and optimize your personal wealth with ease."
    icon={<UserCircle className="w-12 h-12 text-stripe-blue" />}
    color="bg-stripe-blue/10"
    features={[
      "Multi-broker portfolio tracking",
      "Personalized tax-loss harvesting",
      "AI-powered sector analysis",
      "Real-time market pulse alerts"
    ]}
  />
);

export const Enterprise: React.FC = () => (
  <SolutionContainer 
    title="Enterprise" 
    subtitle="Institutional grade tools for treasury management and corporate investment offices."
    icon={<Building2 className="w-12 h-12 text-stripe-purple" />}
    color="bg-stripe-purple/10"
    features={[
      "Advanced risk modeling APIs",
      "Multi-user permission levels",
      "Corporate compliance reporting",
      "Dedicated relationship manager"
    ]}
  />
);

export const Family: React.FC = () => (
  <SolutionContainer 
    title="Family" 
    subtitle="Consolidated wealth tracking for family offices and high-net-worth individuals."
    icon={<Users className="w-12 h-12 text-stripe-cyan" />}
    color="bg-stripe-cyan/10"
    features={[
      "Inter-generational wealth views",
      "Estate planning insights",
      "Unified asset allocation",
      "Private alternatives tracking"
    ]}
  />
);
