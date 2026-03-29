import React, {useState, useEffect, useMemo} from'react';
import * as Icons from'../../components/Icons';
import {useOutletContext} from'react-router-dom';
import toast from'react-hot-toast';
import {adminService} from'../../services/api';
import {StatCard, LoadingScreen, EmptyState} from'../../components/admin/AdminShared';

const Complaints = () => {
 const {user} = useOutletContext() || {};
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

 useEffect(() => {fetchData();}, []);

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
 const pending = complaints.filter(c => c.status ==='PENDING').length;
 const inProgress = complaints.filter(c => c.status ==='IN_PROGRESS').length;
 const resolved = complaints.filter(c => ['RESOLVED','CLOSED'].includes(c.status)).length;
 const high = complaints.filter(c => (c.priority ==='High'|| c.priority ==='Urgent') && c.status !=='CLOSED').length;
 return {total, pending, inProgress, resolved, high};
}, [complaints]);

 const filteredComplaints = useMemo(() => {
 return complaints.filter(c => {
 const query = search.toLowerCase();
 const matchesSearch = (c.title ||"").toLowerCase().includes(query) || (c.student_name ||"").toLowerCase().includes(query) || c.complaint_id?.toString().includes(query);
 const matchesTab = activeTab ==='ALL'|| (activeTab ==='PENDING'&& c.status ==='PENDING') || (activeTab ==='IN_PROGRESS'&& c.status ==='IN_PROGRESS') || (activeTab ==='RESOLVED'&& c.status ==='RESOLVED') || (activeTab ==='CLOSED'&& c.status ==='CLOSED');
 return matchesSearch && matchesTab;
}).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}, [complaints, search, activeTab]);

 if (loading) return <LoadingScreen message="Checking records..."/>;

 return (
 <div className="space-y-8 animate-slide-up">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <StatCard icon={Icons.ClipboardList} label="Total Complaints"value={stats.total} subValue="All Time"color="blue"/>
 <StatCard icon={Icons.ShieldAlert} label="Urgent Problems"value={stats.high} subValue="High Priority"color="red"pulse={stats.high > 0} />
 <StatCard icon={Icons.Activity} label="In Progress"value={stats.inProgress} subValue="Being Fixed"color="teal"/>
 <StatCard icon={Icons.CheckCircle} label="Solved Rate"value={`${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%`} subValue="Resolved Issues"color="teal"/>
 </div>

 <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center">
 <div className="relative flex-1 group">
 <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors"size={20}/>
 <input placeholder="Search by ID, title, or student name..."className="w-full pl-12 pr-6 py-4 bg-white backdrop-blur-sm rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900"value={search} onChange={(e) => setSearch(e.target.value)} />
 </div>
 <div className="flex p-1.5 bg-slate-100 rounded-2xl w-full xl:w-auto overflow-x-auto no-scrollbar">
 {['ALL','PENDING','IN_PROGRESS','RESOLVED','CLOSED'].map(tab => (
 <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === tab ?'bg-white text-slate-900 shadow-lg':'text-slate-400 hover:text-slate-600'}`}>
 {tab.replace('_','')}
 </button>
 ))}
 </div>
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
 {filteredComplaints.length > 0 ? filteredComplaints.map(c => <ComplaintTicket key={c.complaint_id} complaint={c} handleAction={handleAction} userRole={user?.role} />) : <EmptyState message="No complaints in this category"/>}
 </div>
 </div>
 );
};

const ComplaintTicket = ({complaint: c, handleAction, userRole}) => {
 const getPriorityColor = () => {
 switch(c.priority) {
 case'Urgent': return'border-red-500';
 case'High': return'border-slate-900';
 case'Medium': return'border-orange-400';
 default: return'border-slate-200';
}
};

 return (
 <div className={`bg-white backdrop-blur-sm rounded-[3rem] border-l-8 transition-all duration-300 group overflow-hidden flex flex-col shadow-sm hover:shadow-xl ${getPriorityColor()} border-t border-r border-b border-slate-200/60`}>
 <div className="p-8">
 <div className="flex justify-between items-start gap-4 mb-6">
 <div className="flex-1 min-w-0">
 <div className="flex flex-wrap items-center gap-2 mb-4">
 <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black tracking-widest uppercase">ID: #TK-{c.complaint_id}</span>
 <StatusBadge status={c.status} /><PriorityBadge priority={c.priority} />
 </div>
 <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-2 truncate">{c.title ||'No Title'}</h4>
 <div className="flex items-center gap-3"><span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px]">{c.student_name?.[0]}</div>{c.student_name}</span><span className="w-1 h-1 bg-slate-200 rounded-full"/><span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{c.category}</span></div>
 </div>
 {userRole ==='SUPER'&& <button onClick={() => {if(window.confirm("Delete this complaint?")) handleAction(c.complaint_id,'delete')}} className="p-3 bg-slate-50 text-slate-300 hover:text-red-500 rounded-2xl transition-all"><Icons.Trash2 size={20} /></button>}
 </div>

 <div className="flex gap-6 items-start mb-6">
 <div className="w-16 h-16 rounded-2xl bg-slate-100 p-3 flex-shrink-0 flex items-center justify-center border border-slate-200">
 <img src={c.issue_image_url} alt={c.category} className="w-full h-full object-contain"/>
 </div>
 <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex-grow relative group/msg"><Icons.MessageSquare className="absolute -top-3 -right-3 text-slate-200 transition-transform group-hover/msg:scale-110"size={32} /><p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{c.description}"</p></div>
 </div>

 <div className="relative pl-6 space-y-4 mb-8 before:absolute before:left-[5px] before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-slate-100"><TimelineItem icon={Icons.Timer} label="Reported"time={c.created_at} active />{c.in_progress_at && <TimelineItem icon={Icons.Clock} label="Started"time={c.in_progress_at} highlight />}{c.resolved_at && <TimelineItem icon={Icons.CheckCircle2} label="Resolved"time={c.resolved_at} success />}</div>
 <div className="space-y-4">
 {c.status ==='PENDING'&& <button onClick={() => handleAction(c.complaint_id,'in_progress')} className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-teal-500/20 group">Started Fixing <Icons.ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></button>}
 {(c.status ==='PENDING'|| c.status ==='IN_PROGRESS') && (
 <form onSubmit={(e) => {e.preventDefault(); handleAction(c.complaint_id,'resolve', e.target.note.value);}} className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
 <textarea name="note"required placeholder="What was done to fix this?..."className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none h-24 shadow-sm"/>
 <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-xl">Mark as Resolved</button>
 </form>
 )}
 {(c.status ==='RESOLVED'|| c.status ==='CLOSED') && <div className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col gap-4 shadow-lg animate-in fade-in zoom-in-95"><div className="flex items-start gap-4"><Icons.History className="flex-shrink-0 mt-1 opacity-40"size={20} /><div><p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">Resolution Note</p><p className="text-sm font-bold leading-relaxed">{c.resolution_note ||'Issue resolved.'}</p></div></div></div>}
 </div>
 </div>
 </div>
 );
};

const StatusBadge = ({status}) => {
 const config = {
 PENDING: {label:'Pending', color:'bg-red-50 text-red-600'},
 IN_PROGRESS: {label:'In Progress', color:'bg-teal-50 text-teal-600'},
 RESOLVED: {label:'Resolved', color:'bg-slate-900 text-white'},
 CLOSED: {label:'Closed', color:'bg-slate-900 text-white'}
};
 const {label, color} = config[status] || config.PENDING;
 return <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${color}`}>{label}</span>;
};

const PriorityBadge = ({priority}) => {
 if (priority ==='Urgent'|| priority ==='High') return <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg ${priority ==='Urgent'?'bg-red-600 text-white animate-pulse':'bg-slate-900 text-white'}`}>{priority}</span>;
 return <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[9px] font-black rounded-full uppercase tracking-widest">{priority}</span>;
};

const TimelineItem = ({icon: Icon, label, time, active, highlight, success}) => (
 <div className={`relative flex items-center gap-3 ${highlight ?'text-teal-600': success ?'text-slate-900': active ?'text-slate-600':'text-slate-400'}`}>
 <div className={`absolute -left-[23px] w-3 h-3 rounded-full border-2 border-white z-10 ${success ?'bg-slate-900': highlight ?'bg-teal-500':'bg-slate-200'}`} />
 <Icon size={14} className="flex-shrink-0"/>
 <div className="flex flex-wrap items-baseline gap-2 min-w-0"><span className="text-[10px] font-black uppercase tracking-widest truncate">{label}</span><span className="text-[10px] font-bold opacity-60">{new Date(time).toLocaleDateString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span></div>
 </div>
);

export default Complaints;

