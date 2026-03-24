import React, {useState, useEffect} from'react';
import {NavLink} from'react-router-dom';
import * as Icons from'../Icons';

const NavItem = ({to, icon: Icon, label}) => (
 <NavLink
 to={to}
 end={to ==="/admin"}
 className={({isActive}) => 
 `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
 isActive 
 ?'bg-slate-900 text-white shadow-lg'
 :'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
}`
}
 title={label}
 >
 <Icon size={18} strokeWidth={2} />
 <span className="text-sm font-medium hidden lg:block">{label}</span>
 </NavLink>
);

export const AdminSidebar = ({user}) => {
 const [isVisible, setIsVisible] = useState(false);

 useEffect(() => {
 const timer = setTimeout(() => setIsVisible(true), 10);
 return () => clearTimeout(timer);
}, []);

 const handleLogout = () => {
 localStorage.removeItem('user');
 window.location.href ='/';
};

 return (
 <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-7xl h-16 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-full flex items-center justify-between px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 ${
 isVisible ?'translate-y-0 opacity-100':'-translate-y-24 opacity-0'
}`}>
 {/* Brand */}
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
 <Icons.Building2 size={20} />
 </div>
 <div className="hidden sm:block">
 <h2 className="font-black text-slate-900 text-[10px] uppercase tracking-tighter leading-none">Campus</h2>
 <p className="text-slate-500 font-medium text-[10px] uppercase tracking-wider">Housing</p>
 </div>
 </div>

 {/* Navigation */}
 <nav className="flex items-center gap-1">
 <NavItem to="/admin"icon={Icons.LayoutDashboard} label="Dashboard"/>
 <NavItem to="/admin/approvals"icon={Icons.UserPlus} label="New Students"/>
 <NavItem to="/admin/students"icon={Icons.Users} label="Students"/>
 <NavItem to="/admin/complaints"icon={Icons.ClipboardList} label="Complaints"/>
 <NavItem to="/admin/rooms"icon={Icons.LayoutGrid} label="Rooms"/>
 {user?.role ==='SUPER'&& (
 <NavItem to="/admin/admins"icon={Icons.Shield} label="Admin Access"/>
 )}
 </nav>

 {/* Profile & Controls */}
 <div className="flex items-center gap-3 border-l border-slate-200 pl-4 ml-1">
 <div className="hidden md:block text-right">
 <p className="text-xs font-bold text-slate-900 leading-none">{user?.name}</p>
 <div className="flex justify-end mt-1">
 <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
 user?.role ==='SUPER'
 ?'bg-amber-100 text-amber-700'
 :'bg-slate-100 text-slate-500'
}`}>
 {user?.role ||'Authorized'}
 </span>
 </div>
 </div>
 <button 
 onClick={handleLogout} 
 className="p-2.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-full transition-all"
 title="Sign Out"
 >
 <Icons.LogOut size={18} />
 </button>
 </div>
 </div>
 );
};

