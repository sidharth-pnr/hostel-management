import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from '../../components/Icons';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { studentService, adminService } from '../../services/api';
import { GlassBox, StatusBadge, Input, Select, PrimaryButton } from '../../components/SharedUI';

const BookRoom = () => {
  const { user, setIsHeaderVisible } = useOutletContext();
  const navigate = useNavigate();
  const [availableRooms, setAvailableRooms] = useState([]);
  const [studentStatus, setStudentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomForApply, setSelectedRoomForApply] = useState(null);
  const [requestReason, setRequestReason] = useState('');

  const studentId = user?.student_id || user?.id;

  // Hide header when booking modal is open
  useEffect(() => {
    if (selectedRoomForApply) {
      setIsHeaderVisible(false);
    } else {
      setIsHeaderVisible(true);
    }
    return () => setIsHeaderVisible(true);
  }, [selectedRoomForApply, setIsHeaderVisible]);

  const fetchData = async () => {
    if (!studentId) return;
    try {
      const [roomsRes, statusRes] = await Promise.all([
        adminService.getRooms(),
        studentService.getRoomInfo(studentId)
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
      const matchesBlock = selectedBlock === 'All' || blockStr.toUpperCase() === selectedBlock.toUpperCase();
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
      await studentService.bookRoom({ room_id: selectedRoomForApply.room_id, reason: requestReason }, user);
      toast.dismiss(loadingToast);
      toast.success("Request submitted successfully.");
      setSelectedRoomForApply(null);
      setRequestReason('');
      fetchData();
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

  if (!isLoading && studentStatus?.status === 'REQUESTED') return (
    <div className="flex items-center justify-center py-20 animate-in fade-in duration-700">
      <GlassBox className="max-w-md w-full p-12 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-slate-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
          <Icons.Clock size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Request in Review</h3>
        <p className="text-slate-500 font-medium mb-8">
          Your request for Room {studentStatus.room_number} is currently being processed by the Warden.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-slate-100 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100">
          Status: Pending Review
        </div>
      </GlassBox>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700">
      
      {/* Notifications Section */}
      <AnimatePresence>
        {studentStatus?.room_rejection_note && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8">
            <GlassBox className="p-8 border-red-100 bg-red-50/30">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Icons.XCircle size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-lg font-bold text-slate-800">Request Rejected</h4>
                  <p className="text-slate-500 font-medium mt-1">"{studentStatus.room_rejection_note}"</p>
                </div>
                <button 
                  onClick={() => handleAction('dismiss_rejection')} 
                  className="px-6 py-3 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest"
                >
                  Dismiss
                </button>
              </div>
            </GlassBox>
          </motion.div>
        )}

        {studentStatus?.status === 'SUGGESTED' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8">
            <GlassBox className="p-8 border-blue-100 bg-slate-100/30">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-slate-200 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Icons.Sparkles size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-lg font-bold text-slate-800">New Suggestion</h4>
                  <p className="text-slate-500 font-medium mt-1">The Warden has suggested Room {studentStatus.room_number} for you.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleAction('reject_request', { rejection_note: 'Student declined suggestion' })}
                    className="px-6 py-3 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest"
                  >
                    Decline
                  </button>
                  <button 
                    onClick={() => {
                      const lt = toast.loading("Processing...");
                      adminService.adminAction({ action: 'accept_suggestion', student_id: studentId, room_id: studentStatus.room_id }, user)
                        .then(() => { toast.dismiss(lt); toast.success("Move confirmed!"); fetchData(); })
                        .catch(err => { toast.dismiss(lt); toast.error(err.message); });
                    }}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-slate-900/20"
                  >
                    Accept & Move
                  </button>
                </div>
              </div>
            </GlassBox>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative group">
          <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by room or block..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/50 border border-white/80 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {blocks.map(block => (
            <button
              key={block}
              onClick={() => setSelectedBlock(block)}
              className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                selectedBlock === block
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white/50 text-slate-500 border-white/80 hover:bg-white'
              }`}
            >
              {block === 'All' ? 'All Rooms' : `Block ${block}`}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="min-h-[40vh]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <Icons.Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
            <p className="text-xs font-bold uppercase tracking-[0.3em]">Checking availability...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredRooms.length > 0 ? filteredRooms.map((r) => (
                <motion.div key={r.room_id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <GlassBox className="flex flex-col h-full group">
                    <div className="p-8 flex-1">
                      <div className="flex justify-between items-start mb-8">
                        <div className="w-12 h-12 bg-slate-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icons.BedDouble size={24} />
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rate</span>
                          <span className="text-lg font-bold text-slate-800">CASH {r.price}</span>
                        </div>
                      </div>

                      <div className="space-y-1 mb-8">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Block {r.block}</p>
                        <h4 className="text-4xl font-black text-slate-800 tracking-tight">Room {r.room_number}</h4>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Occupancy</span>
                          <span className="text-xs font-bold text-slate-800">{r.current_occupancy} / {r.capacity}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${(r.current_occupancy / r.capacity) * 100}%` }} 
                            className={`h-full rounded-full ${r.current_occupancy >= r.capacity ? 'bg-slate-400' : 'bg-slate-900'}`} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedRoomForApply(r)}
                      disabled={user?.account_status === 'PENDING' || r.current_occupancy >= r.capacity}
                      className={`w-full py-6 text-xs font-bold uppercase tracking-widest border-t border-white/40 transition-all ${
                        r.current_occupancy >= r.capacity
                          ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                          : 'bg-white/40 text-blue-600 hover:bg-slate-900 hover:text-white group-hover:border-slate-900'
                      }`}
                    >
                      {r.current_occupancy >= r.capacity ? "Room Full" : (studentStatus?.status === 'ALLOCATED' ? "Request Change" : "Book Now")}
                    </button>
                  </GlassBox>
                </motion.div>
              )) : (
                <div className="col-span-full py-20 text-center flex flex-col items-center opacity-40">
                  <Icons.Search size={48} className="mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">No matching rooms found</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedRoomForApply && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-slate-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icons.Home size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {studentStatus?.status === 'ALLOCATED' ? "Relocation Request" : "Room Booking"}
                </h3>
                <p className="text-slate-500 font-medium">Finalize your selection for Room {selectedRoomForApply.room_number}</p>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Semester Rate</p>
                    <p className="text-2xl font-bold text-blue-600 tracking-tight">CASH {selectedRoomForApply.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Block</p>
                    <p className="text-lg font-bold text-slate-800">{selectedRoomForApply.block}</p>
                  </div>
                </div>

                {studentStatus?.status === 'ALLOCATED' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Reason for Relocation</label>
                    <textarea 
                      value={requestReason} 
                      onChange={(e) => setRequestReason(e.target.value)} 
                      placeholder="Why do you want to change rooms?"
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all resize-none"
                      rows="3"
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <button onClick={() => setSelectedRoomForApply(null)} className="flex-1 py-4 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">
                    Cancel
                  </button>
                  <PrimaryButton className="flex-[2]" onClick={requestRoom} icon={Icons.Send}>
                    Submit Request
                  </PrimaryButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-12 text-center opacity-30">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-500">Accommodation Service • Official Protocol</p>
      </footer>
    </div>
  );
};

export default BookRoom;
