import React from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Building2, Users, ArrowRight, Check } from 'lucide-react';

const PricingTier: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  price: string;
  recommended?: boolean;
}> = ({ title, subtitle, icon, color, features, price, recommended }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`relative p-10 rounded-[3rem] border-2 transition-all group ${
      recommended 
        ? 'border-stripe-blue bg-white shadow-2xl scale-105 z-10' 
        : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200'
    }`}
  >
    {recommended && (
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-stripe-blue text-white rounded-full text-sm font-black uppercase tracking-widest shadow-xl">
        Most Popular
      </div>
    )}
    
    <div className={`p-4 ${color} rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    
    <h3 className="text-3xl font-black text-stripe-dark mb-2">{title}</h3>
    <p className="text-stripe-slate font-medium mb-8 leading-relaxed">
      {subtitle}
    </p>

    <div className="mb-10">
      <span className="text-5xl font-black text-stripe-dark">{price}</span>
      <span className="text-stripe-slate font-bold ml-2">/month</span>
    </div>

    <div className="space-y-4 mb-12">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`p-1 rounded-full ${color.replace('/10', '/20')}`}>
            <Check className={`w-4 h-4 ${color.replace('bg-', 'text-').replace('/10', '')}`} />
          </div>
          <p className="text-stripe-dark font-bold text-sm tracking-tight">{f}</p>
        </div>
      ))}
    </div>

    <button className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
      recommended 
        ? 'bg-stripe-blue text-white hover:bg-stripe-slate shadow-xl' 
        : 'bg-stripe-dark text-white hover:bg-stripe-slate'
    }`}>
      Choose {title} <ArrowRight className="w-5 h-5" />
    </button>
  </motion.div>
);

const PricingPage: React.FC = () => {
  return (
    <div className="pt-32 pb-40 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-bold uppercase tracking-widest text-stripe-blue mb-4"
          >
            Pricing & Solutions
          </motion.h2>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-stripe-dark mb-8 tracking-tighter"
          >
            Invest in your <br />
            <span className="cool-gradient-text">financial future.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-stripe-slate font-medium leading-relaxed"
          >
            Transparent pricing for individuals, enterprises, and family offices. No hidden fees, just pure intelligence.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          <PricingTier 
            title="Retail"
            subtitle="Perfect for individual investors starting their journey."
            price="₹499"
            icon={<UserCircle className="w-8 h-8 text-stripe-blue" />}
            color="bg-stripe-blue/10"
            features={[
              "Connect up to 3 brokers",
              "Tax-loss harvesting insights",
              "AI Market Pulse alerts",
              "Basic Risk modeling"
            ]}
          />
          <PricingTier 
            title="Enterprise"
            recommended
            subtitle="Institutional grade tools for corporate treasuries."
            price="₹4,999"
            icon={<Building2 className="w-8 h-8 text-stripe-purple" />}
            color="bg-stripe-purple/10"
            features={[
              "Unlimited broker connections",
              "Advanced Risk modeling APIs",
              "Multi-user permissions",
              "Compliance reporting",
              "Dedicated support"
            ]}
          />
          <PricingTier 
            title="Family"
            subtitle="Consolidated wealth tracking for family offices."
            price="₹1,999"
            icon={<Users className="w-8 h-8 text-stripe-cyan" />}
            color="bg-stripe-cyan/10"
            features={[
              "Unified family asset view",
              "Estate planning insights",
              "Private alternatives tracking",
              "Inter-generational views"
            ]}
          />
        </div>

        {/* FAQs or Extra Info */}
        <div className="mt-32 p-12 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h3 className="text-3xl font-black text-stripe-dark mb-4">Need a custom plan?</h3>
            <p className="text-stripe-slate text-lg font-medium">We offer high-volume custom solutions for large institutions.</p>
          </div>
          <button className="px-10 py-5 bg-white text-stripe-dark border border-slate-200 rounded-2xl font-black text-xl hover:bg-slate-50 transition-all shadow-sm">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
