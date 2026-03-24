import React from 'react';
import { motion } from 'framer-motion';

const PortfolioPivot: React.FC = () => {
  const text = "Your portfolio deserves better.";
  
  return (
    <section className="py-40 bg-white overflow-hidden border-t border-slate-100">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center">
          {/* Sarcastic Single-Line Header - Resized to fit perfectly */}
          <div className="relative w-full text-center">
            <motion.h2 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight tracking-tighter text-stripe-dark whitespace-nowrap inline-block"
            >
              {text.split("").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateX: 45 }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0, 
                    rotateX: 0,
                    color: ["#0a2540", "#635bff", "#0a2540"]
                  }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.04,
                    ease: "backOut",
                    color: { duration: 3, repeat: Infinity, delay: index * 0.1 }
                  }}
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h2>

            {/* Sarcastic Underline Animation */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 1.2, ease: "circInOut" }}
              className="h-3 bg-gradient-to-r from-stripe-blue via-stripe-purple to-stripe-cyan rounded-full shadow-lg mt-4 max-w-5xl mx-auto origin-center"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 2, duration: 0.5 }}
            className="mt-20 text-center space-y-8"
          >
            <p className="text-xl md:text-3xl text-stripe-slate font-bold max-w-3xl mx-auto leading-relaxed italic">
              "We've seen your Excel sheets. We're not judging, we're helping."
            </p>
            <div className="flex justify-center gap-6 opacity-30">
              <div className="h-[2px] w-16 bg-stripe-blue self-center" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-stripe-dark">Fincept Intelligence</span>
              <div className="h-[2px] w-16 bg-stripe-blue self-center" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioPivot;
