import React from'react';
import {motion} from'framer-motion';
import * as Icons from'./Icons';

/**
 * Shared Animation Variants
 */
export const animations = {
 fadeIn: {
 hidden: {opacity: 0},
 show: {opacity: 1, transition: {duration: 0.8}}
},
 slideUp: {
 hidden: {y: 20, opacity: 0},
 show: {y: 0, opacity: 1, transition: {duration: 0.6, ease:"easeOut"}}
},
 staggerContainer: {
 hidden: {opacity: 0},
 show: {
 opacity: 1,
 transition: {staggerChildren: 0.1}
}
}
};

/**
 * Reusable Glass Bento Box
 */
export const GlassBox = ({ children, className = "", onClick, ...props }) => (
  <div 
    onClick={onClick}
    className={`glass-card ${onClick ? 'glass-card-interactive' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

/**
 * Status Badge Component
 */
export const StatusBadge = ({ status, className = "" }) => {
  const getStatusStyles = (s) => {
    const normalized = s?.toLowerCase();
    if (normalized === 'resolved' || normalized === 'active' || normalized === 'approved') 
      return 'bg-green-100/80 text-green-700 border-green-200';
    if (normalized === 'pending' || normalized === 'review') 
      return 'bg-orange-100/80 text-orange-700 border-orange-200';
    if (normalized === 'rejected' || normalized === 'cancelled') 
      return 'bg-red-100/80 text-red-700 border-red-200';
    return 'bg-slate-100/80 text-slate-700 border-slate-200';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold border ${getStatusStyles(status)} ${className}`}>
      {status}
    </span>
  );
};

/**
 * Standard Form Input (Glass version)
 */
export const Input = ({label, icon: Icon, error, className ="", ...props}) => (
 <div className={`space-y-1.5 ${className}`}>
 {label && (
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
 {label}
 </label>
 )}
 <div className="relative group">
 {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"size={16} />}
 <input 
 className={`w-full p-3.5 bg-white/50 border border-white/80 text-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white/80 transition-all font-bold text-sm ${Icon ?'pl-12':''} ${error ?'border-red-500':''}`}
 {...props}
 />
 </div>
 {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
 </div>
);

/**
 * Standard Form Select (Glass version)
 */
export const Select = ({label, options = [], className ="", ...props}) => (
 <div className={`space-y-1.5 ${className}`}>
 {label && (
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
 {label}
 </label>
 )}
 <div className="relative">
 <select 
 className="w-full p-3.5 bg-white/50 border border-white/80 text-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white/80 transition-all font-bold text-sm appearance-none cursor-pointer"
 {...props}
 >
 {options.map(opt => (
 <option key={opt.value || opt} value={opt.value || opt} className="">
 {opt.label || opt}
 </option>
 ))}
 </select>
 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
  <Icons.ChevronRight size={16} className="rotate-90" />
 </div>
 </div>
 </div>
);

/**
 * Cinematic Auth Layout Sidebar (Left 60%)
 */
export const AuthVisualSide = ({image, quote, author, subtitle}) => (
 <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-slate-900 h-full">
 <img
 src={image}
 alt="Auth Visual"
 className="absolute inset-0 w-full h-full object-cover opacity-60"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"/>

 <div className="absolute bottom-16 left-16 right-16 space-y-4 animate-slide-up">
 <div className="w-10 h-1 bg-white rounded-full opacity-50"/>
 <div className="relative">
 <Icons.Quote className="absolute -top-8 -left-8 w-16 h-16 text-white/5"/>
 <h2 className="text-4xl font-serif font-black text-white leading-tight tracking-tight max-w-xl">
 {quote} <br/>
 <span className="text-slate-400 italic font-medium">{author}</span>
 </h2>
 </div>
 <p className="text-slate-400 font-medium text-base max-w-md">{subtitle}</p>
 </div>

 <div className="absolute bottom-8 left-16 flex items-center gap-2 text-white/20">
 <Icons.Building2 size={14} />
 <span className="text-[9px] font-black uppercase tracking-[0.4em]">Campus Housing Secure Protocol</span>
 </div>
 </div>
);
/**
 * Standard Primary Button (Glass version)
 */
export const PrimaryButton = ({children, isLoading, loadingText, icon: Icon = Icons.ArrowRight, className ="", ...props}) => (
 <button 
 disabled={isLoading}
 className={`w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 ${className}`}
 {...props}
 >
 {isLoading ? (loadingText ||"Processing...") : children}
 {!isLoading && Icon && <Icon size={16} />}
 </button>
);

