import React, {useState, useEffect, useMemo} from'react';
import axios from'axios';
import toast from'react-hot-toast';
import * as Icons from'../../components/Icons';
import {API_BASE, isSuccess} from'../../config';
import {StatCard, LoadingScreen, EmptyState} from'../../components/admin/AdminShared';

const Approvals = ({user}) => {
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

 useEffect(() => {fetchData();}, []);

 const handleApprove = async (id, status) => {
 const loadingToast = toast.loading(status ==='ACTIVE'?"Authorizing scholar...":"Processing rejection...");
 try {
 const res = await axios.post(`${API_BASE}/admin_action.php`, {
 action:'approve', 
 student_id: id, 
 status: status,
 admin_name: user?.name
});
 toast.dismiss(loadingToast);
 if (isSuccess(res)) {
 toast.success(`Scholar ${status ==='ACTIVE'?'Approved':'Declined'} Successfully`);
 fetchData();
} else {
 toast.error(res.data.error ||"Operation failed");
}
} catch (err) {
 toast.dismiss(loadingToast);
 toast.error("Connection failed");
}
};

 const stats = useMemo(() => {
 const total = pending.length;
 const today = pending.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;
 const topDept = [...new Set(pending.map(s => s.department))].sort((a,b) => 
 pending.filter(s => s.department === b).length - pending.filter(s => s.department === a).length
 )[0] ||'N/A';
 return {total, today, topDept};
}, [pending]);

 const filteredApplications = useMemo(() => {
 const query = search.toLowerCase();
 return pending.filter(s => 
 (s.name ||"").toLowerCase().includes(query) || 
 (s.reg_no ||"").toLowerCase().includes(query) ||
 (s.department ||"").toLowerCase().includes(query)
 );
}, [pending, search]);

 if (loading) return <LoadingScreen message="Syncing Application Queue..."/>;

 return (
 <div className="space-y-8 animate-slide-up">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <StatCard icon={Icons.UserPlus} label="Awaiting Review"value={stats.total} subValue="Total Applications"color="blue"/>
 <StatCard icon={Icons.Calendar} label="New Today"value={stats.today} subValue="Fresh Inbound"color="teal"pulse={stats.today > 0} />
 <StatCard icon={Icons.Building2} label="Lead Faculty"value={stats.topDept} subValue="Highest Volume"color="orange"/>
 </div>

 <div className="flex flex-col md:flex-row gap-6 items-center">
 <div className="relative flex-1 group w-full">
 <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors"size={20}/>
 <input 
 placeholder="Search by name, ID, or department..."
 className="w-full pl-12 pr-6 py-4 bg-white backdrop-blur-sm rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900 font-medium"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>
 <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
 <Icons.ShieldCheck size={14} /> Verification Mode Active
 </div>
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
 {filteredApplications.length > 0 ? filteredApplications.map(s => (
 <ApplicationDossier 
 key={s.student_id} 
 student={s} 
 onApprove={() => handleApprove(s.student_id,'ACTIVE')}
 onReject={() => handleApprove(s.student_id,'REJECTED')}
 />
 )) : <EmptyState title="Queue Cleared"message="All scholar registrations have been verified"icon={Icons.CheckCircle2} />}
 </div>
 </div>
 );
};

const ApplicationDossier = ({student: s, onApprove, onReject}) => {
 const timeSince = useMemo(() => {
 const diff = new Date() - new Date(s.created_at);
 const hours = Math.floor(diff / (1000 * 60 * 60));
 if (hours < 1) return"Just now";
 if (hours < 24) return `${hours}h ago`;
 return `${Math.floor(hours / 24)}d ago`;
}, [s.created_at]);

 return (
 <div className="bg-white backdrop-blur-sm rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden flex flex-col">
 <div className="p-8">
 <div className="flex items-start gap-6 mb-8">
 <div className="w-20 h-20 rounded-[1.8rem] bg-slate-900 text-white flex items-center justify-center font-black text-3xl shadow-xl group-hover:scale-105 transition-transform duration-500">{s.name?.[0]}</div>
 <div className="flex-1 min-w-0">
 <h3 className="text-2xl font-black text-slate-900 tracking-tight truncate mb-1">{s.name}</h3>
 <div className="flex flex-wrap items-center gap-2"><span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black tracking-widest uppercase">{s.reg_no}</span><span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter"><Icons.Clock size={12} /> Received {timeSince}</span></div>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"><DetailBox icon={Icons.Building2} label="Faculty"value={s.department} /><DetailBox icon={Icons.GraduationCap} label="Year"value={`Year ${s.year}`} /><DetailBox icon={Icons.Phone} label="Contact"value={s.phone ||'N/A'} /></div>
 <div className="flex gap-4">
 <button onClick={onApprove} className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10 group"><Icons.CheckCircle size={18} /> Confirm Admission</button>
 <button onClick={() => {if(window.confirm("Decline this application?")) onReject();}} className="flex-1 bg-slate-50 text-slate-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"><Icons.XCircle size={18} /> Decline</button>
 </div>
 </div>
 <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"/><span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Identity Verification Pending</span></div><Icons.Info size={14} className="text-slate-200"/></div>
 </div>
 );
};

const DetailBox = ({icon: Icon, label, value}) => (
 <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
 <div className="flex items-center gap-2 mb-1 text-slate-400"><Icon size={12} /><p className="text-[9px] font-black uppercase tracking-widest">{label}</p></div>
 <p className="font-black text-slate-900 text-xs uppercase truncate">{value}</p>
 </div>
);

export default Approvals;

