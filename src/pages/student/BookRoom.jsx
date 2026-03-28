import React, {useState, useEffect, useMemo} from'react';
import toast from'react-hot-toast';
import {motion, AnimatePresence} from'framer-motion';
import * as Icons from'../../components/Icons';
import {useOutletContext, useNavigate} from'react-router-dom';
import {studentService, adminService} from'../../services/api';
import BackgroundEffect from'../../components/BackgroundEffect';
import {GlassCard, StatNode, EmptyState} from'../../components/student/StudentShared';

const BookRoom = () => {
 const {user} = useOutletContext();
 const navigate = useNavigate();
 const [availableRooms, setAvailableRooms] = useState([]);
 const [studentStatus, setStudentStatus] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
 const [selectedBlock, setSelectedBlock] = useState('All');
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedRoomForApply, setSelectedRoomForApply] = useState(null);
 const [requestReason, setRequestReason] = useState('');

 const studentId = user?.student_id || user?.id;

 const fetchData = async () => {
 if (!studentId) return;
 try {
 const [roomsRes, statusRes] = await Promise.all([
 adminService.getRooms(), // Any active student can see available rooms
 studentService.getRoomInfo(studentId)
]);
 setAvailableRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
 setStudentStatus(statusRes.data || null);
} catch (err) {console.error("Data fetch error:", err);}
 finally {setIsLoading(false);}
};

 useEffect(() => {
 if (studentId) {
 fetchData();
 const interval = setInterval(fetchData, 30000);
 return () => clearInterval(interval);
}
}, [studentId]);

 const blocks = useMemo(() => {
 const uniqueBlocks = [...new Set(availableRooms.map(r => String(r.block).trim()))];
 return ['All', ...uniqueBlocks.sort()];
}, [availableRooms]);

 const filteredRooms = useMemo(() => {
 return availableRooms.filter(r => {
 const blockStr = String(r.block).trim();
 const matchesBlock = selectedBlock ==='All'|| blockStr.toUpperCase() === selectedBlock.toUpperCase();
 const searchLower = searchQuery.toLowerCase().trim();
 const matchesSearch = !searchLower || String(r.room_number).toLowerCase().includes(searchLower) || blockStr.toLowerCase().includes(searchLower);
 return matchesBlock && matchesSearch;
});
}, [availableRooms, selectedBlock, searchQuery]);

 const requestRoom = async () => {
 if (!selectedRoomForApply || !studentId) return toast.error("User identity not found.");
 if (studentStatus?.status === 'ALLOCATED' && !requestReason.trim()) return toast.error("Please provide a reason for changing your room.");

 const loadingToast = toast.loading("Submitting your request...");
 try {
 await studentService.bookRoom({room_id: selectedRoomForApply.room_id, reason: requestReason}, user);
 toast.dismiss(loadingToast);
 toast.success("Request submitted successfully.");
 setSelectedRoomForApply(null); setRequestReason(''); fetchData();
} catch (err) {
    toast.dismiss(loadingToast); 
    toast.error(err.message || "Server failed to process request");
}
};

 const handleAction = async (action, payload = {}) => {
    try {
        await adminService.adminAction({ action, student_id: studentId, ...payload }, user);
        fetchData();
    } catch (err) {
        toast.error(err.message || "Action failed");
    }
 };

 if (!isLoading && studentStatus?.status ==='REQUESTED') return (
 <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
 <motion.div initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}}>
 <GlassCard className="text-center relative py-20">
 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0"/>
 <div className="space-y-10">
 <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto relative"><Icons.Timer size={48} className="text-amber-500 animate-pulse"/><div className="absolute -inset-4 border border-amber-500/20 rounded-full animate-ping opacity-20"/></div>
 <div className="space-y-4"><h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">Request<br />In Review.</h2><p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 max-w-md mx-auto">Your request for Room {studentStatus.room_number} is being checked by the warden.</p></div>
 {studentStatus.room_request_reason && <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 text-left max-w-lg mx-auto"><p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Your Reason</p><p className="text-sm font-bold text-slate-600 italic">"{studentStatus.room_request_reason}"</p></div>}
 <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-600 text-[10px] font-black uppercase tracking-widest"><Icons.ShieldAlert size={16} />Waiting for Warden</div>
 </div>
 </GlassCard>
 </motion.div>
 </div>
 );

 return (
 <div className="space-y-12 animate-in fade-in duration-700">
 <BackgroundEffect />
 {studentStatus?.room_rejection_note && (
 <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} className="max-w-5xl mx-auto bg-red-500/10 border border-red-500/20 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
 <div className="absolute top-0 right-0 p-8 opacity-10"><Icons.ShieldAlert size={150} className="text-red-500"/></div>
 <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
 <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl rotate-3"><Icons.ShieldAlert size={40} /></div>
 <div className="space-y-3 flex-1"><p className="text-[10px] font-black uppercase tracking-widest text-red-500">Notice from Warden</p><h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Request Rejected.</h3><div className="mt-4 bg-white/40 p-6 rounded-3xl border border-red-500/10 backdrop-blur-md"><p className="text-sm font-bold text-slate-600 italic leading-relaxed">"Reason: {studentStatus.room_rejection_note}"</p></div></div>
 <button onClick={() => handleAction('dismiss_rejection')} className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Dismiss</button>
 </div>
 </motion.div>
 )}

 {studentStatus?.status ==='SUGGESTED'&& (
 <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} className="max-w-5xl mx-auto bg-blue-500/10 border border-blue-500/20 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
 <div className="absolute top-0 right-0 p-8 opacity-10"><Icons.Zap size={150} className="text-blue-500"/></div>
 <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
 <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl rotate-3"><Icons.Building2 size={40} /></div>
 <div className="space-y-3 flex-1"><p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Official Suggestion</p><h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">New Room Available.</h3><div className="mt-4 bg-white/40 p-6 rounded-3xl border border-red-500/10 backdrop-blur-md"><p className="text-sm font-bold text-slate-600 italic leading-relaxed uppercase tracking-widest">The Warden suggests you move to Room {studentStatus.room_number}.</p></div></div>
 <div className="flex flex-col sm:flex-row gap-4"><button onClick={() => handleAction('reject_request', {rejection_note: 'Student declined suggestion'})} className="px-8 py-5 text-slate-500 hover:text-red-500 font-black uppercase text-[10px] tracking-widest transition-colors">Decline</button><button onClick={() => {const lt = toast.loading("Processing relocation..."); adminService.adminAction({action:'accept_suggestion', student_id: studentId, room_id: studentStatus.room_id}, user).then((res) => {toast.dismiss(lt); toast.success("Relocation successful!"); fetchData();}).catch((err) => {toast.dismiss(lt); toast.error(err.message || "Network error");});}} className="px-10 py-5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-3"><Icons.CheckCircle2 size={16} />Accept & Move</button></div>
 </div>
 </motion.div>
 )}

 <div className="max-w-7xl mx-auto space-y-12 px-4 sm:px-6">
 <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <StatNode label="Total Units" value={availableRooms.length} icon={Icons.Home} color="blue"/>
 <StatNode label="Open Slots" value={availableRooms.reduce((acc, r) => acc + (parseInt(r.capacity) - parseInt(r.current_occupancy)), 0)} icon={Icons.Users} color="teal"/>
 <StatNode label="Active Wings" value={blocks.length - 1} icon={Icons.Building2} color="orange"/>
 <StatNode label="System" value="Live" icon={Icons.Zap} color="emerald"/>
 </section>

 <section className="flex flex-col md:flex-row items-center gap-6">
 <div className="flex-1 relative w-full group"><Icons.Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"size={20} /><input type="text"placeholder="Search room number or block..."value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/40 backdrop-blur-2xl border border-slate-200 rounded-2xl py-5 pl-16 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 shadow-sm"/></div>
 <div className="flex items-center gap-2 bg-white/40 backdrop-blur-2xl p-2 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar max-w-full shadow-sm">
 {blocks.map(block => <button key={block} onClick={() => setSelectedBlock(block)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${String(selectedBlock) === String(block) ?'bg-slate-900 text-white shadow-lg scale-105':'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>{block ==='All'?'All Blocks': `Block ${block}`}</button>)}
 </div>
 </section>

 <div className="min-h-[40vh] relative">
 {isLoading ? (
 <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4"><Icons.Loader2 size={40} className="animate-spin text-blue-500 opacity-20"/><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Checking rooms...</p></div>
 ) : (
 <motion.div variants={{hidden: {opacity: 0}, show: {opacity: 1, transition: {staggerChildren: 0.05}}}} initial="hidden"animate="show"className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 <AnimatePresence mode="popLayout">
 {filteredRooms.length > 0 ? filteredRooms.map((r) => (
 <motion.div key={r.room_id} layout className="group">
 <GlassCard p="p-0"className="flex flex-col h-full hover:border-blue-500/30 transition-all duration-500">
 <div className="p-8 md:p-10 flex-1 relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Icons.LayoutGrid size={120} /></div>
 <div className="flex justify-between items-start mb-10 relative z-10"><div className="p-5 bg-blue-600/10 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-inner"><Icons.BedDouble size={32} /></div><div className="flex flex-col items-end gap-2"><span className="bg-blue-500/10 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20 shadow-sm">CASH {r.price}</span><span className="bg-teal-500/10 text-teal-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-500/20 shadow-sm">{r.capacity - r.current_occupancy} Free Slots</span></div></div>
 <div className="relative z-10 space-y-2 mb-10"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Room Number</p><h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">ROOM {r.room_number}</h3><div className="flex items-center gap-2 pt-2 text-slate-500 font-bold text-[11px] uppercase tracking-widest"><Icons.Building2 size={14} className="text-blue-500"/><span>Block {r.block} • Standard Room</span></div></div>
 <div className="space-y-4 pt-8 border-t border-slate-100 relative z-10">
 <div className="flex justify-between items-end"><div className="space-y-1"><span className="text-slate-400 font-black uppercase text-[9px] tracking-widest block">Room Occupancy</span><p className="font-black text-slate-900 text-base tracking-tight">{r.current_occupancy} / {r.capacity} OCCUPIED</p></div><span className="text-2xl font-black text-blue-500 tracking-tighter leading-none">{((r.current_occupancy / r.capacity) * 100).toFixed(0)}%</span></div>
 <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner"><motion.div initial={{width: 0}} animate={{width: `${(r.current_occupancy / r.capacity) * 100}%`}} transition={{duration: 1}} className={`h-full rounded-full ${r.current_occupancy >= r.capacity ?'bg-slate-900':'bg-gradient-to-r from-blue-600 to-indigo-500'}`} /></div>
 </div>
 </div>
 <button onClick={() => setSelectedRoomForApply(r)} disabled={user?.account_status ==='PENDING'} className={`w-full py-8 font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all relative overflow-hidden group/btn ${user?.account_status ==='PENDING'?'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50':'bg-slate-900 text-white hover:bg-slate-800'}`}><div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"/><span className="relative z-10">{user?.account_status ==='PENDING'?"Waiting for Approval": (studentStatus?.status === 'ALLOCATED' ?"Request Change":"Book Room")}</span>{user?.account_status !=='PENDING'&& <Icons.ArrowRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform"/>}</button>
 </GlassCard>
 </motion.div>
 )) : <EmptyState title="No Rooms Found."message={`All rooms in Block ${selectedBlock} are currently full.`} />}
 </AnimatePresence>
 </motion.div>
 )}
 </div>
 </div>

 <AnimatePresence>
 {selectedRoomForApply && (
 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-900/80 backdrop-blur-md">
 <motion.div initial={{scale: 0.9, opacity: 0, y: 20}} animate={{scale: 1, opacity: 1, y: 0}} exit={{scale: 0.9, opacity: 0, y: 20}} className="w-full max-w-xl max-h-[95vh] flex flex-col">
 <div className="bg-white rounded-[2.5rem] border-2 border-blue-600/20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
 <div className="p-6 md:p-8 overflow-y-auto scrollbar-hide space-y-6">
 {/* Header Section */}
 <div className="flex justify-between items-start">
 <div className="space-y-2">
 <div className="flex items-center gap-2 px-2 py-0.5 bg-blue-600 text-white w-fit rounded-md shadow-md shadow-blue-600/20">
 <Icons.Home size={10} strokeWidth={3} />
 <span className="text-[8px] font-black uppercase tracking-widest">New Request</span>
 </div>
 <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
 {studentStatus?.status === 'ALLOCATED' ?"Change Room.":"Book Room."}
 </h3>
 </div>
 <div className="p-3 bg-slate-900 rounded-2xl text-white font-black text-xl tracking-tighter flex flex-col items-end shadow-xl">
 <span className="text-[8px] font-black uppercase tracking-widest text-blue-400 mb-0.5 opacity-80">Room</span>
 <span>{selectedRoomForApply.room_number}</span>
 </div>
 </div>

 <div className="space-y-6">
 {studentStatus?.status === 'ALLOCATED' ? (
 <div className="space-y-3">
 <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-900 ml-1">
 <Icons.FileText size={12} className="text-blue-600" />
 Reason for relocation
 </label>
 <textarea 
 value={requestReason} 
 onChange={(e) => setRequestReason(e.target.value)} 
 placeholder="Why change to this room? (e.g., Medical, Department preference...)"
 className="w-full min-h-[120px] p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all resize-none placeholder:text-slate-400"
 />
 </div>
 ) : (
 <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center space-y-2 relative overflow-hidden group">
 <p className="text-base font-black text-slate-900 uppercase tracking-tight relative z-10">Confirm Room Selection?</p>
 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 opacity-80 relative z-10">Submission will be sent to warden</p>
 </div>
 )}

 {/* Pricing Detail */}
 <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white shadow-lg">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400"><Icons.CreditCard size={20} /></div>
 <div>
 <p className="text-[8px] font-black uppercase tracking-widest opacity-50">Semester Fee</p>
 <p className="font-black text-lg tracking-tight">CASH {selectedRoomForApply.price}</p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-[8px] font-black uppercase tracking-widest opacity-50">Block</p>
 <p className="font-black text-lg tracking-tight text-blue-400">{selectedRoomForApply.block}</p>
 </div>
 </div>

 <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100/50">
 <Icons.Info size={18} className="text-amber-600 shrink-0 mt-0.5"/>
 <p className="text-[9px] font-bold text-amber-900 leading-relaxed uppercase tracking-wider">
 Important: Allocation is subject to availability and Warden's final approval based on priority.
 </p>
 </div>
 </div>

 <div className="flex gap-3 pt-2">
 <button 
 onClick={() => setSelectedRoomForApply(null)} 
 className="flex-1 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
 >
 Cancel
 </button>
 <button 
 onClick={requestRoom} 
 className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
 >
 <Icons.ArrowUpRight size={16} />
 Submit Request
 </button>
 </div>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 );
};

export default BookRoom;

