import {Outlet, useLocation} from'react-router-dom';
import * as Icons from'../../components/Icons';
import {StudentSidebar} from'../../components/student/StudentSidebar.jsx';
import BackgroundEffect from'../../components/BackgroundEffect';

const StudentLayout = ({user, setUser}) => {
 const location = useLocation();

 const isOverview = location.pathname ==='/student'|| location.pathname ==='/student/';

 return (
 <div className="min-h-screen bg-white transition-colors duration-500 selection:bg-slate-900 selection:text-white">
 <BackgroundEffect />
 {/* 1. Floating Top Navbar */}
 <StudentSidebar user={user} />

 {/* 2. Main Content Area */}
 <main className={isOverview ?"pt-0":"pt-28 px-6 pb-12"}>
 <div className={isOverview ?"w-full":"max-w-7xl mx-auto"}>

 {user?.account_status ==='PENDING'&& (
 <div className={`p-6 bg-slate-900 text-white rounded-[2rem] flex items-center gap-5 shadow-lg border border-white/5 mb-8 ${isOverview ?"max-w-7xl mx-auto mt-28 px-6":"mx-2"}`}>
 <div className="p-3 bg-white/10 rounded-2xl">
 <Icons.AlertCircle size={24} />
 </div>
 <div>
 <h3 className="font-bold text-lg leading-tight">Registration Under Review</h3>
 <p className="text-sm text-slate-400 font-medium">The Warden is currently processing your admission. Full access will be available soon.</p>
 </div>
 </div>
 )}

 <div className="relative z-10 w-full">
 <Outlet context={{user, setUser}} />
 </div>
 </div>
 </main>
 </div>
 );
};

export default StudentLayout;

