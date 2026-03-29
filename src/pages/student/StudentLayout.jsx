import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import * as Icons from '../../components/Icons';
import { StudentSidebar } from '../../components/student/StudentSidebar.jsx';
import BackgroundEffect from '../../components/BackgroundEffect';

const StudentLayout = ({ user, setUser }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/student' || path === '/student/') return 'Dashboard';
    if (path.includes('book')) return 'Book Room';
    if (path.includes('complaints')) return 'Grievances';
    if (path.includes('profile')) return 'Profile';
    return 'Portal';
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 relative overflow-hidden flex">
      <BackgroundEffect />
      
      <StudentSidebar 
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
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {user?.reg_no || 'Student'}
              </span>
            </div>
            <button className="relative p-2.5 bg-white/80 rounded-full text-slate-600 hover:text-blue-600 shadow-sm border border-white transition-all">
              <Icons.Shield size={18} />
              {user?.account_status === 'PENDING' && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 w-full max-w-7xl mx-auto">
          {user?.account_status === 'PENDING' && (
            <div className="mb-6 p-6 bg-slate-900 text-white rounded-[2rem] flex items-center gap-5 shadow-lg border border-white/5">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Icons.AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Registration Under Review</h3>
                <p className="text-sm text-slate-400 font-medium">The Warden is currently processing your admission. Full access will be available soon.</p>
              </div>
            </div>
          )}

          <div className="relative z-10 w-full pb-10">
            <Outlet context={{ user, setUser }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
