import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar.jsx';

const AdminLayout = ({ user, isDark, setIsDark }) => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    const segment = path.split('/').pop();
    // Special cases for better naming
    if (segment === 'approvals') return 'New Student Approvals';
    if (segment === 'students') return 'Student Management';
    if (segment === 'complaints') return 'Complaints Management';
    if (segment === 'rooms') return 'Room Infrastructure';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* 1. Fixed Top Navigation */}
      <AdminSidebar user={user} isDark={isDark} setIsDark={setIsDark} />

      {/* 2. Main content with stable padding */}
      <main className="pt-32 px-6 pb-12">
        <div className="max-w-7xl mx-auto min-h-[80vh]">
          {/* Section Header */}
          <div className="mb-10">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-2 ml-1">Management Suite</p>
            <h1 className="text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {getPageTitle()}
            </h1>
          </div>

          {/* Page Content with permission context */}
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
