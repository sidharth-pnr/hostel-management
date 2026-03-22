import React from 'react';
import * as Icons from './Icons';

const ThemeToggle = ({ isDark, setIsDark }) => (
  <button 
    onClick={() => setIsDark(!isDark)} 
    className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-200/60 flex items-center justify-center"
    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
  >
    {isDark ? <Icons.Sun size={18} strokeWidth={2.5} /> : <Icons.Moon size={18} strokeWidth={2.5} />}
  </button>
);

export default ThemeToggle;
