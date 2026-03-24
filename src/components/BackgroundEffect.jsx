import React from 'react';

const BackgroundEffect = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-slate-50 transition-colors duration-1000">
      
      {/* 1. STATIC DEPTH GRID */}
      <div 
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      {/* 2. VIGNETTE OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-200/30"/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.05)_100%)]"/>
    </div>
  );
};

export default BackgroundEffect;
