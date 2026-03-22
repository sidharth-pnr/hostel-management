import React from 'react';
import * as Icons from '../Icons';

/**
 * Shared Metric Card for Admin Dashboards
 */
export const StatCard = ({ icon: Icon, label, value, subValue, color, pulse, progress }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    teal: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20',
    orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    red: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    slate: 'text-slate-600 bg-slate-50 dark:bg-slate-800/50'
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:rotate-6 ${colorMap[color] || colorMap.slate}`}>
          <Icon size={24} />
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h4>
          {pulse && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
        </div>
        {subValue && <p className="text-[10px] font-bold text-slate-400 mt-2">{subValue}</p>}
      </div>
      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
          <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};

/**
 * Standard Admin Loading Spinner
 */
export const LoadingScreen = ({ message = "Syncing Records..." }) => (
  <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-slate-700">
    <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-white rounded-full animate-spin mb-4" />
    <p className="font-bold text-[10px] tracking-[0.3em] uppercase animate-pulse">{message}</p>
  </div>
);

/**
 * Standard "No Data" Placeholder
 */
export const EmptyState = ({ icon: Icon = Icons.Activity, title = "All Clear", message = "No records found matching your criteria" }) => (
  <div className="py-24 bg-white dark:bg-slate-900/30 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-center">
    <Icon size={48} strokeWidth={1} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-1">{title}</h3>
    <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-[10px]">{message}</p>
  </div>
);

/**
 * Reusable Filter/Sort Dropdown
 */
export const FilterMenu = ({ icon: Icon, value, onChange, children }) => (
  <div className="bg-white dark:bg-slate-900/50 px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm hover:border-slate-900 dark:hover:border-white transition-all group">
    <Icon size={18} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
    <select 
      className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none cursor-pointer" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  </div>
);

/**
 * Standard Action Button (Approve, Delete, etc)
 */
export const ActionButton = ({ onClick, icon: Icon, label, primary, danger, disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`flex items-center justify-center gap-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-30 ${label ? 'px-4 py-2.5' : 'p-2.5'} ${
      primary 
        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
        : danger
          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
    }`}
  >
    <Icon size={14} strokeWidth={3} />
    {label && <span className="hidden sm:inline">{label}</span>}
  </button>
);
