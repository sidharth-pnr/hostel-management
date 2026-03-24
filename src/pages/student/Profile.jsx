import React, {useState, useEffect} from'react';
import * as Icons from'../../components/Icons';
import axios from'axios';
import toast from'react-hot-toast';
import {motion, AnimatePresence} from'framer-motion';
import {useOutletContext, useNavigate} from'react-router-dom';
import {API_BASE, isSuccess} from'../../config';
import BackgroundEffect from'../../components/BackgroundEffect';
import {GlassCard, InfoNode} from'../../components/student/StudentShared';

const Profile = () => {
 const {user, setUser} = useOutletContext();
 const navigate = useNavigate();
 const [room, setRoom] = useState(null);
 const [isEditing, setIsEditing] = useState(false);
 const [editData, setEditData] = useState({
 name: user.name,
 department: user.department,
 year: user.year,
 phone: user.phone,
});

 useEffect(() => {
 axios.get(`${API_BASE}/student_room.php?id=${user.student_id || user.id}`).then(res => setRoom(res.data));
}, [user.student_id, user.id]);

 const fetchLatestUserData = async () => {
 try {
 const res = await axios.get(`${API_BASE}/get_student.php?id=${user.student_id || user.id}`);
 if (isSuccess(res)) {
 const updatedUser = {...user, ...res.data.student};
 localStorage.setItem('user', JSON.stringify(updatedUser));
 setUser(updatedUser);
}
} catch (err) {console.error("Sync failure:", err);}
};

 const handleUpdate = async (e) => {
 e.preventDefault();
 if (editData.phone && editData.phone.length !== 10) return toast.error("Phone number must be 10 digits");
 const loadingToast = toast.loading("Saving your changes...");
 try {
 const res = await axios.post(`${API_BASE}/update_student_profile.php`, {student_id: user.student_id || user.id, ...editData});
 toast.dismiss(loadingToast);
 if (isSuccess(res)) {toast.success("Profile updated."); setIsEditing(false); fetchLatestUserData();}
 else toast.error(res.data.message ||"Failed to update.");
} catch (err) {toast.dismiss(loadingToast); toast.error("Connection failed.");}
};

 return (
 <div className="space-y-8 pb-12 animate-in fade-in duration-500 w-full">
 <BackgroundEffect />

 {/* 1. IDENTITY HEADER */}
 <section className="flex flex-col md:flex-row items-center gap-8 py-6 border-b border-slate-100">
 <div className="relative">
 <div className="w-32 h-32 rounded-3xl bg-slate-100 p-1 border border-slate-200 shadow-xl overflow-hidden group">
 <div className="w-full h-full rounded-[1.25rem] bg-white flex items-center justify-center relative overflow-hidden">
 <Icons.UserCircle size={80} strokeWidth={1} className="text-slate-300"/>
 <motion.div animate={{top: ['-100%','100%']}} transition={{duration: 3, repeat: Infinity, ease:"linear"}} className="absolute left-0 right-0 h-0.5 bg-blue-500/20 blur-sm z-20"/>
 </div>
 </div>
 <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1.5 rounded-lg border-2 border-white shadow-lg"><Icons.ShieldCheck size={14} className="text-white"/></div>
 </div>

 <div className="flex-1 text-center md:text-left space-y-3">
 <div className="flex flex-wrap justify-center md:justify-start gap-2">
 <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">My Personal Info</span>
 <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${user.account_status ==='ACTIVE'?'bg-emerald-500/10 text-emerald-500 border-emerald-500/20':'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>Account {user.account_status ==='ACTIVE'?'Active':'Pending'}</span>
 </div>
 <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">{user.name}</h1>
 <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Student Resident • Hostel Management • Group 15</p>
 </div>

 {!isEditing && <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg hover:scale-105 transition-all flex items-center gap-2"><Icons.Pencil size={14} /> Edit Profile</button>}
 </section>

 {/* 2. DATA NODES */}
 <AnimatePresence mode="wait">
 {!isEditing ? (
 <motion.div key="view"initial={{opacity: 0}} animate={{opacity: 1}} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <InfoNode icon={Icons.GraduationCap} label="Department"value={user.department} color="blue"className="p-5 bg-white/40 backdrop-blur-2xl rounded-2xl border border-slate-200"/>
 <InfoNode icon={Icons.Clock} label="Year of Study"value={`Year ${user.year}`} color="teal"className="p-5 bg-white/40 backdrop-blur-2xl rounded-2xl border border-slate-200"/>
 <InfoNode icon={Icons.Phone} label="Phone Number"value={user.phone ||'Not Set'} color="indigo"className="p-5 bg-white/40 backdrop-blur-2xl rounded-2xl border border-slate-200"/>
 <InfoNode icon={Icons.Hash} label="Student ID"value={user.reg_no} color="slate"className="p-5 bg-white/40 backdrop-blur-2xl rounded-2xl border border-slate-200"/>
 </motion.div>
 ) : (
 <motion.form key="edit"initial={{opacity: 0, scale: 0.99}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0}} onSubmit={handleUpdate} className="space-y-6">
 <GlassCard>
 <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
 <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Update Info.</h3>
 <button type="button"onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-900 transition-all"><Icons.X size={20} /></button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <InputGroup label="Full Name"value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} icon={Icons.User} autoComplete="name"/>
 <InputGroup label="Phone Number"value={editData.phone} onChange={(e) => {const val = e.target.value.replace(/\D/g,''); if (val.length <= 10) setEditData({...editData, phone: val});}} icon={Icons.Phone} autoComplete="tel"/>
 <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Department</label><select value={editData.department} onChange={(e) => setEditData({...editData, department: e.target.value})} className="w-full p-4 bg-white border border-slate-200 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-xs">{['CSE','ECE','EEE','MECH','CIVIL','IT'].map(d => <option key={d} value={d}>{d}</option>)}</select></div>
 <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Year of Study</label><select value={editData.year} onChange={(e) => setEditData({...editData, year: e.target.value})} className="w-full p-4 bg-white border border-slate-200 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-xs">{[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}</select></div>
 </div>
 <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-slate-100"><button type="button"onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-lg font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-slate-900">Cancel</button><button type="submit"className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg flex items-center gap-2"><Icons.CheckCircle2 size={14} className="text-blue-500"/> Save Changes</button></div>
 </GlassCard>
 </motion.form>
 )}
 </AnimatePresence>

 {/* 3. RESIDENTIAL BOX */}
 <div className="min-h-[100px]">
 {room && room.room_number ? (
 <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} onClick={() => navigate('/student/book')} className="cursor-pointer group bg-slate-50 p-6 rounded-[2rem] border border-slate-200 flex items-center justify-between gap-6 hover:border-blue-500/30 transition-all">
 <div className="flex items-center gap-6"><div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 border border-blue-600/20 group-hover:scale-110 transition-transform"><Icons.BedDouble size={32} /></div><div><p className="text-[9px] font-black uppercase tracking-widest text-blue-500">My Room Info</p><h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Room {room.room_number}</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Block {room.block} • Standard Room</p></div></div>
 <Icons.ArrowUpRight size={24} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"/>
 </motion.div>
 ) : <div className="h-[100px] flex items-center justify-center border border-dashed border-slate-200 rounded-[2rem] opacity-40"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Loading your room info...</p></div>}
 </div>
 </div>
 );
};

const InputGroup = ({label, value, onChange, icon: Icon, autoComplete}) => (
 <div className="space-y-2">
 <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
 <div className="relative group"><Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"size={16} /><input type="text"value={value} onChange={onChange} required autoComplete={autoComplete} className="w-full p-4 pl-12 bg-white border border-slate-200 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-xs"/></div>
 </div>
);

export default Profile;

