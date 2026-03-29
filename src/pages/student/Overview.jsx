import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/api';
import * as Icons from '../../components/Icons';
import { useOutletContext, useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { GlassBox, StatusBadge } from '../../components/SharedUI';

const StudentOverview = () => {
  const { user, setIsHeaderVisible } = useOutletContext();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  
  const sid = user?.student_id || user?.id;

  // Hide header when modals are open
  useEffect(() => {
    if (showPaymentModal || showSuccessModal) {
      setIsHeaderVisible(false);
    } else {
      setIsHeaderVisible(true);
    }
    
    // Cleanup on unmount
    return () => setIsHeaderVisible(true);
  }, [showPaymentModal, showSuccessModal, setIsHeaderVisible]);

  const paymentOptions = [
    { id: 'UPI', label: 'UPI / PhonePe', icon: Icons.Zap },
    { id: 'CARD', label: 'Debit / Credit Card', icon: Icons.CreditCard },
    { id: 'NETBANKING', label: 'Net Banking', icon: Icons.Building2 },
    { id: 'MPESA', label: 'Other', icon: Icons.Smartphone },
  ];

  // Data fetching
  const { data: room, refetch: refetchRoom } = useQuery({
    queryKey: ['student-room', sid],
    queryFn: async () => {
      const res = await studentService.getRoomInfo(sid);
      return res.data;
    },
    enabled: !!sid,
  });

  const { data: roommates = [] } = useQuery({
    queryKey: ['student-roommates', sid],
    queryFn: async () => {
      const res = await studentService.getRoommates(sid);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!sid,
  });

  const { data: complaints = [] } = useQuery({
    queryKey: ['student-complaints', sid],
    queryFn: async () => {
      const res = await studentService.getComplaints(sid);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!sid,
  });

  const activeComplaint = complaints.find(c => ['PENDING', 'IN_PROGRESS'].includes(c.status));

  const handlePayment = async () => {
    if (!sid || !room?.room_id) return toast.error("Missing session data");
    
    const loadingToast = toast.loading(`Connecting to ${paymentMethod} gateway...`);
    try {
      await studentService.processPayment({
        room_id: room.room_id,
        payment_method: paymentMethod
      }, user);
      
      toast.dismiss(loadingToast);
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      refetchRoom();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Payment failed");
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      
      {/* PAYMENT PENDING NOTICE */}
      {room?.payment_status === 'PENDING' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-emerald-600 text-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-emerald-900/20"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10"><Icons.CreditCard size={150} /></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
              <Icons.Zap size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold tracking-tight">Payment Required</h3>
              <p className="text-emerald-50 font-medium mt-1">
                Your request for Room {room.room_number || room.approved_room_number} is approved. Pay CASH {room.price || room.approved_room_price} to finalize.
              </p>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-8 py-4 bg-white text-emerald-700 rounded-2xl text-sm font-bold shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
            >
              <Icons.CreditCard size={18} /> Pay Now
            </button>
          </div>
        </motion.div>
      )}
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-5 auto-rows-min w-full">
        
        {/* Bento 1: Welcome Banner (Large) */}
        <GlassBox className="md:col-span-3 md:row-span-1 p-8 flex flex-col justify-center relative bg-gradient-to-br from-slate-900/5 to-teal-500/5">
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-slate-900/10 to-transparent pointer-events-none"></div>
          <h3 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, {user?.name?.split(' ')[0]}</h3>
          <p className="text-slate-500 font-medium">Your account status is currently <span className="text-blue-600 font-bold">{user?.account_status}</span> for the 2024 session.</p>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <span className="inline-flex items-center bg-green-100/80 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-green-200">
              <Icons.CheckCircle size={16} className="mr-1.5" /> 
              {user?.account_status === 'ACTIVE' ? 'Verified' : 'Under Review'}
            </span>
            <span className="inline-flex items-center bg-white/80 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-bold border border-white shadow-sm">
              Reg: {user?.reg_no}
            </span>
          </div>
        </GlassBox>

        {/* Bento 2: Quick Action (Square) */}
        <GlassBox 
          className="md:col-span-1 md:row-span-1 p-6 flex flex-col items-center justify-center text-center group" 
          onClick={() => navigate('/student/complaints')}
        >
          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-slate-900/20 group-hover:scale-110 transition-transform">
            <Icons.Plus size={24} />
          </div>
          <h4 className="text-lg font-bold text-slate-800">New Ticket</h4>
          <p className="text-xs text-slate-500 font-medium mt-1">Maintenance & Support</p>
        </GlassBox>

        {/* Bento 3: Room Info (Square/Vertical) */}
        <GlassBox className="md:col-span-1 md:row-span-2 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-800 flex items-center">
              <Icons.MapPin size={18} className="mr-2 text-blue-600" /> Allocation
            </h4>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
            {room && room.status === 'ALLOCATED' ? (
              <>
                <div className="w-20 h-20 bg-slate-100 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                  <Icons.Building size={32} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Block</p>
                  <p className="text-xl font-bold text-slate-800">{room.block}</p>
                </div>
                <div className="w-full h-px bg-slate-200/60"></div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Room</p>
                  <p className="text-3xl font-black text-blue-600">{room.room_number}</p>
                </div>
              </>
            ) : (
              <div className="py-10">
                <Icons.BedDouble size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Active Room</p>
                <button 
                  onClick={() => navigate('/student/book')}
                  className="mt-4 text-blue-600 text-xs font-bold uppercase tracking-widest hover:underline"
                >
                  Book Now
                </button>
              </div>
            )}
          </div>
        </GlassBox>

        {/* Bento 5: Roommates (Square/Vertical) */}
        <GlassBox className="md:col-span-1 md:row-span-2 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-800 flex items-center">
              <Icons.Users size={18} className="mr-2 text-blue-600" /> Roommates
            </h4>
          </div>
          
          <div className="flex-1 space-y-4">
            {roommates.length > 0 ? (
              roommates.map((mate, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-white/80">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {mate.name?.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 truncate">{mate.name}</p>
                    <p className="text-[10px] text-slate-500 truncate uppercase">{mate.department}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                <Icons.Users size={32} className="mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No roommates</p>
              </div>
            )}
          </div>
        </GlassBox>

        {/* Bento 4: Recent Activities (Wide) */}
        <GlassBox className="md:col-span-2 md:row-span-2 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-800 flex items-center">
              <Icons.MessageSquareWarning size={18} className="mr-2 text-blue-600" /> Recent Requests
            </h4>
            <button 
              className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center" 
              onClick={() => navigate('/student/complaints')}
            >
              View All <Icons.ChevronRight size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-3">
            {complaints.length > 0 ? (
              complaints.slice(0, 3).map((complaint) => (
                <div key={complaint.complaint_id} className="bg-white/50 border border-white/60 p-4 rounded-2xl flex items-center justify-between hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {complaint.status === 'RESOLVED' ? <Icons.CheckCircle size={18} /> : <Icons.Clock size={18} />}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm truncate max-w-[150px] sm:max-w-xs">{complaint.title}</h5>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">#{complaint.complaint_id} • {complaint.created_at}</p>
                    </div>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-10">
                <Icons.ClipboardList size={40} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">No recent complaints</p>
              </div>
            )}
          </div>
        </GlassBox>

      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden p-8 border border-white"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <Icons.CreditCard size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Payment Checkout</h3>
                <p className="text-slate-500 font-medium">Select your preferred payment method</p>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Amount</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">CASH {room.price}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Room No.</span>
                  <span className="text-lg font-bold text-blue-600">{room.room_number || room.approved_room_number}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {paymentOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center group ${
                      paymentMethod === opt.id 
                        ? 'border-blue-600 bg-blue-50/50 text-blue-600' 
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <opt.icon size={20} className={paymentMethod === opt.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{opt.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handlePayment} 
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 hover:bg-slate-950 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Confirm & Pay <Icons.ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => setShowPaymentModal(false)} 
                  className="w-full py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                >
                  Cancel and go back
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden p-10 text-center border border-white"
            >
              <div className="relative mb-8">
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                  className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"
                >
                  <Icons.CheckCircle2 size={48} />
                </motion.div>
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping scale-75 opacity-20"></div>
              </div>

              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Payment Confirmed!</h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                Your transaction via <span className="text-slate-900 font-bold">{paymentMethod}</span> was successful. Room <span className="text-emerald-600 font-bold">{room.room_number}</span> is now officially allocated to you.
              </p>

              <button 
                onClick={() => setShowSuccessModal(false)} 
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95"
              >
                Return to Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-12 text-center opacity-30">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-500">Official Student Portal • Hostel Management</p>
      </footer>
    </div>
  );
};

export default StudentOverview;
