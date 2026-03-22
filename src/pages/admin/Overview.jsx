import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as Icons from '../../components/Icons';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { NavLink, useOutletContext } from 'react-router-dom';
import { API_BASE, COLORS } from '../../config';
import { StatCard, LoadingScreen, EmptyState } from '../../components/admin/AdminShared';

const Overview = () => {
  const { user } = useOutletContext() || {};
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [mounted, setMounted] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, roomsRes, studentsRes] = await Promise.all([
        axios.get(`${API_BASE}/stats.php`),
        axios.get(`${API_BASE}/manage_rooms.php`),
        axios.get(`${API_BASE}/get_data.php?type=students`)
      ]);
      setStats(statsRes.data);
      setRooms(roomsRes.data);
      setAllStudents(studentsRes.data);
    } catch (err) {
      console.error("Dashboard synchronization failed:", err);
    }
  };

  useEffect(() => {
    fetchData();
    setMounted(true);
    const interval = setInterval(fetchData, 60000);

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const activityStream = useMemo(() => {
    if (!stats || !stats.activity_log) return [];
    return stats.activity_log.map(log => ({
      type: log.type,
      title: log.message,
      user: log.performed_by,
      time: log.created_at,
      priority: 'Normal'
    }));
  }, [stats]);

  const blocks = useMemo(() => {
    const map = {};
    rooms.forEach(r => {
      if (!map[r.block]) map[r.block] = { total: 0, occupied: 0, rooms: [] };
      map[r.block].total += parseInt(r.capacity);
      map[r.block].occupied += parseInt(r.current_occupancy);
      map[r.block].rooms.push(r);
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      ...data,
      percent: Math.round((data.occupied / data.total) * 100) || 0
    }));
  }, [rooms]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { students: [], rooms: [] };
    const query = searchQuery.toLowerCase();
    return {
      students: allStudents.filter(s => (s.name || "").toLowerCase().includes(query) || (s.student_id || "").toString().includes(query)).slice(0, 5),
      rooms: rooms.filter(r => (r.room_number || "").toLowerCase().includes(query) || (r.block || "").toLowerCase().includes(query)).slice(0, 5)
    };
  }, [searchQuery, allStudents, rooms]);

  if (!stats) return <LoadingScreen message="Syncing Command Center..." />;

  const { counts, departments, complaints_dist } = stats;

  return (
    <div className="space-y-8 animate-slide-up relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Icons.Users} label="Total Students" value={counts?.total_students} subValue="Active Residents" color="blue" />
        <StatCard icon={Icons.Home} label="Room Occupancy" value={`${counts?.occupancy_rate}%`} subValue={`${counts?.total_occupied} / ${counts?.total_capacity} beds`} color="teal" progress={counts?.occupancy_rate} />
        <StatCard icon={Icons.UserPlus} label="New Admissions" value={counts?.pending_students} subValue="Pending Review" color="orange" pulse={counts?.pending_students > 0} />
        <StatCard icon={Icons.AlertCircle} label="Urgent Issues" value={counts?.high_priority} subValue="Active Complaints" color="red" pulse={counts?.high_priority > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.Building size={20} className="text-slate-400" /> Infrastructure Heatmap
              </h3>
              <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Visual Block Density</p>
            </div>
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-widest">
              <Icons.Command size={14} /> K Search
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {blocks.map((block, i) => (
              <div key={i} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group/block hover:scale-105 transition-all">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Block {block.name}</p>
                <div className="flex items-end justify-between mb-2">
                   <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{block.percent}%</h4>
                   <p className="text-[8px] font-bold text-slate-400">{block.occupied}/{block.total}</p>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${block.percent > 90 ? 'bg-red-500' : block.percent > 70 ? 'bg-orange-500' : 'bg-teal-500'}`} style={{ width: `${block.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center min-h-[400px]">
          <div className="w-full mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icons.Activity size={20} className="text-slate-400" /> Resolution Map
            </h3>
          </div>
          <div className="relative flex justify-center py-4 w-full h-[200px]">
            {mounted && (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={(complaints_dist || []).map(d => ({ ...d, value: Number(d.value) }))} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                    {(complaints_dist || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{(complaints_dist || []).reduce((acc, curr) => acc + Number(curr.value || 0), 0)}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cases</p>
            </div>
          </div>
          <div className="w-full mt-6 space-y-2">
            {(complaints_dist || []).map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-xs">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5 bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-3">
              <Icons.Clock size={20} className="text-slate-400" /> Integrated Activity
            </h3>
            <span className="px-3 py-1 bg-slate-200/50 dark:bg-slate-800 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">Audit Trail</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px] scrollbar-hide">
            {activityStream.length > 0 ? activityStream.map((act, i) => (
              <div key={i} className="p-6 border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all flex items-start gap-4">
                <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${act.type === 'complaint' ? 'bg-orange-500' : act.type === 'infrastructure' ? 'bg-blue-500' : 'bg-teal-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate mb-1">{act.title}</p>
                  <p className="text-xs text-slate-500 font-medium leading-none">By <span className="text-slate-900 dark:text-slate-400 font-bold uppercase text-[10px] tracking-tight">{act.user}</span></p>
                </div>
                <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase flex-shrink-0">{new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            )) : <EmptyState message="No log entries found" />}
          </div>
        </div>

        <div className="xl:col-span-7 bg-white dark:bg-slate-900/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icons.BarChart3 size={20} className="text-slate-400" /> Academic Composition
            </h3>
            <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Residents by Department</p>
          </div>
          <div className="h-[350px] w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={departments || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: '#f1f5f9', opacity: 0.4 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#fff' }} />
                  <Bar dataKey="value" fill="#0f172a" radius={[12, 12, 4, 4]} className="dark:fill-white" barSize={45}>
                    {(departments || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800">
              <Icons.Search size={24} className="text-slate-400" />
              <input autoFocus placeholder="Find anything... (Esc to close)" className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <button onClick={() => setSearchOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"><Icons.X size={20} className="text-slate-400" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 scrollbar-hide">
              {searchQuery ? (
                <div className="space-y-6">
                  {searchResults.students.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-400 px-2"><Icons.Users size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Residents</span></div>
                      <div className="space-y-1">{searchResults.students.map((s, i) => <NavLink key={i} to="/admin/students" className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"><div><p className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">{s.name}</p><p className="text-xs text-slate-400 font-medium">{s.student_id}</p></div><span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest">{s.department}</span></NavLink>)}</div>
                    </div>
                  )}
                  {searchResults.rooms.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-400 px-2"><Icons.Home size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Rooms & Blocks</span></div>
                      <div className="space-y-1">{searchResults.rooms.map((r, i) => <NavLink key={i} to="/admin/rooms" className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"><div><p className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">Room {r.room_number}</p><p className="text-xs text-slate-400 font-medium">Block {r.block}</p></div><span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest">{r.current_occupancy}/{r.capacity}</span></NavLink>)}</div>
                    </div>
                  )}
                </div>
              ) : <div className="py-12 text-center text-slate-400"><Icons.Command size={40} className="mx-auto mb-4 opacity-10" /><p className="text-sm font-bold uppercase tracking-widest">Type to search for students or rooms</p></div>}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-400">
              <div className="flex gap-4"><span><kbd className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded mr-1">↑↓</kbd> Navigate</span><span><kbd className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded mr-1">Enter</kbd> Select</span></div>
              <span>COMMAND CENTER SEARCH</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
