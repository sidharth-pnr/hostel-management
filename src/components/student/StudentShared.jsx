import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from '../Icons';

/**
 * Main Glass Container for student sections
 */
export const GlassCard = ({ children, className = "", p = "p-8 sm:p-10" }) => (
  <div className={`bg-white/40 dark:bg-slate-900/40 backdrop-blur-[40px] rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden ${className}`}>
    <div className={p}>
      {children}
    </div>
  </div>
);

/**
 * Shared Page Header with status badges
 */
export const PageHeader = ({ title, subtitle, badge, badgeIcon: BadgeIcon, badgeColor = "blue" }) => (
  <section className="relative py-8 border-b border-slate-100 dark:border-white/5">
    <div className="space-y-6">
      {badge && (
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 bg-${badgeColor}-500/10 text-${badgeColor}-600 dark:text-${badgeColor}-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-${badgeColor}-500/20 flex items-center gap-2`}>
            {BadgeIcon && <BadgeIcon size={12} />} {badge}
          </span>
        </div>
      )}
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-wider">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  </section>
);

/**
 * Large Metric Node for status hubs
 */
export const StatNode = ({ label, value, icon: Icon, color = "blue" }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-500/10',
    teal: 'text-teal-600 bg-teal-500/10',
    orange: 'text-orange-600 bg-orange-500/10',
    red: 'text-red-600 bg-red-500/10',
    emerald: 'text-emerald-600 bg-emerald-500/10',
    amber: 'text-amber-600 bg-amber-500/10',
    slate: 'text-slate-600 bg-slate-500/10'
  };

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-lg relative group">
      <div className="relative z-10 space-y-4">
        {Icon && (
          <div className={`w-12 h-12 rounded-2xl ${colorMap[color] || colorMap.blue} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
            <Icon size={24} />
          </div>
        )}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{label}</p>
          <h4 className={`text-4xl font-black ${color.startsWith('text-') ? color : `text-${color}-500`} tracking-tighter`}>{value}</h4>
        </div>
      </div>
    </div>
  );
};

/**
 * Compact icon + text pair
 */
export const InfoNode = ({ icon: Icon, label, value, color = "blue", className = "" }) => (
  <div className={`flex items-center gap-5 group ${className}`}>
    <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-${color}-500 transition-colors shadow-inner`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">{value}</p>
    </div>
  </div>
);

/**
 * Standard Reusable Filter Tab
 */
export const FilterTab = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
      active 
      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md scale-105' 
      : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    {label}
  </button>
);

/**
 * Standard "No Data" Box
 */
export const EmptyState = ({ icon: Icon = Icons.Box, title = "No Records Found.", message = "Everything is clear for now." }) => (
  <div className="col-span-full py-32 text-center bg-white/20 dark:bg-white/5 rounded-[4rem] border border-dashed border-slate-300 dark:border-white/10 shadow-inner">
    <Icon size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-8 animate-pulse" />
    <div className="space-y-2">
      <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{title}</h3>
      <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">{message}</p>
    </div>
  </div>
);
