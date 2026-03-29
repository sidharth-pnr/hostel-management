import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import * as Icons from '../../components/Icons';
import { AdminSidebar } from '../../components/admin/AdminSidebar.jsx';
import BackgroundEffect from '../../components/BackgroundEffect';

const AdminLayout = ({ user, setUser }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'Overview';
    if (path.includes('approvals')) return 'Approvals';
    if (path.includes('students')) return 'Student Directory';
    if (path.includes('complaints')) return 'Grievance Management';
    if (path.includes('rooms')) return 'Room Inventory';
    if (path.includes('admins')) return 'System Access';
    return 'Console';
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 relative overflow-hidden flex">
      <BackgroundEffect />
      
      <AdminSidebar 
        user={user} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10 p-4 lg:p-6 lg:pl-2">
        
        {/* Glass Header */}
        <header className="flex justify-between items-center mb-6 glass-header sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              className="lg:hidden mr-4 text-slate-600 p-2 bg-white/50 rounded-xl" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Icons.Menu size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right mr-2 bg-white/50 px-4 py-1.5 rounded-full border border-white">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                {user?.role === 'SUPER' ? 'System Administrator' : 'Staff Warden'}
              </span>
            </div>
            <button className="relative p-2.5 bg-white/80 rounded-full text-slate-600 hover:text-blue-600 shadow-sm border border-white transition-all">
              <Icons.Shield size={18} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 w-full max-w-7xl mx-auto pb-10">
          <Outlet context={{ user, setUser }} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
