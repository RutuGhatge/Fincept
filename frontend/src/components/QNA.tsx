import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "How does Fincept connect to my brokers?",
    answer: "We use secure, read-only API access via regulated aggregators. Fincept never has access to your funds or the ability to execute trades without your direct confirmation."
  },
  {
    question: "Is my portfolio data secure?",
    answer: "Absolutely. We employ bank-grade AES-256 encryption. Your financial information is strictly private and is only used to generate the insights you see on your dashboard."
  },
  {
    question: "Can I use Fincept for global stocks?",
    answer: "Currently, we focus on Indian Equities, Mutual Funds, and F&O. Global market tracking is in our immediate roadmap for the Enterprise and Family plans."
  },
  {
    question: "What is 'Less hype, more insight'?",
    answer: "It's our design philosophy. We avoid flashy, useless charts in favor of actionable intelligence that actually helps you build wealth based on data, not noise."
  }
];

const QNA: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* Left Side: Branding & Tagline */}
          <div className="lg:w-1/3">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-6xl font-black text-stripe-blue mb-6 tracking-tighter"
            >
              Fincept.
            </motion.h2>
            <p className="text-2xl text-stripe-dark font-black leading-tight mb-8">
              One platform to connect all brokers and explain every move.
            </p>
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-stripe-slate font-medium italic">
                "Fincept is the backbone of my investment strategy. No more jumping between 5 different broker apps."
              </p>
              <p className="mt-4 font-bold text-stripe-dark">— HNI Client, Mumbai</p>
            </div>
          </div>

          {/* Right Side: Dynamic FAQ - Hover Based */}
          <div className="lg:w-2/3 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Frequently Asked Questions</h3>
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="px-8 py-6 flex items-center justify-between text-left group cursor-pointer">
                  <span className={`text-lg font-black transition-colors ${hoveredIndex === index ? 'text-stripe-blue' : 'text-stripe-dark'}`}>
                    {faq.question}
                  </span>
                  <div className={`p-2 rounded-full transition-colors ${hoveredIndex === index ? 'bg-stripe-blue/10 text-stripe-blue' : 'bg-slate-50 text-slate-400'}`}>
                    {hoveredIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </div>
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 text-stripe-slate font-medium leading-relaxed max-w-2xl">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QNA;
