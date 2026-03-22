import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from '../../components/Icons';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config';
import BackgroundEffect from '../../components/BackgroundEffect';
import { GlassCard, StatNode, FilterTab, EmptyState } from '../../components/student/StudentShared';

const Complaints = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Other');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, RESOLVED, CLOSED
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const categories = [
    { id: 'Electrical', icon: <Icons.Zap size={20} />, label: 'Electrical', color: 'amber' },
    { id: 'Plumbing', icon: <Icons.Wrench size={20} />, label: 'Plumbing', color: 'blue' },
    { id: 'Internet', icon: <Icons.Wifi size={20} />, label: 'Internet', color: 'indigo' },
    { id: 'Furniture', icon: <Icons.Layers size={20} />, label: 'Furniture', color: 'emerald' },
    { id: 'Cleaning', icon: <Icons.Ghost size={20} />, label: 'Cleaning', color: 'teal' },
    { id: 'Other', icon: <Icons.MoreHorizontal size={20} />, label: 'Other', color: 'slate' },
  ];

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/complaints.php?id=${user.id}`);
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user.id]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const uptime = total === 0 ? 100 : Math.round((resolved / total) * 100);
    return { total, resolved, uptime };
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    if (filter === 'ACTIVE') return complaints.filter(c => ['PENDING', 'IN_PROGRESS'].includes(c.status));
    if (filter === 'RESOLVED') return complaints.filter(c => c.status === 'RESOLVED');
    if (filter === 'CLOSED') return complaints.filter(c => c.status === 'CLOSED');
    return complaints;
  }, [complaints, filter]);

  const handleComplaint = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = new FormData();
    data.append('student_id', user.id);
    data.append('title', formData.get('title'));
    data.append('description', formData.get('description'));
    data.append('priority', formData.get('priority'));
    data.append('category', selectedCategory);
    if (selectedFile) data.append('image', selectedFile);

    const loadingToast = toast.loading("Sending your complaint...");
    try {
      const res = await axios.post(`${API_BASE}/complaints.php`, data);
      toast.dismiss(loadingToast);
      if (res.data.status === 'success') {
        toast.success("Complaint submitted successfully.");
        e.target.reset();
        setSelectedCategory('Other');
        setPreviewImage(null);
        setSelectedFile(null);
        fetchData();
      } else toast.error(res.data.error || "Failed to send");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Connection error");
    }
  };

  const updateComplaintStatus = async (id, status) => {
    try {
      const res = await axios.put(`${API_BASE}/complaints.php`, { complaint_id: id, status, admin_name: user.name });
      if (res.data.status === 'success') { toast.success(`Complaint ${status.toLowerCase()}.`); fetchData(); }
      else toast.error(res.data.error || "Operation failed");
    } catch (err) { toast.error("Connection error"); }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm("Delete this complaint record?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/complaints.php?id=${id}`);
      if (res.data.status === 'success') { toast.success("Record deleted."); fetchData(); }
      else toast.error(res.data.error || "Failed to delete");
    } catch (err) { toast.error("Connection error"); }
  };

  const formatDateTime = (dateStr) => dateStr ? new Date(dateStr).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      <BackgroundEffect />

      {/* 1. STATUS HUB */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatNode label="Solved Rate" value={stats.uptime + "%"} icon={Icons.Activity} color="emerald" />
        <StatNode label="Active Issues" value={complaints.filter(c => ['PENDING', 'IN_PROGRESS'].includes(c.status)).length} icon={Icons.ShieldAlert} color="amber" />
        <StatNode label="Total Complaints" value={stats.total} icon={Icons.Terminal} color="blue" />
      </div>

      {/* 2. COMPLAINT FORM */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-white/5 pb-10">
               <div className="space-y-2">
                  <div className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" /><p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Complaints Center</p></div>
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">New Complaint.</h2>
               </div>
               <p className="text-xs font-bold text-slate-400 dark:text-slate-500 max-w-sm uppercase tracking-widest leading-relaxed">Tell us about any problem in your room or hostel.</p>
            </div>

            <form onSubmit={handleComplaint} className="space-y-10">
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Problem Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {categories.map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setSelectedCategory(cat.id)} className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 relative overflow-hidden ${selectedCategory === cat.id ? `bg-${cat.color}-500/10 border-${cat.color}-500 shadow-lg scale-105` : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'}`}>
                      <div className={`${selectedCategory === cat.id ? `text-${cat.color}-500` : 'text-slate-400'}`}>{cat.icon}</div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${selectedCategory === cat.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Subject</label><input name="title" placeholder="Briefly describe the issue" required className="w-full p-5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm shadow-sm" /></div>
                <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">How Urgent?</label><select name="priority" required className="w-full p-5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm cursor-pointer shadow-sm"><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Urgent">Critical</option></select></div>
                <div className="md:col-span-2 space-y-3"><label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Problem Details</label><textarea name="description" placeholder="Provide more details about the problem here..." required rows="4" className="w-full p-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white rounded-3xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm resize-none shadow-sm"></textarea></div>
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Attach Image (Optional)</label>
                  <div className="flex items-center gap-6">
                    <label className="cursor-pointer group"><div className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl group-hover:border-blue-500/50 transition-all"><Icons.Image size={20} className="text-slate-400 group-hover:text-blue-500" /><span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white">Choose Photo</span></div><input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if(f){ setSelectedFile(f); const r = new FileReader(); r.onloadend = () => setPreviewImage(r.result); r.readAsDataURL(f); } }} className="hidden" /></label>
                    {previewImage && <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-500/20 shadow-xl"><img src={previewImage} alt="Preview" className="w-full h-full object-cover" /><button type="button" onClick={() => { setPreviewImage(null); setSelectedFile(null); }} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"><Icons.X size={12} /></button></div>}
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end gap-6 pt-4"><button type="button" onClick={() => navigate('/student')} className="px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">Cancel</button><button disabled={user?.account_status === 'PENDING'} className={`px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center gap-4 active:scale-[0.98] shadow-2xl ${user?.account_status === 'PENDING' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02]'}`}><Icons.Send size={18} className="text-blue-500" />Submit Complaint</button></div>
              </div>
            </form>
          </div>
        </GlassCard>
      </motion.section>

      {/* 3. HISTORY LIST */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-white/10 pb-8 px-4">
           <div className="space-y-2"><span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Past Complaints</span><h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Complaints History.</h3></div>
           <div className="flex items-center gap-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-x-auto no-scrollbar max-w-full">
              {['ALL','ACTIVE','RESOLVED','CLOSED'].map(f => <FilterTab key={f} active={filter === f} onClick={() => setFilter(f)} label={f === 'RESOLVED' ? 'Fixed' : f} />)}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredComplaints.length > 0 ? filteredComplaints.map((c) => (
              <motion.div key={c.complaint_id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <GlassCard p="p-0" className="flex flex-col hover:border-blue-500/30 transition-all duration-500">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3"><span className="text-[9px] font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1 rounded-full uppercase tracking-widest">ID: #TK-{c.complaint_id}</span><StatusBadge status={c.status} /></div>
                        <h4 className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter leading-tight uppercase">{c.title}</h4>
                        <div className="flex items-center gap-4 text-slate-400"><span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><Icons.Layers size={12} /> {c.category}</span><span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><Icons.Calendar size={12} /> {formatDateTime(c.created_at)}</span></div>
                      </div>
                      <PriorityIndicator level={c.priority} />
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5 mb-8"><p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed">"{c.description}"</p></div>
                    <div className="mb-8 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Progress Tracker</p>
                      <div className="grid gap-3">
                        {c.in_progress_at && <div className="flex items-center gap-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10"><Icons.RefreshCcw size={14} className="text-blue-600" /><div><p className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Started Handling</p><p className="text-[10px] font-bold text-slate-500">{formatDateTime(c.in_progress_at)}</p></div></div>}
                        {c.resolved_at && <div className="flex items-center gap-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10"><Icons.CheckCircle2 size={14} className="text-emerald-600" /><div><p className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">Resolved On</p><p className="text-[10px] font-bold text-slate-500">{formatDateTime(c.resolved_at)}</p></div></div>}
                      </div>
                    </div>
                    {c.resolution_note && <div className="mb-8 p-6 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-3xl border border-emerald-500/20"><p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-3">Warden's Reply</p><p className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-relaxed font-mono"><span className="text-emerald-500 mr-2">&gt;</span>{c.resolution_note}</p></div>}
                    <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-col"><span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Support</span><span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Hostel Management</span></div>
                      <div className="flex items-center gap-2"><button onClick={() => deleteComplaint(c.complaint_id)} className="p-4 text-slate-300 hover:text-red-500 transition-all"><Icons.Trash2 size={18} /></button>{c.status === 'RESOLVED' && <><button onClick={() => updateComplaintStatus(c.complaint_id, 'PENDING')} className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">Reopen</button><button onClick={() => updateComplaintStatus(c.complaint_id, 'CLOSED')} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">Close</button></>}</div>
                    </div>
                  </div>
                  {(c.issue_image_url || c.resolution_image_url) && (
                    <div className="bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 grid grid-cols-2">
                      {c.issue_image_url ? <div className="relative group/img aspect-video border-r border-slate-100 dark:border-white/5 overflow-hidden"><img src={c.issue_image_url} alt="Issue" className="w-full h-full object-cover transition-all duration-500" /><div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"><button onClick={() => setLightboxImage(c.issue_image_url)} className="p-3 bg-white text-slate-900 rounded-full scale-75 group-hover/img:scale-100 transition-transform"><Icons.Maximize2 size={20} /></button></div><div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-slate-900/90 rounded-md shadow-sm"><p className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">Reported Evidence</p></div></div> : <div className="aspect-video flex items-center justify-center text-[8px] font-black uppercase text-slate-300 border-r border-slate-100 dark:border-white/5">No Image Provided</div>}
                      {c.resolution_image_url ? <div className="relative group/img aspect-video overflow-hidden"><img src={c.resolution_image_url} alt="Resolution" className="w-full h-full object-cover transition-all duration-500" /><div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"><button onClick={() => setLightboxImage(c.resolution_image_url)} className="p-3 bg-white text-emerald-600 rounded-full scale-75 group-hover/img:scale-100 transition-transform"><Icons.Maximize2 size={20} /></button></div><div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500/90 text-white rounded-md shadow-sm"><p className="text-[8px] font-black uppercase tracking-tighter">Resolution Proof</p></div></div> : <div className="aspect-video flex flex-col items-center justify-center text-[8px] font-black uppercase text-slate-300">{c.status === 'PENDING' || c.status === 'IN_PROGRESS' ? 'Awaiting Fix' : 'No Proof Uploaded'}</div>}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )) : <EmptyState title="No Complaints." message="You don't have any active problems reported." icon={Icons.ShieldCheck} />}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10" onClick={() => setLightboxImage(null)}>
            <button className="absolute top-8 right-8 p-4 text-white hover:bg-white/10 rounded-full transition-all"><Icons.X size={32} /></button>
            <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} src={lightboxImage} alt="Full Evidence" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    PENDING: { label: 'Pending', color: 'bg-slate-100 text-slate-900 dark:bg-white dark:text-slate-900' },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-500 text-white animate-pulse' },
    RESOLVED: { label: 'Fixed', color: 'bg-emerald-500 text-white' },
    CLOSED: { label: 'Closed', color: 'bg-slate-900 text-white dark:bg-slate-800' }
  };
  const { label, color } = config[status] || config.PENDING;
  return <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${color}`}>{label}</span>;
};

const PriorityIndicator = ({ level }) => {
  const levels = {
    Low: { color: 'bg-emerald-500/10 text-emerald-500', icon: Icons.CheckCircle },
    Medium: { color: 'bg-blue-500/10 text-blue-500', icon: Icons.Timer },
    High: { color: 'bg-amber-500/10 text-amber-500', icon: Icons.AlertCircle },
    Urgent: { color: 'bg-red-500 text-white shadow-lg animate-pulse', icon: Icons.ShieldAlert }
  };
  const { color, icon: Icon } = levels[level] || levels.Low;
  return <div className={`flex flex-col items-center gap-1 p-3 rounded-2xl ${color}`}><Icon size={18} /><span className="text-[8px] font-black uppercase tracking-widest">{level}</span></div>;
};

export default Complaints;
