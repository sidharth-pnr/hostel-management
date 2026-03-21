import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  UserPlus, CheckCircle2, XCircle, GraduationCap, 
  Search, Calendar, Clock, Building2, User,
  CheckCircle, ShieldCheck, Activity, ArrowRight,
  Info, Phone
} from 'lucide-react';
import { API_BASE } from '../../config';

const Approvals = ({ user }) => {
  const [pending, setPending] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/get_data.php?type=pending`);
      setPending(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to sync application queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id, status) => {
    const loadingToast = toast.loading(status === 'ACTIVE' ? "Authorizing scholar..." : "Processing rejection...");
    try {
      const res = await axios.post(`${API_BASE}/admin_action.php`, { 
        action: 'approve', 
        student_id: id, 
        status: status,
        admin_name: user?.name // Pass admin name for logging
      });
      toast.dismiss(loadingToast);
      if (res.data.status === 'Success') {
        toast.success(`Scholar ${status === 'ACTIVE' ? 'Approved' : 'Declined'} Successfully`);
        fetchData();
      } else {
        toast.error(res.data.error || "Operation failed");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Connection failed");
    }
  };

  // --- ANALYTICS ---
  const stats = useMemo(() => {
    const total = pending.length;
    const today = pending.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;
    const topDept = [...new Set(pending.map(s => s.department))].sort((a,b) => 
      pending.filter(s => s.department === b).length - pending.filter(s => s.department === a).length
    )[0] || 'N/A';
    return { total, today, topDept };
  }, [pending]);

  // --- FILTERED DATA ---
  const filteredApplications = useMemo(() => {
    const query = search.toLowerCase();
    return pending.filter(s => 
      (s.name || "").toLowerCase().includes(query) || 
      (s.reg_no || "").toLowerCase().includes(query) ||
      (s.department || "").toLowerCase().includes(query)
    );
  }, [pending, search]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* 1. VERIFICATION ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatTile icon={UserPlus} label="Awaiting Review" value={stats.total} subValue="Total Applications" color="blue" />
        <StatTile icon={Calendar} label="New Today" value={stats.today} subValue="Fresh Inbound" color="teal" pulse={stats.today > 0} />
        <StatTile icon={Building2} label="Lead Faculty" value={stats.topDept} subValue="Highest Volume" color="orange" />
      </div>

      {/* 2. VERIFICATION TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={20}/>
          <input 
            placeholder="Search by name, ID, or department..." 
            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all text-slate-900 dark:text-white font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
          <ShieldCheck size={14} /> Verification Mode Active
        </div>
      </div>

      {/* 3. APPLICATION DOSSIER GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredApplications.length > 0 ? filteredApplications.map(s => (
          <ApplicationDossier 
            key={s.student_id} 
            student={s} 
            onApprove={() => handleApprove(s.student_id, 'ACTIVE')}
            onReject={() => handleApprove(s.student_id, 'REJECTED')}
          />
        )) : (
          <div className="col-span-full py-32 bg-white dark:bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <CheckCircle2 size={64} strokeWidth={1} className="mx-auto mb-6 text-teal-500/20" />
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Queue Cleared</h3>
            <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-xs mt-2">All scholar registrations have been verified</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ApplicationDossier = ({ student: s, onApprove, onReject }) => {
  const timeSince = useMemo(() => {
    const diff = new Date() - new Date(s.created_at);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }, [s.created_at]);

  return (
    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden flex flex-col">
      <div className="p-8">
        {/* Dossier Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-[1.8rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-3xl shadow-xl group-hover:scale-105 transition-transform duration-500">
              {s.name?.[0]}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">{s.name}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md text-[9px] font-black tracking-widest uppercase">
                {s.reg_no}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <Clock size={12} /> Received {timeSince}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <DetailBox icon={Building2} label="Academic Faculty" value={s.department} />
          <DetailBox icon={GraduationCap} label="Course Year" value={`Year ${s.year}`} />
          <DetailBox icon={Phone} label="Contact Number" value={s.phone || 'Not Provided'} />
        </div>

        {/* Action Decision Bar */}
        <div className="flex gap-4">
          <button 
            onClick={onApprove} 
            className="flex-[2] bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10 group"
          >
            <CheckCircle size={18} /> Confirm Admission
          </button>
          <button 
            onClick={() => { if(window.confirm("Decline this application?")) onReject(); }} 
            className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all active:scale-95"
          >
            <XCircle size={18} /> Decline
          </button>
        </div>
      </div>
      
      {/* Verification Footer */}
      <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Identity Verification Pending</span>
        </div>
        <Info size={14} className="text-slate-200 dark:text-slate-700" />
      </div>
    </div>
  );
};

const DetailBox = ({ icon: Icon, label, value }) => (
  <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
    <div className="flex items-center gap-2 mb-1 text-slate-400">
      <Icon size={12} />
      <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
    </div>
    <p className="font-black text-slate-900 dark:text-white text-xs uppercase truncate">{value}</p>
  </div>
);

const StatTile = ({ icon: Icon, label, value, subValue, color, pulse }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
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
            {pulse && <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />}
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
    <p className="font-bold text-[10px] tracking-[0.3em] uppercase animate-pulse">Syncing Application Queue...</p>
  </div>
);

export default Approvals;
