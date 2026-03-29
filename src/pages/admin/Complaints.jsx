import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from '../../components/Icons';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '../../services/api';
import { GlassBox, StatusBadge, Input } from '../../components/SharedUI';
import { motion, AnimatePresence } from 'framer-motion';

const Complaints = () => {
  const { user } = useOutletContext() || {};
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, IN_PROGRESS, RESOLVED, CLOSED
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await adminService.getComplaints(user);
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (_err) {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id, action, note = null) => {
    const statusMap = {
      in_progress: 'IN_PROGRESS',
      resolve: 'RESOLVED',
      delete: 'delete'
    };

    const loadingToast = toast.loading("Updating records...");
    try {
      const payload = {
        complaint_id: id,
        action: action === 'delete' ? 'delete' : 'update_status',
        status: statusMap[action],
        note
      };

      await adminService.updateComplaint(payload, user);
      toast.dismiss(loadingToast);
      toast.success(`Action completed!`);
      fetchData();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Operation failed");
    }
  };

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'PENDING').length;
    const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
    const resolved = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
    const high = complaints.filter(c => (c.priority === 'High' || c.priority === 'Urgent') && c.status !== 'CLOSED').length;
    return { total, pending, inProgress, resolved, high };
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const query = search.toLowerCase();
      const matchesSearch = (c.title || "").toLowerCase().includes(query) || (c.student_name || "").toLowerCase().includes(query) || c.complaint_id?.toString().includes(query);
      const matchesTab = activeTab === 'ALL' || (activeTab === 'PENDING' && c.status === 'PENDING') || (activeTab === 'IN_PROGRESS' && c.status === 'IN_PROGRESS') || (activeTab === 'RESOLVED' && c.status === 'RESOLVED') || (activeTab === 'CLOSED' && c.status === 'CLOSED');
      return matchesSearch && matchesTab;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [complaints, search, activeTab]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 opacity-20">
      <Icons.Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
      <p className="text-xs font-bold uppercase tracking-[0.3em]">Checking Maintenance Records...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard icon={Icons.ClipboardList} label="Total Tickets" value={stats.total} trend="All time logs" color="blue" />
        <MetricCard icon={Icons.ShieldAlert} label="Urgent Problems" value={stats.high} trend="Requires attention" color="red" alert={stats.high > 0} />
        <MetricCard icon={Icons.Activity} label="In Progress" value={stats.inProgress} trend="Fixes underway" color="teal" />
        <MetricCard icon={Icons.CheckCircle} label="Solved Rate" value={`${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%`} trend="Success metrics" color="indigo" />
      </div>

      {/* Filter Bar */}
      <GlassBox className="p-4 flex flex-col xl:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <Input 
            placeholder="Search by ID, title, or student name..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            icon={Icons.Search}
            className="!space-y-0"
          />
        </div>
        <div className="flex p-1 bg-slate-100/50 rounded-2xl w-full xl:w-auto overflow-x-auto no-scrollbar">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`flex-1 xl:flex-none px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-slate-800 shadow-sm border border-white/80' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'IN_PROGRESS' ? 'Active' : tab === 'RESOLVED' ? 'Fixed' : tab}
            </button>
          ))}
        </div>
      </GlassBox>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredComplaints.length > 0 ? filteredComplaints.map(c => (
            <motion.div 
              key={c.complaint_id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ComplaintCard complaint={c} handleAction={handleAction} userRole={user?.role} />
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center opacity-40">
              <Icons.ClipboardList size={48} className="mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">No matching tickets found</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, trend, color, alert }) => (
  <GlassBox className={`p-6 relative overflow-hidden ${alert ? 'border-red-100 bg-red-50/20' : ''}`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        color === 'blue' ? 'bg-blue-50 text-blue-600' :
        color === 'teal' ? 'bg-teal-50 text-teal-600' :
        color === 'red' ? 'bg-red-50 text-red-600' :
        'bg-indigo-50 text-indigo-600'
      }`}>
        <Icon size={20} />
      </div>
      {alert && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h4 className="text-2xl font-black text-slate-800">{value}</h4>
      <p className="text-[10px] font-medium text-slate-500">{trend}</p>
    </div>
  </GlassBox>
);

const ComplaintCard = ({ complaint: c, handleAction, userRole }) => {
  const getPriorityColor = () => {
    switch(c.priority) {
      case 'Urgent': return 'border-red-500';
      case 'High': return 'border-orange-500';
      case 'Medium': return 'border-blue-500';
      default: return 'border-slate-200';
    }
  };

  return (
    <GlassBox className={`flex flex-col h-full border-l-4 ${getPriorityColor()} group`}>
      <div className="p-8 flex-1">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-bold tracking-widest uppercase">#TK-{c.complaint_id}</span>
              <StatusBadge status={c.status} />
              <span className={`px-3 py-1 text-[9px] font-bold rounded-lg uppercase tracking-widest ${
                c.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 
                c.priority === 'High' ? 'bg-orange-100 text-orange-700' : 
                'bg-slate-100 text-slate-600'
              }`}>
                {c.priority} Priority
              </span>
            </div>
            <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-2 truncate">{c.title || 'No Title'}</h4>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-black">{c.student_name?.[0]}</div>
                {c.student_name}
              </span>
              <span className="w-1 h-1 bg-slate-200 rounded-full" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{c.category}</span>
            </div>
          </div>
          {userRole === 'SUPER' && (
            <button onClick={() => { if (window.confirm("Delete this complaint?")) handleAction(c.complaint_id, 'delete') }} className="p-3 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
              <Icons.Trash2 size={20} />
            </button>
          )}
        </div>

        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 mb-8">
          <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{c.description}"</p>
        </div>

        <div className="relative pl-6 space-y-4 mb-8 before:absolute before:left-[5px] before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-slate-100">
          <TimelineNode icon={Icons.Clock} label="Reported" time={c.created_at} active />
          {c.in_progress_at && <TimelineNode icon={Icons.Activity} label="Action Started" time={c.in_progress_at} highlight />}
          {c.resolved_at && <TimelineNode icon={Icons.CheckCircle2} label="Issue Resolved" time={c.resolved_at} success />}
        </div>

        <div className="space-y-4">
          {c.status === 'PENDING' && (
            <button onClick={() => handleAction(c.complaint_id, 'in_progress')} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 group">
              Initiate Repair <Icons.ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          {(c.status === 'PENDING' || c.status === 'IN_PROGRESS') && (
            <form onSubmit={(e) => { e.preventDefault(); handleAction(c.complaint_id, 'resolve', e.target.note.value); }} className="space-y-4">
              <textarea name="note" required placeholder="Resolution log (e.g., Replaced fan capacitor)..." className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all resize-none h-24 shadow-inner" />
              <button className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all active:scale-95 shadow-lg">Finalize Ticket</button>
            </form>
          )}
          {(c.status === 'RESOLVED' || c.status === 'CLOSED') && (
            <div className="p-6 bg-slate-800 text-white rounded-3xl flex flex-col gap-4 shadow-lg">
              <div className="flex items-start gap-4">
                <Icons.History className="flex-shrink-0 mt-1 opacity-40" size={20} />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1 opacity-50">Resolution Note</p>
                  <p className="text-sm font-bold leading-relaxed">{c.resolution_note || 'Issue resolved.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassBox>
  );
};

const TimelineNode = ({ icon: Icon, label, time, active, highlight, success }) => (
  <div className={`relative flex items-center gap-3 ${highlight ? 'text-blue-600' : success ? 'text-slate-800' : active ? 'text-slate-600' : 'text-slate-400'}`}>
    <div className={`absolute -left-[23px] w-3 h-3 rounded-full border-2 border-white z-10 ${success ? 'bg-slate-800' : highlight ? 'bg-blue-600' : 'bg-slate-200'}`} />
    <Icon size={14} className="flex-shrink-0" />
    <div className="flex flex-wrap items-baseline gap-2 min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-widest truncate">{label}</span>
      <span className="text-[10px] font-medium opacity-60">{new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  </div>
);

export default Complaints;
