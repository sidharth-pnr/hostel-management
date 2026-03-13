import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Users, 
  MapPin, 
  ArrowRight, 
  Building2, 
  LayoutGrid, 
  ShieldCheck, 
  Timer, 
  Zap, 
  Search, 
  Filter, 
  ArrowRightLeft,
  Box,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BedDouble,
  FileText,
  XCircle,
  MessageSquare,
  ShieldAlert,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config';
import BackgroundEffect from '../../components/BackgroundEffect';

const BookRoom = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [availableRooms, setAvailableRooms] = useState([]);
  const [studentStatus, setStudentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection/Application state
  const [selectedRoomForApply, setSelectedRoomForApply] = useState(null);
  const [requestReason, setRequestReason] = useState('');

  const studentId = user?.student_id || user?.id;

  const fetchData = async () => {
    if (!studentId) return;
    try {
      const [roomsRes, statusRes] = await Promise.all([
        axios.get(`${API_BASE}/book_room.php`),
        axios.get(`${API_BASE}/student_room.php?id=${studentId}`)
      ]);
      setAvailableRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
      setStudentStatus(statusRes.data || null);
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
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
      const currentSelectedBlock = String(selectedBlock).trim();
      const matchesBlock = currentSelectedBlock === 'All' || blockStr.toUpperCase() === currentSelectedBlock.toUpperCase();
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchLower || 
                           String(r.room_number).toLowerCase().includes(searchLower) || 
                           blockStr.toLowerCase().includes(searchLower);
      return matchesBlock && matchesSearch;
    });
  }, [availableRooms, selectedBlock, searchQuery]);

  const requestRoom = async () => {
    if (!selectedRoomForApply || !studentId) {
      return toast.error("User identity not found. Please log in again.");
    }
    
    // Only require reason if they already have a room (changing room)
    if (studentStatus?.room_id && !requestReason.trim()) {
      return toast.error("Please provide a reason for changing your room.");
    }

    const loadingToast = toast.loading("Submitting your request...");
    try {
      const res = await axios.post(`${API_BASE}/book_room.php`, { 
        student_id: studentId, 
        room_id: selectedRoomForApply.room_id,
        reason: requestReason
      });
      toast.dismiss(loadingToast);
      if (res.data.status === 'Success') {
        toast.success("Request submitted successfully.");
        setSelectedRoomForApply(null);
        setRequestReason('');
        fetchData();
      } else {
        toast.error(res.data.error || "Server failed to process request");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Network error: Could not reach the server.");
    }
  };

  const handleDismissRejection = async () => {
    try {
      await axios.post(`${API_BASE}/admin_action.php`, { 
        action: 'dismiss_rejection', 
        student_id: studentId 
      });
      fetchData();
    } catch (err) {
      toast.error("Failed to dismiss notice");
    }
  };

  const slideUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.6 } } };

  // 1. Pending Request View
  if (!isLoading && studentStatus?.status === 'PENDING') return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-[40px] border border-slate-200 dark:border-white/10 rounded-[3.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0" />
        <div className="relative z-10 space-y-10">
          <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto relative">
            <Timer size={48} className="text-amber-500 animate-pulse" />
            <div className="absolute -inset-4 border border-amber-500/20 rounded-full animate-ping opacity-20" />
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Request<br />In Review.</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 max-w-md mx-auto">Your request for Room {studentStatus.requested_room_id} is being checked by the warden.</p>
          </div>
          
          {studentStatus.room_request_reason && (
            <div className="bg-slate-50/50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5 text-left max-w-lg mx-auto">
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Your Reason</p>
               <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic">"{studentStatus.room_request_reason}"</p>
            </div>
          )}

          <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest">
            <ShieldAlert size={16} />
            Waiting for Warden
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      <div className="space-y-12 animate-in fade-in duration-700">
        <BackgroundEffect />
        
        {/* HERO SECTION */}
        <section className="relative flex flex-col items-center text-center pt-10 pb-16">
          <motion.div variants={slideUp} initial="hidden" animate="show" className="space-y-8 w-full max-w-6xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm mx-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Room Selection</span>
            </div>
            
            <div className="space-y-4">
               <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                Find a Room.<br />
                <span className="text-slate-400 dark:text-slate-500 italic lowercase opacity-80">Choose where you want to stay.</span>
               </h1>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 opacity-60">Hostel Allocation System • Group 15</p>
            </div>

            <div className="flex flex-wrap justify-center gap-10">
               <HeroStat label="Available Rooms" value={availableRooms.length} color="text-blue-500" />
               <HeroStat label="Hostel Blocks" value={blocks.length - 1} color="text-teal-500" />
               <HeroStat label="System Status" value="Online" color="text-emerald-500" />
            </div>
          </motion.div>
        </section>

        {/* REJECTION FEEDBACK */}
        {studentStatus?.room_rejection_note && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-5xl mx-auto bg-red-500/10 border border-red-500/20 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert size={150} className="text-red-500" /></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
               <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl rotate-3"><ShieldAlert size={40} /></div>
               <div className="space-y-3 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Notice from Warden</p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Request Rejected.</h3>
                  <div className="mt-4 bg-white/40 dark:bg-slate-950/40 p-6 rounded-3xl border border-red-500/10 backdrop-blur-md">
                     <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed">
                        "Reason: {studentStatus.room_rejection_note}"
                     </p>
                  </div>
               </div>
               <button 
                 onClick={handleDismissRejection}
                 className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all active:scale-95"
               >
                 Dismiss
               </button>
            </div>
          </motion.div>
        )}

        {/* ADMIN SUGGESTION SECTION */}
        {studentStatus?.suggested_room_id && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-5xl mx-auto bg-blue-500/10 border border-blue-500/20 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10"><Zap size={150} className="text-blue-500" /></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
               <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl rotate-3"><Building2 size={40} /></div>
               <div className="space-y-3 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Official Suggestion</p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">New Room Available.</h3>
                  <div className="mt-4 bg-white/40 dark:bg-slate-950/40 p-6 rounded-3xl border border-red-500/10 backdrop-blur-md">
                     <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed uppercase tracking-widest">
                        The Warden suggests you move to Room {studentStatus.suggested_room_number || studentStatus.suggested_room_id}.
                     </p>
                  </div>
               </div>
               <div className="flex flex-col sm:flex-row gap-4">
                 <button 
                   onClick={() => axios.post(`${API_BASE}/admin_action.php`, { action: 'reject_request', student_id: studentId, rejection_note: '' }).then(() => fetchData())}
                   className="px-8 py-5 text-slate-500 hover:text-red-500 font-black uppercase text-[10px] tracking-widest transition-colors"
                 >
                   Decline
                 </button>
                 <button 
                   onClick={() => {
                     const loadingToast = toast.loading("Processing relocation...");
                     axios.post(`${API_BASE}/admin_action.php`, { 
                       action: 'accept_suggestion', 
                       student_id: studentId, 
                       room_id: studentStatus.suggested_room_id 
                     }).then((res) => {
                       toast.dismiss(loadingToast);
                       if (res.data.status === 'Success') {
                         toast.success("Room relocation successful!");
                         fetchData();
                       } else {
                         toast.error(res.data.error || "Failed to process move");
                       }
                     }).catch(() => {
                       toast.dismiss(loadingToast);
                       toast.error("Network error");
                     });
                   }}
                   className="px-10 py-5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center gap-3"
                 >
                   <CheckCircle2 size={16} />
                   Accept & Move
                 </button>
               </div>
            </div>
          </motion.div>
        )}

        <div className="max-w-7xl mx-auto space-y-12 px-4 sm:px-6">
          {/* FILTERS & SEARCH */}
          <section className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 relative w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Search room number or block..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl py-5 pl-16 pr-6 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl p-2 rounded-2xl border border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar max-w-full shadow-sm">
              {blocks.map(block => (
                <button
                  key={block}
                  onClick={() => setSelectedBlock(block)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    String(selectedBlock) === String(block)
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {block === 'All' ? 'All Blocks' : `Block ${block}`}
                </button>
              ))}
            </div>
          </section>

          {/* GRID SECTION */}
          <div className="min-h-[40vh] relative">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <Loader2 size={40} className="animate-spin text-blue-500 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Checking rooms...</p>
              </div>
            ) : (
              <motion.div 
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredRooms.length > 0 ? filteredRooms.map((r) => (
                    <motion.div 
                      key={r.room_id}
                      layout
                      className="group"
                    >
                      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-blue-500/30 flex flex-col h-full">
                        <div className="p-8 md:p-10 flex-1 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <LayoutGrid size={120} />
                          </div>

                          <div className="flex justify-between items-start mb-10 relative z-10">
                            <div className="p-5 bg-blue-600/10 dark:bg-white/5 text-blue-600 dark:text-white rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-inner">
                              <BedDouble size={32} />
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20 shadow-sm">
                                CASH {r.price}
                              </span>
                              <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-500/20 shadow-sm">
                                {r.capacity - r.current_occupancy} Free Slots
                              </span>
                            </div>
                          </div>
                          
                          <div className="relative z-10 space-y-2 mb-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Room Number</p>
                            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">ROOM {r.room_number}</h3>
                            <div className="flex items-center gap-2 pt-2 text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                              <Building2 size={14} className="text-blue-500" />
                              <span>Block {r.block} • Standard Room</span>
                            </div>
                          </div>

                          <div className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5 relative z-10">
                            <div className="flex justify-between items-end">
                              <div className="space-y-1">
                                <span className="text-slate-400 font-black uppercase text-[9px] tracking-widest block">Room Occupancy</span>
                                <p className="font-black text-slate-900 dark:text-white text-base tracking-tight">{r.current_occupancy} / {r.capacity} OCCUPIED</p>
                              </div>
                              <span className="text-2xl font-black text-blue-500 tracking-tighter leading-none">
                                {((r.current_occupancy / r.capacity) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-white/5 h-2.5 rounded-full overflow-hidden shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(r.current_occupancy / r.capacity) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${r.current_occupancy >= r.capacity ? 'bg-slate-900 dark:bg-white' : 'bg-gradient-to-r from-blue-600 to-indigo-500'}`}
                              />
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => setSelectedRoomForApply(r)} 
                          disabled={user?.account_status === 'PENDING'}
                          className={`w-full py-8 font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all relative overflow-hidden group/btn ${
                            user?.account_status === 'PENDING' 
                            ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed opacity-50' 
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                          }`}
                        >
                          <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                          <span className="relative z-10">
                            {user?.account_status === 'PENDING' ? "Waiting for Approval" : (studentStatus?.room_id ? "Request Change" : "Book Room")}
                          </span>
                          {user?.account_status !== 'PENDING' && <ArrowRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform" />}
                        </button>
                      </div>
                    </motion.div>
                  )) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="col-span-full py-32 text-center bg-white/20 dark:bg-white/5 rounded-[4rem] border border-dashed border-slate-300 dark:border-white/10 shadow-inner"
                    >
                      <Box size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-8 animate-pulse" />
                      <div className="space-y-2">
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">No Rooms Found.</h3>
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">All rooms in Block {selectedBlock} are currently full.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>

        <footer className="pt-10 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Hostel Management • Group 15</p>
        </footer>
      </div>

      {/* --- ROOM REQUEST MODAL - Moved outside the animated wrapper to prevent clipping/white bar --- */}
      <AnimatePresence>
        {selectedRoomForApply && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-12 bg-slate-950/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="p-10 md:p-12 space-y-10">
                <div className="flex justify-between items-start">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Room Request</p>
                      <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                        {studentStatus?.room_id ? "Change Room." : "Book Room."}
                      </h3>
                   </div>
                   <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-600 font-black text-2xl tracking-tighter flex flex-col items-end">
                      <span>R-{selectedRoomForApply.room_number}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-1">CASH {selectedRoomForApply.price}</span>
                   </div>
                </div>

                <div className="space-y-6">
                   {/* Only show reason if they already have a room allocated */}
                   {studentStatus?.room_id ? (
                     <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                           <FileText size={14} />
                           Reason for Request
                        </label>
                        <textarea 
                          value={requestReason}
                          onChange={(e) => setRequestReason(e.target.value)}
                          placeholder="Please explain why you want to change to this room..."
                          className="w-full min-h-[180px] p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 rounded-3xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none placeholder:text-slate-400 shadow-sm"
                        />
                     </div>
                   ) : (
                     <div className="p-8 bg-blue-500/5 rounded-[2rem] border border-dashed border-blue-500/20 text-center space-y-2">
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Ready to book this room?</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Click below to submit your request to the warden.</p>
                     </div>
                   )}

                   <div className="flex items-center gap-4 bg-blue-500/5 p-5 rounded-2xl border border-blue-500/10">
                      <Info size={20} className="text-blue-500 shrink-0" />
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-wider">
                         Note: All requests must be approved by the warden.
                      </p>
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                     onClick={() => setSelectedRoomForApply(null)}
                     className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={requestRoom}
                     className="flex-[2] bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                   >
                     <ArrowUpRight size={18} />
                     Submit Request
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const HeroStat = ({ label, value, color }) => (
  <div className="flex flex-col items-center gap-1 group cursor-default">
     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</p>
     <p className={`text-2xl md:text-3xl font-black ${color} tracking-tighter leading-none`}>{value}</p>
  </div>
);

export default BookRoom;
