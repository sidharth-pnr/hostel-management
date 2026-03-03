import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, ClipboardList, LayoutGrid, LogOut, Building2, Shield } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

export const AdminSidebar = ({ user, isDark, setIsDark }) => {
  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      end={to === "/admin"}
      className={({ isActive }) => 
        `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
          isActive 
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
        }`
      }
      title={label}
    >
      <Icon size={18} strokeWidth={2} />
      <span className="text-sm font-medium hidden lg:block">{label}</span>
    </NavLink>
  );

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-full flex items-center justify-between px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 shadow-lg flex-shrink-0">
          <Building2 size={20} />
        </div>
        <div className="hidden sm:block">
          <h2 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-tighter leading-none">Campus</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] uppercase tracking-wider">Housing</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-1">
        <NavItem to="/admin" icon={LayoutDashboard} label="Overview" />
        <NavItem to="/admin/approvals" icon={UserPlus} label="New Students" />
        <NavItem to="/admin/students" icon={Users} label="Residents" />
        <NavItem to="/admin/complaints" icon={ClipboardList} label="Complaints" />
        <NavItem to="/admin/rooms" icon={LayoutGrid} label="Map" />
        {user?.role === 'SUPER' && (
          <NavItem to="/admin/admins" icon={Shield} label="Admin Access" />
        )}
      </nav>

      {/* Profile & Controls */}
      <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4 ml-1">
        <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
        <div className="hidden md:block text-right">
          <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user?.name}</p>
          <div className="flex justify-end mt-1">
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
              user?.role === 'SUPER' 
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {user?.role || 'Authorized'}
            </span>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-all"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};
