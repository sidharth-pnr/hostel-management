import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Building2, LayoutDashboard, BedDouble, ClipboardList, UserCircle, Info, LogOut } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

export const StudentSidebar = ({ user, isDark, setIsDark }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // Always show if near the top
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink 
      to={to} 
      end={to === "/student"}
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
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-full flex items-center justify-between px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'
    }`}>
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
        <NavItem to="/student" icon={LayoutDashboard} label="Desk" />
        <NavItem to="/student/book" icon={BedDouble} label="Stay" />
        <NavItem to="/student/complaints" icon={ClipboardList} label="Support" />
        <NavItem to="/student/profile" icon={UserCircle} label="Identity" />
        <NavItem to="/student/about" icon={Info} label="Guide" />
      </nav>

      {/* Profile & Controls */}
      <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4 ml-1">
        <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
        <div className="hidden md:block text-right">
          <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user?.name?.split(' ')[0]}</p>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tighter mt-1">{user?.reg_no}</p>
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
