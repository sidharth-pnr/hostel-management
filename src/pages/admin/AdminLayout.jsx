import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from '../../components/Icons';
import { AdminSidebar } from '../../components/admin/AdminSidebar.jsx';
import BackgroundEffect from '../../components/BackgroundEffect';
import NotificationPopover from '../../components/NotificationPopover';

const AdminLayout = ({ user, setUser }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'Overview';
    if (path.includes('approvals')) return 'Approvals';
    if (path.includes('students')) return 'Student Directory';
    if (path.includes('complaints')) return 'Complaints Management';
    if (path.includes('hostel')) return 'Hostel Management';
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
        <AnimatePresence>
          {isHeaderVisible && (
            <motion.header 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex justify-between items-center mb-6 glass-header sticky top-0 z-30"
            >
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
                <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2.5 bg-white/80 rounded-full text-slate-600 hover:text-blue-600 shadow-sm border border-white transition-all active:scale-95"
                  >
                    <Icons.Bell size={18} />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                  </button>
                  
                  {isNotificationsOpen && (
                    <NotificationPopover 
                      user={user} 
                      role="admin" 
                      onClose={() => setIsNotificationsOpen(false)} 
                    />
                  )}
                </div>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* Content Container */}
        <div className="flex-1 w-full max-w-7xl mx-auto pb-10">
          <Outlet context={{ user, setUser, setIsHeaderVisible }} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
