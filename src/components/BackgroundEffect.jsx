import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const BackgroundEffect = () => {
  // Data for high-speed beams
  const beams = useMemo(() => {
    return [...Array(10)].map((_, i) => ({
      id: i,
      // eslint-disable-next-line react-hooks/purity
      top: Math.random() * 100,
      // eslint-disable-next-line react-hooks/purity
      left: Math.random() * 100,
      // eslint-disable-next-line react-hooks/purity
      duration: Math.random() * 4 + 2,
      // eslint-disable-next-line react-hooks/purity
      delay: Math.random() * 5,
      // eslint-disable-next-line react-hooks/purity
      width: Math.random() * 200 + 100,
      color: i % 2 === 0 ? 'bg-blue-500' : 'bg-teal-400',
    }));
  }, []);

  // Data for floating particles
  const particles = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      // eslint-disable-next-line react-hooks/purity
      x: Math.random() * 100,
      // eslint-disable-next-line react-hooks/purity
      y: Math.random() * 100,
      // eslint-disable-next-line react-hooks/purity
      duration: Math.random() * 2 + 1,
      // eslint-disable-next-line react-hooks/purity
      delay: Math.random() * 3,
    }));
  }, []);


  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-slate-50 dark:bg-slate-950 transition-colors duration-1000">
      
      {/* 1. HIGH-SPEED KINETIC BEAMS */}
      <div className="absolute inset-0 overflow-hidden">
        {beams.map((b) => (
          <motion.div
            key={b.id}
            initial={{ x: '-150%', opacity: 0 }}
            animate={{ 
              x: '250%', 
              opacity: [0, 0.8, 0] 
            }}
            transition={{ 
              duration: b.duration, 
              repeat: Infinity, 
              delay: b.delay,
              ease: "linear"
            }}
            className={`absolute h-[1px] blur-[1px] ${b.color} shadow-[0_0_15px_rgba(59,130,246,0.5)]`}
            style={{ top: `${b.top}%`, width: b.width }}
          />
        ))}
      </div>

      {/* 2. PULSING NODES (Neural Network) */}
      <div className="absolute inset-0">
        {particles.map((n) => (
          <motion.div
            key={n.id}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.5, 0.1],
              boxShadow: [
                '0 0 0px rgba(59,130,246,0)', 
                '0 0 10px rgba(59,130,246,0.4)', 
                '0 0 0px rgba(59,130,246,0)'
              ]
            }}
            transition={{ 
              duration: n.duration, 
              repeat: Infinity, 
              delay: n.delay,
              ease: "easeInOut"
            }}
            className="absolute w-1.5 h-1.5 bg-blue-500/40 dark:bg-blue-400/40 rounded-full"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          />
        ))}
      </div>

      {/* 3. ROTATING WIREFRAMES */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 dark:opacity-10">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative w-[800px] h-[800px] border border-blue-500/20 rounded-[10rem] flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-[500px] h-[500px] border border-teal-500/20 rounded-[5rem]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl" />
        </motion.div>
      </div>

      {/* 4. STATIC DEPTH GRID */}
      <div 
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] mix-blend-overlay"
        style={{ 
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '80px 80px' 
        }}
      />

      {/* 5. VIGNETTE OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-200/30 dark:to-black/40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_100%)]" />
    </div>
  );
};

export default BackgroundEffect;
