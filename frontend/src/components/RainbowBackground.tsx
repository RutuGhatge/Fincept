import React from 'react';
import { motion } from 'framer-motion';

const RainbowBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
      {/* The "Stripe" Rainbow Wave */}
      <div className="absolute top-0 right-0 w-[60%] h-full">
        <motion.div
          animate={{
            rotate: [-15, -12, -15],
            scale: [1, 1.05, 1],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-20%] right-[-10%] w-[120%] h-[140%] transform-gpu"
          style={{
            background: `
              linear-gradient(
                225deg, 
                #ffad33 0%, 
                #ff6ec7 25%, 
                #9d33d6 50%, 
                #635bff 75%, 
                #3291ff 100%
              )
            `,
            backgroundSize: '200% 200%',
            filter: 'blur(80px)',
            opacity: 0.25,
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          }}
        />
        
        {/* Additional accent layer for depth */}
        <motion.div
          animate={{
            rotate: [-10, -5, -10],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-0 right-[-20%] w-[100%] h-full opacity-15 mix-blend-color-dodge"
          style={{
            background: 'radial-gradient(circle at 70% 30%, #ffd000 0%, transparent 60%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Hero-specific cleanup gradient to ensure text readability on the left */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-0" />
    </div>
  );
};

export default RainbowBackground;
