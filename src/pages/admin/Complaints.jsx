import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trash2, AlertCircle, Clock, CheckCircle2, ClipboardList, 
  Timer, MessageSquare, ArrowRight, ShieldAlert, Zap,
  Filter, SortAsc, Activity, MoreVertical, Search,
  History, Settings2, CheckCircle, Info
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE, COLORS } from '../../config';

const Complaints = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, IN_PROGRESS, RESOLVED, CLOSED
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/complaints.php`);
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id, action, note = null) => {
    const actionLabel = action === 'in_progress' ? 'Starting fix' : (action === 'delete' ? 'Deleting' : 'Updating');
    const loadingToast = toast.loading(`${actionLabel}...`);
    
    try {
      let res;
      if (action === 'delete') {
        res = await axios.delete(`${API_BASE}/complaints.php?id=${id}`);
      } else {
        // Map frontend actions to backend statuses
        let status = action;
        if (action === 'in_progress') status = 'IN_PROGRESS';
        if (action === 'resolve') status = 'RESOLVED';
        
        const payload = { 
          complaint_id: id,
          status: status,
          admin_name: user?.name,
          note: note
        };
        res = await axios.put(`${API_BASE}/complaints.php`, payload);
      }

      toast.dismiss(loadingToast);
      
      if (res.data.status === 'success') {
        toast.success(`Action completed!`);
        fetchData();
      } else {
        toast.error(res.data.error || "Operation failed");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Operation failed");
    }
  };

  const handleAdminComplaintAction = async (e, action, id) => {
    e.preventDefault();
    const note = e.target.note.value;
    handleAction(id, action, note);
  };

  // --- ANALYTICS ---
  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'PENDING').length;
    const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
    const resolved = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
    const high = complaints.filter(c => (c.priority === 'High' || c.priority === 'Urgent') && c.status !== 'CLOSED').length;
    return { total, pending, inProgress, resolved, high };
  }, [complaints]);

  // --- FILTERED DATA ---
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const query = search.toLowerCase();
      const matchesSearch = (c.title || "").toLowerCase().includes(query) || 
                            (c.student_name || "").toLowerCase().includes(query) || 
                            c.complaint_id?.toString().includes(query);
      
      const matchesTab = activeTab === 'ALL' || 
                         (activeTab === 'PENDING' && c.status === 'PENDING') ||
                         (activeTab === 'IN_PROGRESS' && c.status === 'IN_PROGRESS') ||
                         (activeTab === 'RESOLVED' && c.status === 'RESOLVED') ||
                         (activeTab === 'CLOSED' && c.status === 'CLOSED');
      
      return matchesSearch && matchesTab;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [complaints, search, activeTab]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* 1. COMPLAINTS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={ClipboardList} label="Total Complaints" value={stats.total} subValue="All Time" color="blue" />
        <StatCard icon={ShieldAlert} label="Urgent Problems" value={stats.high} subValue="High Priority" color="red" pulse={stats.high > 0} />
        <StatCard icon={Activity} label="In Progress" value={stats.inProgress} subValue="Being Fixed" color="teal" />
        <StatCard icon={CheckCircle} label="Solved Rate" value={`${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%`} subValue="Resolved Issues" color="teal" />
      </div>

      {/* 2. SEARCH & FILTER */}
      <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={20}/>
          <input 
            placeholder="Search by ID, title, or student name..." 
            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all text-slate-900 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-full xl:w-auto overflow-x-auto no-scrollbar">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab === 'RESOLVED' ? 'FIXED' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 3. COMPLAINT LIST */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredComplaints.length > 0 ? filteredComplaints.map(c => (
          <ComplaintTicket 
            key={c.complaint_id} 
            complaint={c} 
            handleAction={handleAction} 
            handleAdminComplaintAction={handleAdminComplaintAction}
            userRole={user?.role}
          />
        )) : (
          <div className="col-span-full py-32 bg-white dark:bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <CheckCircle2 size={64} strokeWidth={1} className="mx-auto mb-6 text-teal-500/20" />
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">All Clear</h3>
            <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-xs mt-2">No complaints in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ComplaintTicket = ({ complaint: c, handleAction, handleAdminComplaintAction, userRole }) => {
  const getPriorityColor = () => {
    switch(c.priority) {
      case 'Urgent': return 'border-red-500';
      case 'High': return 'border-slate-900 dark:border-white';
      case 'Medium': return 'border-orange-400';
      default: return 'border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] border-l-8 transition-all duration-300 group overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:scale-[1.01] ${getPriorityColor()} border-t border-r border-b border-slate-200/60 dark:border-slate-800`}>
      
      <div className="p-8 pb-4">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[9px] font-black tracking-widest uppercase">
                ID: #TK-{c.complaint_id}
              </span>
              <StatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2 truncate">
              {c.title || 'No Title'}
            </h4>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px]">{c.student_name?.[0]}</div>
                {c.student_name}
              </span>
              <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                {c.category}
              </span>
            </div>
          </div>
          
          {userRole === 'SUPER' && (
            <button 
              onClick={() => { if(window.confirm("Delete this complaint?")) handleAction(c.complaint_id, 'delete') }}
              className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 rounded-2xl transition-all"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>

        <div className="bg-slate-50/50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5 relative group/msg">
          <MessageSquare className="absolute -top-3 -right-3 text-slate-200 dark:text-slate-800 transition-transform group-hover/msg:scale-110" size={32} />
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
            "{c.description}"
          </p>
        </div>
      </div>

      <div className="p-8 pt-6 mt-auto">
        <div className="relative pl-6 space-y-4 mb-8 before:absolute before:left-[5px] before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
           <TimelineItem icon={Timer} label="Reported" time={c.created_at} active />
           {c.in_progress_at && <TimelineItem icon={Clock} label="Started" time={c.in_progress_at} highlight />}
           {c.resolved_at && <TimelineItem icon={CheckCircle2} label="Fixed" time={c.resolved_at} success />}
        </div>

        <div className="space-y-4">
          {c.status === 'PENDING' && (
            <button 
              onClick={() => handleAction(c.complaint_id, 'in_progress')} 
              className="w-full bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-teal-500/20 group"
            >
              Start Fixing <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          
          {(c.status === 'PENDING' || c.status === 'IN_PROGRESS') && (
            <form onSubmit={(e) => handleAdminComplaintAction(e, 'resolve', c.complaint_id)} className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
              <div className="relative group/input">
                <textarea 
                  name="note" 
                  required 
                  placeholder="What was done to fix this?..." 
                  className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none h-24 shadow-sm"
                />
                <div className="absolute top-4 right-4 text-slate-200 dark:text-slate-800"><Settings2 size={16} /></div>
              </div>
              <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 shadow-xl">
                Mark as Fixed
              </button>
            </form>
          )}

          {(c.status === 'RESOLVED' || c.status === 'CLOSED') && (
            <div className="p-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl flex items-start gap-4 shadow-lg animate-in fade-in zoom-in-95">
              <History className="flex-shrink-0 mt-1 opacity-40" size={20} />
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">Resolution Note</p>
                <p className="text-sm font-bold leading-relaxed">{c.resolution_note || 'Issue resolved.'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- UTILITIES ---

const StatusBadge = ({ status }) => {
  const config = {
    PENDING: { label: 'Pending', color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' },
    RESOLVED: { label: 'Fixed', color: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' },
    CLOSED: { label: 'Closed', color: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' }
  };
  const { label, color } = config[status] || config.PENDING;
  return <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${color}`}>{label}</span>;
};

const PriorityBadge = ({ priority }) => {
  if (priority === 'Urgent' || priority === 'High') return (
    <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg ${
      priority === 'Urgent' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
    }`}>
      {priority}
    </span>
  );
  return (
    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[9px] font-black rounded-full uppercase tracking-widest">
      {priority}
    </span>
  );
};

const TimelineItem = ({ icon: Icon, label, time, active, highlight, success }) => (
  <div className={`relative flex items-center gap-3 ${
    highlight ? 'text-teal-600 dark:text-teal-400' : 
    success ? 'text-slate-900 dark:text-white' : 
    active ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'
  }`}>
    <div className={`absolute -left-[23px] w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 z-10 ${
      success ? 'bg-slate-900 dark:bg-white' : 
      highlight ? 'bg-teal-500' : 
      'bg-slate-200 dark:bg-slate-800'
    }`} />
    <Icon size={14} className="flex-shrink-0" />
    <div className="flex flex-wrap items-baseline gap-2 min-w-0">
      <span className="text-[10px] font-black uppercase tracking-widest truncate">{label}</span>
      <span className="text-[10px] font-bold opacity-60">
        {new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, subValue, color, pulse }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600'
  };
  return (
    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:scale-[1.02] transition-all">
      <div className="relative z-10 flex items-center gap-5">
        <div className={`p-4 rounded-2xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h4>
            {pulse && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-1">{subValue}</p>
        </div>
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-slate-700">
    <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-white rounded-full animate-spin mb-4" />
    <p className="font-bold text-[10px] tracking-[0.3em] uppercase animate-pulse">Checking records...</p>
  </div>
);

export default Complaints;
