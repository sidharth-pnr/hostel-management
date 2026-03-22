import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/api';
import * as Icons from '../../components/Icons';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { isSuccess } from '../../config';
import BackgroundEffect from '../../components/BackgroundEffect';
import { GlassCard, InfoNode } from '../../components/student/StudentShared';

const StudentOverview = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('MPESA');
  const sid = user.student_id || user.id;

  // Use React Query for data synchronization
  const { data: room, refetch: refetchRoom } = useQuery({
    queryKey: ['student-room', sid],
    queryFn: async () => {
      const res = await studentService.getRoomInfo(sid);
      return res.data;
    },
    refetchInterval: 60000,
  });

  const { data: roommates = [] } = useQuery({
    queryKey: ['student-roommates', sid],
    queryFn: async () => {
      const res = await studentService.getRoommates(`${sid}&t=${Date.now()}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 60000,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['student-logs', sid],
    queryFn: async () => {
      const res = await studentService.getLogs(sid);
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 60000,
  });

  const handlePayment = async () => {
    const loadingToast = toast.loading(`Connecting to ${paymentMethod} gateway...`);
    try {
      const res = await studentService.processPayment({
        student_id: sid,
        room_id: room.room_id,
        payment_method: paymentMethod
      });
      toast.dismiss(loadingToast);
      if (isSuccess(res)) {
        toast.success("Payment Received! Room Allocated.");
        setShowPaymentModal(false);
        refetchRoom();
      } else {
        toast.error(res.data.error || "Payment failed");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Gateway connection error");
    }
  };

  const slideUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.6 } } };

  return (
    <>
      <div className="space-y-12 animate-in fade-in duration-700 pb-20">
        <BackgroundEffect />

        {/* 1. HERO IDENTITY SECTION */}
        <section className="relative min-h-[40vh] flex flex-col items-center justify-center text-center pt-24">
          <motion.div variants={slideUp} initial="hidden" animate="show" className="space-y-8 w-full max-w-6xl px-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm mx-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Student Dashboard</span>
            </div>
            
            <div className="space-y-4">
               <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
                Welcome Back,<br />
                <span className="text-slate-400 dark:text-slate-500 italic lowercase opacity-80">{(user?.name || "Student").split(' ')[0]}.</span>
               </h1>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 opacity-60">Session 2024-25 • Official Portal</p>
            </div>

            <div className="flex flex-wrap justify-center gap-10 pt-4">
               <HeroStat label="My Status" value={user?.account_status === 'ACTIVE' ? 'Active' : 'Pending'} color="text-emerald-500" />
               <HeroStat label="Room Status" value={room?.room_number && room?.status === 'ALLOCATED' ? 'Occupied' : room?.payment_status === 'PENDING' ? 'Approved' : 'No Room'} color="text-blue-500" />
               <HeroStat label="System" value="Stable" color="text-teal-500" />
            </div>
          </motion.div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* PAYMENT PENDING NOTICE */}
          {room?.payment_status === 'PENDING' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mb-12 bg-amber-500/10 border border-amber-500/20 rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10"><Icons.CreditCard size={150} className="text-amber-500" /></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
                 <div className="w-20 h-20 bg-amber-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl rotate-3"><Icons.Zap size={40} /></div>
                 <div className="space-y-3 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Action Required</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Payment Pending.</h3>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed uppercase tracking-widest">
                      Your request for Room {room.room_number} has been approved. Please complete the payment of CASH {room.price} to finalize allocation.
                    </p>
                 </div>
                 <button onClick={() => setShowPaymentModal(true)} className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center gap-3"><Icons.CreditCard size={16} /> Pay & Check-In</button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 2. IDENTITY CARD */}
            <motion.div variants={slideUp} initial="hidden" animate="show" className="lg:col-span-5">
              <GlassCard className="h-full">
                <div className="flex items-center justify-between mb-10">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">Student Info</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">My Profile.</h3>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10"><Icons.UserCircle size={32} className="text-slate-400" /></div>
                </div>
                <div className="grid gap-6 mb-10">
                  <InfoNode icon={Icons.User} label="Full Name" value={user?.name || "N/A"} />
                  <InfoNode icon={Icons.Hash} label="Student ID" value={user?.reg_no || "N/A"} />
                  <InfoNode icon={Icons.GraduationCap} label="Department" value={user?.department || "N/A"} />
                  <InfoNode icon={Icons.Calendar} label="Year of Study" value={user?.year ? `Year ${user.year}` : "N/A"} />
                  <InfoNode icon={Icons.Phone} label="Contact" value={user?.phone || 'N/A'} />
                </div>
                <button onClick={() => navigate('/student/profile')} className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"><Icons.Pencil size={14} className="text-blue-500" /> Update My Profile</button>
              </GlassCard>
            </motion.div>

            {/* 3. RESIDENCE STATUS */}
            <motion.div variants={slideUp} initial="hidden" animate="show" className="lg:col-span-7 space-y-8">
              <GlassCard className="group" p="p-0">
                <div className="p-8 sm:p-10 relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Icons.Building2 size={150} className="text-blue-500" /></div>
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">Accommodation</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Room Status.</h3>
                      </div>
                      {room && room.status === 'ALLOCATED' ? (
                        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest">Room Allocated</div>
                      ) : (
                        <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                          {room?.status === 'SUGGESTED' ? 'Relocation Offered' : room?.status === 'APPROVED' ? 'Approval Pending Payment' : room?.status === 'REQUESTED' ? 'Request Pending' : 'No Room Set'}
                        </div>
                      )}
                      </div>

                      {room && room.status === 'ALLOCATED' ? (
                      <div className="flex flex-col md:flex-row items-center gap-8">
                         <div className="w-full md:w-48 aspect-square bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center text-blue-600 border border-blue-600/20 shadow-inner group-hover:scale-105 transition-transform duration-700">
                            <div className="text-center"><p className="text-[10px] font-black uppercase tracking-widest opacity-60">Room</p><p className="text-6xl font-black tracking-tighter">{room.room_number}</p></div>
                         </div>
                         <div className="flex-1 space-y-4 text-center md:text-left">
                            <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Location</p><p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Block {room.block} • Standard Wing</p></div>
                            <div className="flex items-center justify-center md:justify-start gap-6 pt-4 flex-wrap">
                               <StatPill label="Beds" val={room.capacity} /><StatPill label="Stayers" val={room.current_occupancy} /><StatPill label="Rate" val={`CASH ${room.price}`} />
                               <button onClick={() => navigate('/student/book')} className="ml-auto md:ml-4 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"><Icons.ArrowRightLeft size={12} className="text-blue-500" /> Change My Room</button>
                            </div>
                         </div>
                      </div>
                      ) : (
                      <div className="py-12 text-center space-y-6">
                         <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto"><Icons.BedDouble size={32} className="text-slate-300" /></div>
                         <div className="space-y-2">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                              {room?.status === 'SUGGESTED' 
                                ? `The Warden has suggested Room ${room.room_number} for you.` 
                                : room?.status === 'APPROVED' 
                                  ? `Room ${room.room_number} approved! Proceed to payment.` 
                                  : room?.status === 'REQUESTED'
                                    ? `Your request for Room ${room.room_number} is in review.`
                                    : "You haven't booked a room yet."}
                            </p>
                            <button onClick={() => navigate('/student/book')} className="text-blue-500 font-black text-xs uppercase tracking-[0.3em] hover:tracking-[0.4em] transition-all flex items-center justify-center gap-2 mx-auto pt-2">
                              {room?.status === 'SUGGESTED' ? "View & Accept Suggestion" : room?.status === 'APPROVED' ? "Complete Payment" : "Find a Room Now"} <Icons.ArrowUpRight size={16} />
                            </button>
                         </div>
                      </div>
                      )}                  </div>
                </div>
              </GlassCard>

              {/* Roommates Section */}
              <GlassCard>
                <div className="flex items-center justify-between mb-8"><h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">My Roommates.</h4><Icons.Users size={20} className="text-slate-400" /></div>
                {roommates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {roommates.map((mate, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 group hover:border-blue-500/30 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-110 transition-transform">{mate.name.charAt(0)}</div>
                        <div><p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{mate.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{mate.department}</p></div>
                      </div>
                    ))}
                  </div>
                ) : <div className="py-8 text-center border border-dashed border-slate-200 dark:border-white/5 rounded-3xl"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{!room || !room.room_number ? "Assign a room to see roommates" : parseInt(room.capacity) === 1 ? "Single Occupancy Room" : "No roommates assigned yet"}</p></div>}
              </GlassCard>
            </motion.div>
          </div>

          {/* 4. ACTIVITY LOG */}
          <motion.div variants={slideUp} initial="hidden" animate="show" className="mt-8">
            <GlassCard>
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1"><p className="text-[9px] font-black uppercase tracking-widest text-blue-500">History</p><h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Recent Activity.</h3></div>
                <Icons.History size={24} className="text-slate-400" />
              </div>
              <div className="space-y-4">{activities.length > 0 ? activities.slice(0, 10).map((log, idx) => <ActivityItem key={idx} log={log} />) : <div className="py-10 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">No recent activity found</div>}</div>
            </GlassCard>
          </motion.div>
        </div>

        <footer className="pt-10 text-center opacity-30 px-4"><p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Official Student Portal • Hostel Management • Group 15</p></footer>
      </div>

      {/* --- PAYMENT MODAL --- */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
            >
              <div className="p-6 sm:p-8 overflow-y-auto scrollbar-hide space-y-8">
                <div className="text-center space-y-3"><div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto"><Icons.ShieldCheck size={32} /></div><h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Checkout.</h3><p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Secure Payment Portal</p></div>
                <div className="space-y-3 bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/5"><div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Allocated Block</span><span className="font-black text-slate-900 dark:text-white uppercase text-sm">Room {room.room_number}</span></div><div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Due</span><span className="text-xl font-black text-blue-500 tracking-tighter">CASH {room.price}</span></div></div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Gateway</p>
                  <div className="grid grid-cols-1 gap-2"><PaymentOption active={paymentMethod === 'MPESA'} onClick={() => setPaymentMethod('MPESA')} icon={Icons.Smartphone} label="UPI / Mobile Money" desc="Instant Mobile Payments" /><PaymentOption active={paymentMethod === 'CARD'} onClick={() => setPaymentMethod('CARD')} icon={Icons.Globe} label="Card Payment" desc="Credit or Debit Card" /><PaymentOption active={paymentMethod === 'BANK'} onClick={() => setPaymentMethod('BANK')} icon={Icons.Wallet} label="Bank Transfer" desc="net banking or mobile banking" /></div>
                </div>
                <div className="space-y-3 pt-2">
                  <button onClick={handlePayment} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">Confirm Payment</button>
                  <button onClick={() => setShowPaymentModal(false)} className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel Transaction</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const PaymentOption = ({ active, onClick, icon: Icon, label, desc }) => (
  <button onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${active ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10' : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'}`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}><Icon size={16} /></div>
    <div className="flex-1"><p className={`text-[10px] font-black uppercase tracking-tight ${active ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{label}</p><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p></div>
    {active && <Icons.CheckCircle2 size={14} className="text-blue-500" />}
  </button>
);

const ActivityItem = ({ log }) => (
  <div className="flex items-center gap-6 p-5 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 group hover:border-blue-500/30 transition-all">
    <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Icons.Activity size={20} /></div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate">{log.message}</p>
      <div className="flex items-center gap-3 mt-1"><span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">{log.performed_by}</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Icons.Clock size={10} />{new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
    </div>
  </div>
);

const HeroStat = ({ label, value, color }) => (
  <div className="flex flex-col items-center gap-1 group cursor-default">
     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</p>
     <p className={`text-2xl sm:text-3xl font-black ${color} tracking-tighter leading-none uppercase`}>{value}</p>
  </div>
);

const StatPill = ({ label, val }) => (
  <div className="flex flex-col items-center md:items-start gap-1">
     <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
     <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter leading-none">{val}</p>
  </div>
);

export default StudentOverview;
