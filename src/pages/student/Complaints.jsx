import React, {useState, useEffect, useMemo} from'react';
import toast from'react-hot-toast';
import {motion, AnimatePresence} from'framer-motion';
import * as Icons from'../../components/Icons';
import {useOutletContext, useNavigate} from'react-router-dom';
import {studentService} from'../../services/api';
import {GlassCard, StatNode, FilterTab, EmptyState} from'../../components/student/StudentShared';

const Complaints = () => {
 const {user} = useOutletContext();
 const navigate = useNavigate();
 const [complaints, setComplaints] = useState([]);
 const [selectedCategory, setSelectedCategory] = useState('Other');
 const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, RESOLVED, CLOSED

 const categories = [
 {id:'Electrical', icon: <Icons.Zap size={20} />, label:'Electrical', color:'amber'},
 {id:'Plumbing', icon: <Icons.Wrench size={20} />, label:'Plumbing', color:'blue'},
 {id:'Internet', icon: <Icons.Wifi size={20} />, label:'Internet', color:'indigo'},
 {id:'Furniture', icon: <Icons.Layers size={20} />, label:'Furniture', color:'emerald'},
 {id:'Cleaning', icon: <Icons.Ghost size={20} />, label:'Cleaning', color:'teal'},
 {id:'Other', icon: <Icons.MoreHorizontal size={20} />, label:'Other', color:'slate'},
];

 const fetchData = async () => {
 try {
 const res = await studentService.getComplaints(user.id);
 setComplaints(Array.isArray(res.data) ? res.data : []);
} catch (err) {
 console.error("Sync error:", err);
}
};

 useEffect(() => {
 fetchData();
 const interval = setInterval(fetchData, 30000);
 return () => clearInterval(interval);
}, [user.id]);

 const stats = useMemo(() => {
 const total = complaints.length;
 const resolved = complaints.filter(c => c.status ==='RESOLVED'|| c.status ==='CLOSED').length;
 const uptime = total === 0 ? 100 : Math.round((resolved / total) * 100);
 return {total, resolved, uptime};
}, [complaints]);

 const filteredComplaints = useMemo(() => {
 if (filter ==='ACTIVE') return complaints.filter(c => ['PENDING','IN_PROGRESS'].includes(c.status));
 if (filter ==='RESOLVED') return complaints.filter(c => c.status ==='RESOLVED');
 if (filter ==='CLOSED') return complaints.filter(c => c.status ==='CLOSED');
 return complaints;
}, [complaints, filter]);

 const handleComplaint = async (e) => {
 e.preventDefault();
 const formData = new FormData(e.target);
 const payload = {
 title: formData.get('title'),
 description: formData.get('description'),
 priority: formData.get('priority'),
 category: selectedCategory
};

 const loadingToast = toast.loading("Sending your complaint...");
 try {
 await studentService.submitComplaint(payload, user);
 toast.dismiss(loadingToast);
 toast.success("Complaint submitted successfully.");
 e.target.reset();
 setSelectedCategory('Other');
 fetchData();
} catch (err) {
 toast.dismiss(loadingToast);
 toast.error(err.message || "Failed to send");
}
};

 const updateComplaintStatus = async (id, status) => {
 try {
 await studentService.updateComplaintStatus({complaint_id: id, status}, user);
 toast.success(`Complaint ${status.toLowerCase()}.`); 
 fetchData();
} catch (err) {toast.error(err.message || "Operation failed");}
};

 const deleteComplaint = async (id) => {
 if (!window.confirm("Delete this complaint record?")) return;
 try {
 await studentService.deleteComplaint(id, user);
 toast.success("Record deleted."); 
 fetchData();
} catch (err) {toast.error(err.message || "Failed to delete");}
};

 const formatDateTime = (dateStr) => dateStr ? new Date(dateStr).toLocaleString('en-GB', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'}) : null;

 return (
 <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6">

 {/* 1. STATUS HUB */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
 <StatNode label="Solved Rate"value={stats.uptime +"%"} icon={Icons.Activity} color="emerald"/>
 <StatNode label="Active Issues"value={complaints.filter(c => ['PENDING','IN_PROGRESS'].includes(c.status)).length} icon={Icons.ShieldAlert} color="amber"/>
 <StatNode label="Total Complaints"value={stats.total} icon={Icons.Terminal} color="blue"/>
 </div>

 {/* 2. COMPLAINT FORM */}
 <motion.section initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
 <GlassCard>
 <div className="space-y-10">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
 <div className="space-y-2">
 <div className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"/><p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Complaints Center</p></div>
 <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">New Complaint.</h2>
 </div>
 <p className="text-xs font-bold text-slate-400 max-w-sm uppercase tracking-widest leading-relaxed">Tell us about any problem in your room or hostel.</p>
 </div>

 <form onSubmit={handleComplaint} className="space-y-10">
 <div className="space-y-6">
 <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Problem Type</label>
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
 {categories.map((cat) => (
 <button key={cat.id} type="button"onClick={() => setSelectedCategory(cat.id)} className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 relative overflow-hidden ${selectedCategory === cat.id ? `bg-${cat.color}-500/10 border-${cat.color}-500 shadow-lg scale-105` :'bg-white border-slate-100 hover:border-slate-300'}`}>
 <div className={`${selectedCategory === cat.id ? `text-${cat.color}-500` :'text-slate-400'}`}>{cat.icon}</div>
 <span className={`text-[10px] font-black uppercase tracking-widest ${selectedCategory === cat.id ?'text-slate-900':'text-slate-400'}`}>{cat.label}</span>
 </button>
 ))}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Subject</label><input name="title"placeholder="Briefly describe the issue"required className="w-full p-5 bg-white border border-slate-100 text-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm shadow-sm"/></div>
 <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">How Urgent?</label><select name="priority"required className="w-full p-5 bg-white border border-slate-100 text-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm cursor-pointer shadow-sm"><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Urgent">Critical</option></select></div>
 <div className="md:col-span-2 space-y-3"><label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Problem Details</label><textarea name="description"placeholder="Provide more details about the problem here..."required rows="4"className="w-full p-6 bg-white border border-slate-100 text-slate-900 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm resize-none shadow-sm"></textarea></div>
 <div className="md:col-span-2 flex justify-end gap-6 pt-4"><button type="button"onClick={() => navigate('/student')} className="px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-all">Cancel</button><button disabled={user?.account_status ==='PENDING'} className={`px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center gap-4 active:scale-[0.98] shadow-2xl ${user?.account_status ==='PENDING'?'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50':'bg-slate-900 text-white hover:scale-[1.02]'}`}><Icons.Send size={18} className="text-blue-500"/>Submit Complaint</button></div>
 </div>
 </form>
 </div>
 </GlassCard>
 </motion.section>

 {/* 3. HISTORY LIST */}
 <section className="space-y-10">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8 px-4">
 <div className="space-y-2"><span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Past Complaints</span><h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Complaints History.</h3></div>
 <div className="flex items-center gap-3 bg-white/40 backdrop-blur-2xl p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar max-w-full">
 {['ALL','ACTIVE','RESOLVED','CLOSED'].map(f => <FilterTab key={f} active={filter === f} onClick={() => setFilter(f)} label={f ==='RESOLVED'?'Fixed': f} />)}
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 <AnimatePresence mode="popLayout">
 {filteredComplaints.length > 0 ? filteredComplaints.map((c) => (
 <motion.div key={c.complaint_id} layout initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0}}>
 <GlassCard p="p-0"className="flex flex-col hover:border-blue-500/30 transition-all duration-500 overflow-hidden">
 <div className="p-8">
 <div className="flex justify-between items-start mb-8">
 <div className="space-y-3">
 <div className="flex items-center gap-3"><span className="text-[9px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-widest">ID: #TK-{c.complaint_id}</span><StatusBadge status={c.status} /></div>
 <h4 className="font-black text-slate-900 text-2xl tracking-tighter leading-tight uppercase">{c.title}</h4>
 <div className="flex items-center gap-4 text-slate-400"><span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><Icons.Layers size={12} /> {c.category}</span><span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><Icons.Calendar size={12} /> {formatDateTime(c.created_at)}</span></div>
 </div>
 <PriorityIndicator level={c.priority} />
 </div>

 <div className="flex gap-6 items-start mb-8">
 <div className="w-16 h-16 rounded-2xl bg-slate-100 p-3 flex-shrink-0 flex items-center justify-center border border-slate-200">
 <img src={c.issue_image_url} alt={c.category} className="w-full h-full object-contain"/>
 </div>
 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex-grow"><p className="text-sm font-bold text-slate-600 italic leading-relaxed">"{c.description}"</p></div>
 </div>

 <div className="mb-8 space-y-4">
 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Progress Tracker</p>
 <div className="grid gap-3">
 {c.in_progress_at && <div className="flex items-center gap-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10"><Icons.RefreshCcw size={14} className="text-blue-600"/><div><p className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Started Handling</p><p className="text-[10px] font-bold text-slate-500">{formatDateTime(c.in_progress_at)}</p></div></div>}
 {c.resolved_at && <div className="flex items-center gap-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10"><Icons.CheckCircle2 size={14} className="text-emerald-600"/><div><p className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">Resolved On</p><p className="text-[10px] font-bold text-slate-500">{formatDateTime(c.resolved_at)}</p></div></div>}
 </div>
 </div>
 {c.resolution_note && <div className="mb-8 p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/20"><p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Warden's Reply</p><p className="text-sm font-black text-slate-900 tracking-tight leading-relaxed font-mono"><span className="text-emerald-500 mr-2">&gt;</span>{c.resolution_note}</p></div>}
 <div className="pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
 <div className="flex flex-col"><span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Support</span><span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Hostel Management</span></div>
 <div className="flex items-center gap-2"><button onClick={() => deleteComplaint(c.complaint_id)} className="p-4 text-slate-300 hover:text-red-500 transition-all"><Icons.Trash2 size={18} /></button>{c.status ==='RESOLVED'&& <><button onClick={() => updateComplaintStatus(c.complaint_id,'PENDING')} className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">Reopen</button><button onClick={() => updateComplaintStatus(c.complaint_id,'CLOSED')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">Close</button></>}</div>
 </div>
 </div>
 </GlassCard>
 </motion.div>
 )) : <EmptyState title="No Complaints."message="You don't have any active problems reported."icon={Icons.ShieldCheck} />}
 </AnimatePresence>
 </div>
 </section>
 </div>
 );
};

const StatusBadge = ({status}) => {
 const config = {
 PENDING: {label:'Pending', color:'bg-slate-100 text-slate-900'},
 IN_PROGRESS: {label:'In Progress', color:'bg-blue-500 text-white animate-pulse'},
 RESOLVED: {label:'Fixed', color:'bg-emerald-500 text-white'},
 CLOSED: {label:'Closed', color:'bg-slate-900 text-white'}
};
 const {label, color} = config[status] || config.PENDING;
 return <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${color}`}>{label}</span>;
};

const PriorityIndicator = ({level}) => {
 const levels = {
 Low: {color:'bg-emerald-500/10 text-emerald-500', icon: Icons.CheckCircle},
 Medium: {color:'bg-blue-500/10 text-blue-500', icon: Icons.Timer},
 High: {color:'bg-amber-500/10 text-amber-500', icon: Icons.AlertCircle},
 Urgent: {color:'bg-red-500 text-white shadow-lg animate-pulse', icon: Icons.ShieldAlert}
};
 const {color, icon: Icon} = levels[level] || levels.Low;
 return <div className={`flex flex-col items-center gap-1 p-3 rounded-2xl ${color}`}><Icon size={18} /><span className="text-[8px] font-black uppercase tracking-widest">{level}</span></div>;
};

export default Complaints;
