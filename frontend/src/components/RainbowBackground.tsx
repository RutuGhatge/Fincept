import React from 'react';
import { motion } from 'framer-motion';

const RainbowBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#0a2540]">
      {/* Animated Mesh Gradient Layers */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-stripe-blue/30 blur-[120px]"
      />
      
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -120, 0],
          y: [0, 70, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-stripe-purple/30 blur-[120px]"
      />

      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[20%] right-[10%] w-[80%] h-[80%] opacity-20 transform-gpu"
        style={{
          background: `
            conic-gradient(
              from 0deg,
              #ffad33, 
              #ff6ec7, 
              #9d33d6, 
              #635bff, 
              #00d4ff,
              #ffad33
            )
          `,
          filter: 'blur(100px)',
          borderRadius: '50%',
        }}
      />
      
      {/* Overlay to soften and add contrast */}
      <div className="absolute inset-0 bg-stripe-dark/40 backdrop-brightness-75" />
    </div>
  );
};

export default RainbowBackground;
