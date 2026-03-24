import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Zap, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const benefits = [
  {
    title: 'Precision Portfolio Management',
    description: 'Our proprietary multi-broker sync engine ensures your portfolio is always up-to-date, reflecting every trade and dividend across all your accounts instantly.',
    icon: CheckCircle2,
    details: ['Real-time Net Worth tracking', 'Automated dividend logging', 'Tax-loss harvesting alerts']
  },
  {
    title: 'AI Signal Analysis',
    description: 'Leverage our neural networks to identify patterns and risks that are invisible to the human eye. We process millions of data points to give you a clear "Risk DNA".',
    icon: Zap,
    details: ['Sentiment-adjusted technicals', 'Institutional risk modeling', 'Alternative data signals']
  },
  {
    title: 'Financial Peace of Mind',
    description: 'Invest with confidence knowing our News Intelligence agent is filtering out the noise. We tell you what matters to your portfolio, so you never panic sell again.',
    icon: ShieldCheck,
    details: ['Noise-free market pulse', 'Impact prediction engine', 'Emotional bias detection']
  },
  {
    title: 'Global Market Intelligence',
    description: 'Access institutional-grade market data and decoded financial jargon. We bridge the gap between complex Wall Street terminology and retail investor simplicity.',
    icon: Globe,
    details: ['Decoded jargon terminal', 'Global macro indicators', 'Cross-asset correlation analysis']
  }
];

const Benefits = () => {
  const navigate = useNavigate();

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto space-y-20">
      <div className="space-y-6 max-w-3xl">
        <button 
           onClick={() => navigate(-1)}
           className="text-stripe-slate hover:text-stripe-blue transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-6xl font-extrabold text-stripe-dark tracking-tight">
          Everything <span className="stripe-gradient-text text-6xl">A&R</span> does for you.
        </h1>
        <p className="text-xl text-stripe-slate max-w-2xl leading-relaxed">
          The most advanced financial intelligence platform built for the modern Indian investor. Professional tools, personal touch.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {benefits.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="stripe-card space-y-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-stripe-blue/10 text-stripe-blue flex items-center justify-center">
              <item.icon size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-stripe-slate leading-relaxed mb-8">
                {item.description}
              </p>
              <ul className="space-y-4">
                {item.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-bold text-stripe-dark">
                    <div className="w-1.5 h-1.5 rounded-full bg-stripe-blue" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-stripe-light rounded-[3rem] p-16 text-center space-y-10">
        <h2 className="text-4xl font-extrabold text-stripe-dark">Ready to transform your wealth?</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="stripe-button-primary px-10 py-4 text-lg">Create Free Account</button>
          <button className="stripe-button-secondary px-10 py-4 text-lg">Contact Advisor</button>
        </div>
      </div>
    </div>
  );
};

export default Benefits;
