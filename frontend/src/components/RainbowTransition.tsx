import React from 'react';
import { motion } from 'framer-motion';

const RainbowTransition = () => {
  return (
    <div className="relative h-64 overflow-hidden pointer-events-none -mt-32 -mb-32 z-0">
      <motion.div 
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 w-full h-full opacity-30"
        style={{
          background: 'linear-gradient(90deg, #635bff, #3291ff, #00d4ff, #9d33d6, #ff3b3b, #635bff)',
          backgroundSize: '300% 100%',
          filter: 'blur(80px)',
          clipPath: 'polygon(0 40%, 100% 20%, 100% 80%, 0 60%)'
        }}
      />
    </div>
  );
};

export default RainbowTransition;
