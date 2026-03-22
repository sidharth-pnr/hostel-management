import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar.jsx';

const AdminLayout = ({ user, isDark, setIsDark }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* 1. Fixed Top Navigation */}
      <AdminSidebar user={user} isDark={isDark} setIsDark={setIsDark} />

      {/* 2. Main content with stable padding */}
      <main className="pt-32 px-6 pb-12">
        <div className="max-w-7xl mx-auto min-h-[80vh]">
          {/* Page Content with permission context */}
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
