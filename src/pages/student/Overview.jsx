import React, { useState, useEffect } from 'react';
import { 
  UserCircle, 
  Home, 
  Users, 
  Clock, 
  ArrowUpRight,
  Calendar,
  Building2,
  Phone,
  GraduationCap,
  MessageSquare,
  BedDouble,
  Activity,
  User,
  Hash,
  Pencil,
  History,
  ArrowRightLeft
} from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { API_BASE } from '../../config';
import BackgroundEffect from '../../components/BackgroundEffect';

const StudentOverview = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sid = user.student_id || user.id;
        const [roomRes, roommatesRes, activitiesRes] = await Promise.all([
          axios.get(`${API_BASE}/student_room.php?id=${sid}`),
          axios.get(`${API_BASE}/get_roommates.php?student_id=${sid}`),
          axios.get(`${API_BASE}/get_student_logs.php?id=${sid}`)
        ]);
        setRoom(roomRes.data);
        setRoommates(Array.isArray(roommatesRes.data) ? roommatesRes.data : []);
        setActivities(Array.isArray(activitiesRes.data) ? activitiesRes.data : []);
      } catch (err) {
        console.error("Dashboard sync failure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id, user.student_id]);

  const slideUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.6 } } };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <BackgroundEffect />

      {/* 1. HERO IDENTITY SECTION */}
      <section className="relative min-h-[40vh] flex flex-col items-center justify-center text-center pt-10">
        <motion.div variants={slideUp} initial="hidden" animate="show" className="space-y-8 w-full max-w-6xl px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Student Dashboard</span>
          </div>
          
          <div className="space-y-4">
             <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
              Welcome Back,<br />
              <span className="text-slate-400 dark:text-slate-500 italic lowercase opacity-80">{(user?.name || "Student").split(' ')[0]}.</span>
             </h1>
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 opacity-60">Session 2024-25 • Official Portal</p>
          </div>

          <div className="flex flex-wrap justify-center gap-10 pt-4">
             <HeroStat label="My Status" value={user?.account_status === 'ACTIVE' ? 'Active' : 'Pending'} color="text-emerald-500" />
             <HeroStat label="Room Status" value={room && room.room_number ? 'Occupied' : 'No Room'} color="text-blue-500" />
             <HeroStat label="System" value="Stable" color="text-teal-500" />
          </div>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 2. IDENTITY CARD (Left - 5 Cols) */}
          <motion.div variants={slideUp} initial="hidden" animate="show" className="lg:col-span-5">
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden h-full">
              <div className="p-8 sm:p-10 space-y-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">Resident Info</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">My Profile.</h3>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                    <UserCircle size={32} className="text-slate-400" />
                  </div>
                </div>

                <div className="grid gap-6">
                  <InfoItem icon={User} label="Full Name" value={user?.name || "N/A"} />
                  <InfoItem icon={Hash} label="Student ID" value={user?.reg_no || "N/A"} />
                  <InfoItem icon={GraduationCap} label="Department" value={user?.department || "N/A"} />
                  <InfoItem icon={Calendar} label="Year of Study" value={user?.year ? `Year ${user.year}` : "N/A"} />
                  <InfoItem icon={Phone} label="Contact" value={user?.phone || 'N/A'} />
                </div>

                <button 
                  onClick={() => navigate('/student/profile')}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <Pencil size={14} className="text-blue-500" />
                  Update My Profile
                </button>
              </div>
            </div>
          </motion.div>

          {/* 3. RESIDENCE STATUS (Right - 7 Cols) */}
          <motion.div variants={slideUp} initial="hidden" animate="show" className="lg:col-span-7 space-y-8">
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden group">
              <div className="p-8 sm:p-10 relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Building2 size={150} className="text-blue-500" />
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">Accommodation</p>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Room Status.</h3>
                    </div>
                    {room && room.room_number ? (
                      <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                        Room Allocated
                      </div>
                    ) : (
                      <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                        No Room Set
                      </div>
                    )}
                  </div>

                  {room && room.room_number ? (
                    <div className="flex flex-col md:flex-row items-center gap-8">
                       <div className="w-full md:w-48 aspect-square bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center text-blue-600 border border-blue-600/20 shadow-inner group-hover:scale-105 transition-transform duration-700">
                          <div className="text-center">
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Room</p>
                             <p className="text-6xl font-black tracking-tighter">{room.room_number}</p>
                          </div>
                       </div>
                       <div className="flex-1 space-y-4 text-center md:text-left">
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Location</p>
                             <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Block {room.block} • Standard Wing</p>
                          </div>
                          <div className="flex items-center justify-center md:justify-start gap-6 pt-4 flex-wrap">
                             <StatPill label="Beds" val={room.capacity} />
                             <StatPill label="Stayers" val={room.current_occupancy} />
                             
                             <button 
                                onClick={() => navigate('/student/book')}
                                className="ml-auto md:ml-4 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                              >
                                <ArrowRightLeft size={12} className="text-blue-500" />
                                Change My Room
                              </button>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-6">
                       <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
                          <BedDouble size={32} className="text-slate-300" />
                       </div>
                       <div className="space-y-2">
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">You haven't booked a room yet.</p>
                          <button 
                            onClick={() => navigate('/student/book')}
                            className="text-blue-500 font-black text-xs uppercase tracking-[0.3em] hover:tracking-[0.4em] transition-all flex items-center justify-center gap-2 mx-auto pt-2"
                          >
                            Find a Room Now <ArrowUpRight size={16} />
                          </button>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Roommates Section */}
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-2xl p-8 sm:p-10">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">My Roommates.</h4>
                <Users size={20} className="text-slate-400" />
              </div>
              
              {roommates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {roommates.map((mate, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 group hover:border-blue-500/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                        {mate.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{mate.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{mate.department}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-slate-200 dark:border-white/5 rounded-3xl">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                      {!room || !room.room_number 
                        ? "Assign a room to see roommates" 
                        : parseInt(room.capacity) === 1 
                          ? "Single Occupancy Room" 
                          : "No roommates assigned yet"}
                   </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* 4. ACTIVITY LOG */}
        <motion.div variants={slideUp} initial="hidden" animate="show" className="mt-8">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="p-8 sm:p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">History</p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Recent Activity.</h3>
                </div>
                <History size={24} className="text-slate-400" />
              </div>

              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.slice(0, 10).map((log, idx) => (
                    <ActivityItem key={idx} log={log} />
                  ))
                ) : (
                  <div className="py-10 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">
                    No recent activity found
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="pt-10 text-center opacity-30 px-4">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Official Student Portal • Hostel Management • Group 15</p>
      </footer>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ActivityItem = ({ log }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'registration': return UserCircle;
      case 'allocation': return Home;
      case 'complaint': return MessageSquare;
      default: return Activity;
    }
  };

  const Icon = getIcon(log.type);
  
  return (
    <div className="flex items-center gap-6 p-5 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 group hover:border-blue-500/30 transition-all">
      <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate">
          {log.message}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
            {log.performed_by}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Clock size={10} />
            {new Date(log.created_at).toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

const HeroStat = ({ label, value, color }) => (
  <div className="flex flex-col items-center gap-1 group cursor-default">
     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</p>
     <p className={`text-2xl sm:text-3xl font-black ${color} tracking-tighter leading-none uppercase`}>{value}</p>
  </div>
);

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-5 group">
    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors shadow-inner">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">{value}</p>
    </div>
  </div>
);

const StatPill = ({ label, val }) => (
  <div className="flex flex-col items-center md:items-start gap-1">
     <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
     <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter leading-none">{val}</p>
  </div>
);

export default StudentOverview;
