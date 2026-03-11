import { Outlet, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { StudentSidebar } from '../../components/student/StudentSidebar.jsx';

const StudentLayout = ({ user, setUser, isDark, setIsDark }) => {
  const location = useLocation();

  const isOverview = location.pathname === '/student' || location.pathname === '/student/';
  const getPageName = () => {
    if (isOverview) return 'Scholar Desk';
    const path = location.pathname.toLowerCase();

    if (path.includes('/book')) return 'Room Booking';
    if (path.includes('/complaints')) return 'Complaints';
    if (path.includes('/profile')) return 'Identity Profile';
    if (path.includes('/about')) return 'System Guide';

    return 'Scholar Desk';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500 selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-950">
      {/* 1. Floating Top Navbar */}
      <StudentSidebar user={user} isDark={isDark} setIsDark={setIsDark} />

      {/* 2. Main Content Area */}
      <main className={isOverview ? "pt-0" : "pt-28 px-6 pb-12"}>
        <div className={isOverview ? "w-full" : "max-w-7xl mx-auto"}>

          {user?.account_status === 'PENDING' && (
            <div className={`p-6 bg-slate-900 dark:bg-slate-900 text-white rounded-[2rem] flex items-center gap-5 shadow-lg border border-white/5 mb-8 ${isOverview ? "max-w-7xl mx-auto mt-28 px-6" : "mx-2"}`}>
              <div className="p-3 bg-white/10 rounded-2xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Registration Under Review</h3>
                <p className="text-sm text-slate-400 font-medium">The Warden is currently processing your admission. Full access will be available soon.</p>
              </div>
            </div>
          )}

          <div className="relative z-10 w-full">
            <Outlet context={{ user, setUser }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
