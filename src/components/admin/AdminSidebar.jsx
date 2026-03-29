import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from '../Icons';

const SidebarItem = ({ to, icon: Icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all font-medium ${
        isActive
          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
          : 'text-slate-600 hover:bg-white/50 hover:text-blue-700'
      }`
    }
  >
    <Icon size={20} />
    <span>{label}</span>
  </NavLink>
);

export const AdminSidebar = ({ user, isSidebarOpen, setIsSidebarOpen }) => {
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Glass Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 p-4 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full glass-sidebar flex flex-col p-4 relative z-10">
          
          <div className="flex items-center space-x-3 px-4 py-4 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Icons.Shield size={24} />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 tracking-wide text-sm">ADMIN CONSOLE</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Campus Housing</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem to="/admin" icon={Icons.LayoutDashboard} label="Overview" end={true} />
            <SidebarItem to="/admin/approvals" icon={Icons.UserPlus} label="New Students" />
            <SidebarItem to="/admin/students" icon={Icons.Users} label="Students" />
            <SidebarItem to="/admin/complaints" icon={Icons.ClipboardList} label="Complaints" />
            <SidebarItem to="/admin/rooms" icon={Icons.LayoutGrid} label="Rooms" />
            {user?.role === 'SUPER' && (
              <SidebarItem to="/admin/admins" icon={Icons.ShieldCheck} label="Admin Access" />
            )}
          </nav>

          <div className="mt-auto bg-white/50 border border-white/60 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 flex-shrink-0 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm border border-slate-700">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
            >
              <Icons.LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
