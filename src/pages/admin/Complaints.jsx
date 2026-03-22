import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from '../../components/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE } from '../../config';
import { StatCard, LoadingScreen, EmptyState } from '../../components/admin/AdminShared';

const Complaints = () => {
  const { user } = useOutletContext() || {};
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, IN_PROGRESS, RESOLVED, CLOSED
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);

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

  const handleAction = async (id, action, note = null, resImage = null) => {
    const actionLabel = action === 'in_progress' ? 'Starting fix' : (action === 'delete' ? 'Deleting' : 'Updating');
    const loadingToast = toast.loading(`${actionLabel}...`);
    try {
      let res;
      if (action === 'delete') res = await axios.delete(`${API_BASE}/complaints.php?id=${id}`);
      else if (action === 'resolve') {
        const data = new FormData();
        data.append('action', 'resolve');
        data.append('complaint_id', id);
        data.append('note', note || '');
        data.append('admin_name', user?.name || 'Warden');
        data.append('role', 'admin');
        if (resImage) data.append('res_image', resImage);
        res = await axios.post(`${API_BASE}/complaints.php`, data);
      } else {
        let status = action === 'in_progress' ? 'IN_PROGRESS' : action;
        res = await axios.put(`${API_BASE}/complaints.php`, { complaint_id: id, status, admin_name: user?.name, note });
      }
      toast.dismiss(loadingToast);
      if (res.data.status === 'success') { toast.success(`Action completed!`); fetchData(); }
      else toast.error(res.data.error || "Operation failed");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Operation failed");
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

  if (loading) return <LoadingScreen message="Checking records..." />;

  return (
    <>
      <div className="space-y-8 animate-slide-up">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Icons.ClipboardList} label="Total Complaints" value={stats.total} subValue="All Time" color="blue" />
          <StatCard icon={Icons.ShieldAlert} label="Urgent Problems" value={stats.high} subValue="High Priority" color="red" pulse={stats.high > 0} />
          <StatCard icon={Icons.Activity} label="In Progress" value={stats.inProgress} subValue="Being Fixed" color="teal" />
          <StatCard icon={Icons.CheckCircle} label="Solved Rate" value={`${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%`} subValue="Resolved Issues" color="teal" />
        </div>

        <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center">
          <div className="relative flex-1 group">
            <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={20}/>
            <input placeholder="Search by ID, title, or student name..." className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all text-slate-900 dark:text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-full xl:w-auto overflow-x-auto no-scrollbar">
            {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredComplaints.length > 0 ? filteredComplaints.map(c => <ComplaintTicket key={c.complaint_id} complaint={c} handleAction={handleAction} userRole={user?.role} setLightboxImage={setLightboxImage} />) : <EmptyState message="No complaints in this category" />}
        </div>
      </div>

      <AnimatePresence>
        {lightboxImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10" onClick={() => setLightboxImage(null)}>
            <button className="absolute top-8 right-8 p-4 text-white hover:bg-white/10 rounded-full transition-all"><Icons.X size={32} /></button>
            <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} src={lightboxImage} alt="Full Evidence" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ComplaintTicket = ({ complaint: c, handleAction, userRole, setLightboxImage }) => {
  const [resFile, setResFile] = useState(null);
  const [resPreview, setResPreview] = useState(null);
  const getPriorityColor = () => {
    switch(c.priority) {
      case 'Urgent': return 'border-red-500';
      case 'High': return 'border-slate-900 dark:border-white';
      case 'Medium': return 'border-orange-400';
      default: return 'border-slate-200 dark:border-slate-700';
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setResPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className={`bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-[3rem] border-l-8 transition-all duration-300 group overflow-hidden flex flex-col shadow-sm hover:shadow-xl ${getPriorityColor()} border-t border-r border-b border-slate-200/60 dark:border-slate-800`}>
      <div className="p-8">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[9px] font-black tracking-widest uppercase">ID: #TK-{c.complaint_id}</span>
              <StatusBadge status={c.status} /><PriorityBadge priority={c.priority} />
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2 truncate">{c.title || 'No Title'}</h4>
            <div className="flex items-center gap-3"><span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px]">{c.student_name?.[0]}</div>{c.student_name}</span><span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" /><span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">{c.category}</span></div>
          </div>
          {userRole === 'SUPER' && <button onClick={() => { if(window.confirm("Delete this complaint?")) handleAction(c.complaint_id, 'delete') }} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 rounded-2xl transition-all"><Icons.Trash2 size={20} /></button>}
        </div>
        <div className="bg-slate-50/50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5 relative group/msg mb-6"><Icons.MessageSquare className="absolute -top-3 -right-3 text-slate-200 dark:text-slate-800 transition-transform group-hover/msg:scale-110" size={32} /><p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">"{c.description}"</p></div>
        <div className="relative pl-6 space-y-4 mb-8 before:absolute before:left-[5px] before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800"><TimelineItem icon={Icons.Timer} label="Reported" time={c.created_at} active />{c.in_progress_at && <TimelineItem icon={Icons.Clock} label="Started" time={c.in_progress_at} highlight />}{c.resolved_at && <TimelineItem icon={Icons.CheckCircle2} label="Resolved" time={c.resolved_at} success />}</div>
        <div className="space-y-4">
          {c.status === 'PENDING' && <button onClick={() => handleAction(c.complaint_id, 'in_progress')} className="w-full bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-teal-500/20 group">Started Fixing <Icons.ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></button>}
          {(c.status === 'PENDING' || c.status === 'IN_PROGRESS') && (
            <form onSubmit={(e) => { e.preventDefault(); handleAction(c.complaint_id, 'resolve', e.target.note.value, resFile); }} className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
              <textarea name="note" required placeholder="What was done to fix this?..." className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none h-24 shadow-sm" />
              <div className="flex items-center gap-4"><label className="cursor-pointer group flex-1"><div className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-white/10 rounded-xl group-hover:border-blue-500/50 transition-all"><Icons.Image size={16} className="text-slate-400 group-hover:text-blue-500" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Add Proof</span></div><input type="file" accept="image/*" onChange={handleFileChange} className="hidden" /></label>{resPreview && <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-blue-500/20 shadow-lg"><img src={resPreview} alt="Resolution" className="w-full h-full object-cover" /><button type="button" onClick={() => { setResFile(null); setResPreview(null); }} className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl-lg"><Icons.X size={10} /></button></div>}</div>
              <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 shadow-xl">Mark as Resolved</button>
            </form>
          )}
          {(c.status === 'RESOLVED' || c.status === 'CLOSED') && <div className="p-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl flex flex-col gap-4 shadow-lg animate-in fade-in zoom-in-95"><div className="flex items-start gap-4"><Icons.History className="flex-shrink-0 mt-1 opacity-40" size={20} /><div><p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">Resolution Note</p><p className="text-sm font-bold leading-relaxed">{c.resolution_note || 'Issue resolved.'}</p></div></div></div>}
        </div>
      </div>
      {(c.issue_image_url || c.resolution_image_url) && (
        <div className="bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 mt-auto">
          {c.issue_image_url ? <div className="relative group/img aspect-video border-r border-slate-100 dark:border-white/5 overflow-hidden"><img src={c.issue_image_url} alt="Issue" className="w-full h-full object-cover transition-all duration-500" /><div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"><button onClick={() => setLightboxImage(c.issue_image_url)} className="p-3 bg-white text-slate-900 rounded-full scale-75 group-hover/img:scale-100 transition-transform"><Icons.Maximize2 size={20} /></button></div><div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-slate-900/90 rounded-md shadow-sm"><p className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">Reported Evidence</p></div></div> : <div className="aspect-video flex items-center justify-center text-[8px] font-black uppercase text-slate-300 border-r border-slate-100 dark:border-white/5">No Image</div>}
          {c.resolution_image_url ? <div className="relative group/img aspect-video overflow-hidden"><img src={c.resolution_image_url} alt="Resolution" className="w-full h-full object-cover transition-all duration-500" /><div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"><button onClick={() => setLightboxImage(c.resolution_image_url)} className="p-3 bg-white text-emerald-600 rounded-full scale-75 group-hover/img:scale-100 transition-transform"><Icons.Maximize2 size={20} /></button></div><div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500/90 text-white rounded-md shadow-sm"><p className="text-[8px] font-black uppercase tracking-tighter">Resolution Proof</p></div></div> : <div className="aspect-video flex flex-col items-center justify-center text-[8px] font-black uppercase text-slate-300">{c.status === 'PENDING' || c.status === 'IN_PROGRESS' ? 'Awaiting Fix' : 'No Proof'}</div>}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    PENDING: { label: 'Pending', color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' },
    RESOLVED: { label: 'Resolved', color: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' },
    CLOSED: { label: 'Closed', color: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' }
  };
  const { label, color } = config[status] || config.PENDING;
  return <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${color}`}>{label}</span>;
};

const PriorityBadge = ({ priority }) => {
  if (priority === 'Urgent' || priority === 'High') return <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg ${priority === 'Urgent' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}>{priority}</span>;
  return <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[9px] font-black rounded-full uppercase tracking-widest">{priority}</span>;
};

const TimelineItem = ({ icon: Icon, label, time, active, highlight, success }) => (
  <div className={`relative flex items-center gap-3 ${highlight ? 'text-teal-600 dark:text-teal-400' : success ? 'text-slate-900 dark:text-white' : active ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'}`}>
    <div className={`absolute -left-[23px] w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 z-10 ${success ? 'bg-slate-900 dark:bg-white' : highlight ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
    <Icon size={14} className="flex-shrink-0" />
    <div className="flex flex-wrap items-baseline gap-2 min-w-0"><span className="text-[10px] font-black uppercase tracking-widest truncate">{label}</span><span className="text-[10px] font-bold opacity-60">{new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
  </div>
);

export default Complaints;
