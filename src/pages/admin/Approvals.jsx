import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';
import * as Icons from '../../components/Icons';
import { adminService } from '../../services/api';
import { GlassBox, StatusBadge, Input } from '../../components/SharedUI';
import { motion, AnimatePresence } from 'framer-motion';

const Approvals = () => {
  const { user } = useOutletContext() || {};
  const [pending, setPending] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await adminService.getPendingStudents(user);
      setPending(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to sync application queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id, status) => {
    const loadingToast = toast.loading(status === 'ACTIVE' ? "Authorizing scholar..." : "Processing rejection...");
    try {
      await adminService.adminAction({
        action: 'approve',
        student_id: id,
        status: status
      }, user);
      toast.dismiss(loadingToast);
      toast.success(`Scholar ${status === 'ACTIVE' ? 'Approved' : 'Declined'} Successfully`);
      fetchData();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Operation failed");
    }
  };

  const stats = useMemo(() => {
    const total = pending.length;
    const today = pending.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;
    const departments = pending.map(s => s.department);
    const topDept = departments.length > 0 
      ? departments.sort((a, b) => departments.filter(v => v === b).length - departments.filter(v => v === a).length)[0]
      : 'N/A';
    return { total, today, topDept };
  }, [pending]);

  const filteredApplications = useMemo(() => {
    const query = search.toLowerCase();
    return pending.filter(s =>
      (s.name || "").toLowerCase().includes(query) ||
      (s.reg_no || "").toLowerCase().includes(query) ||
      (s.department || "").toLowerCase().includes(query)
    );
  }, [pending, search]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 opacity-20">
      <Icons.Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
      <p className="text-xs font-bold uppercase tracking-[0.3em]">Syncing Application Queue...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatNode icon={Icons.UserPlus} label="Awaiting Review" value={stats.total} color="blue" />
        <StatNode icon={Icons.Calendar} label="New Today" value={stats.today} color="teal" alert={stats.today > 0} />
        <StatNode icon={Icons.Building2} label="Lead Faculty" value={stats.topDept} color="orange" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <Input 
            placeholder="Search by name, ID, or department..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            icon={Icons.Search}
          />
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredApplications.length > 0 ? filteredApplications.map(s => (
            <motion.div 
              key={s.student_id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ApplicationCard 
                student={s} 
                onApprove={() => handleApprove(s.student_id, 'ACTIVE')}
                onReject={() => handleApprove(s.student_id, 'REJECTED')}
              />
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center opacity-40">
              <Icons.CheckCircle2 size={48} className="mb-4 text-green-500" />
              <p className="text-sm font-bold uppercase tracking-widest text-slate-800">Queue Cleared</p>
              <p className="text-xs font-medium text-slate-500 mt-1">All registrations have been verified</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatNode = ({ icon: Icon, label, value, color, alert }) => (
  <GlassBox className="p-6 flex items-center gap-5">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
      color === 'blue' ? 'bg-blue-50 text-blue-600' :
      color === 'teal' ? 'bg-teal-50 text-teal-600' :
      'bg-orange-50 text-orange-600'
    }`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-center gap-2">
        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
        {alert && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />}
      </div>
    </div>
  </GlassBox>
);

const ApplicationCard = ({ student: s, onApprove, onReject }) => {
  const timeSince = useMemo(() => {
    const diff = new Date() - new Date(s.created_at);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }, [s.created_at]);

  return (
    <GlassBox className="p-8 flex flex-col h-full group">
      <div className="flex items-start gap-6 mb-8">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-3xl shadow-inner group-hover:scale-105 transition-transform">
          {s.name?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight truncate mb-1">{s.name}</h3>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{s.reg_no}</span>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Icons.Clock size={12} />
              Received {timeSince}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <MiniInfo label="Faculty" value={s.department} icon={Icons.Building2} />
        <MiniInfo label="Year" value={`Year ${s.year}`} icon={Icons.GraduationCap} />
        <MiniInfo label="Contact" value={s.phone || 'N/A'} icon={Icons.Phone} />
      </div>

      <div className="mt-auto flex gap-4">
        <button 
          onClick={onApprove} 
          className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Icons.CheckCircle size={18} /> Confirm Admission
        </button>
        <button 
          onClick={() => { if (window.confirm("Decline this application?")) onReject(); }} 
          className="flex-1 bg-white/50 border border-white/80 text-slate-400 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
        >
          <Icons.XCircle size={18} /> Decline
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-white/40 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verification Protocol Required</span>
      </div>
    </GlassBox>
  );
};

const MiniInfo = ({ label, value, icon: Icon }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-slate-400">
      <Icon size={12} />
      <span className="text-[8px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-xs font-bold text-slate-700 truncate">{value}</p>
  </div>
);

export default Approvals;
