import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from '../../components/Icons';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';
import { API_BASE } from '../../config';
import { StatCard, LoadingScreen, EmptyState, FilterMenu, ActionButton } from '../../components/admin/AdminShared';

const Students = () => {
  const { user } = useOutletContext() || {};
  const [students, setStudents] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDept, setFilterDept] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Rejection Modal State
  const [rejectingStudent, setRejectingStudent] = useState(null);
  const [rejectionNote, setRejectionNote] = useState('');

  const fetchData = async () => {
    try {
      const [studentsRes, roomsRes] = await Promise.all([
        axios.get(`${API_BASE}/get_data.php?type=students`),
        axios.get(`${API_BASE}/book_room.php`)
      ]);
      const studentData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      setStudents(studentData);
      setAvailableRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
    } catch (err) {
      toast.error("Failed to sync resident data");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRoomAction = async (action, student_id, room_id = null, suggested_room_id = null, note = '') => {
    const loadingToast = toast.loading("Updating status...");
    try {
      const payload = { 
        action, 
        student_id, 
        admin_name: user?.name,
        rejection_note: note
      };
      if (room_id) payload.room_id = room_id;
      if (suggested_room_id) payload.suggested_room_id = suggested_room_id;
      
      const res = await axios.post(`${API_BASE}/admin_action.php`, payload);
      toast.dismiss(loadingToast);
      
      if (res.data.status === 'Success') {
        toast.success(res.data.message || "Operation successful");
        setRejectingStudent(null);
        setRejectionNote('');
        fetchData();
      } else {
        toast.error(res.data.error || 'Operation failed');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Connection error");
    }
  };

  // --- DERIVED DATA & ANALYTICS ---
  const stats = useMemo(() => {
    const activeStudents = students.filter(s => s.account_status === 'ACTIVE');
    const total = activeStudents.length;
    const allocated = activeStudents.filter(s => s.room_request_status === 'ALLOCATED').length;
    const pending = activeStudents.filter(s => ['PENDING_INITIAL', 'PENDING_CHANGE', 'SUGGESTED'].includes(s.room_request_status)).length;
    const depts = [...new Set(activeStudents.map(s => s.department))].filter(Boolean).sort();
    return { 
      total, 
      allocated, 
      pending, 
      depts, 
      occupancyPercent: total > 0 ? Math.round((allocated / total) * 100) : 0 
    };
  }, [students]);

  const processedStudents = useMemo(() => {
    const query = search.toLowerCase();
    return students
      .filter(s => s.account_status === 'ACTIVE')
      .filter(s => {
        const studentName = (s.name || "").toLowerCase();
        const studentReg = (s.reg_no || "").toLowerCase();
        const matchesSearch = studentName.includes(query) || studentReg.includes(query);
        
        const matchesStatus = filterStatus === 'ALL' || 
          (filterStatus === 'ALLOCATED' && s.room_request_status === 'ALLOCATED') || 
          (filterStatus === 'PENDING' && ['PENDING_INITIAL', 'PENDING_CHANGE', 'SUGGESTED'].includes(s.room_request_status)) || 
          (filterStatus === 'NONE' && s.room_request_status === 'NONE');
          
        const matchesDept = filterDept === 'ALL' || s.department === filterDept;
        
        return matchesSearch && matchesStatus && matchesDept;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return (a.name || "").localeCompare(b.name || "");
        if (sortBy === 'reg_no') return (a.reg_no || "").localeCompare(b.reg_no || "");
        if (sortBy === 'department') return (a.department || "").localeCompare(b.department || "");
        return 0;
      });
  }, [students, search, sortBy, filterStatus, filterDept]);

  if (loading) return <LoadingScreen message="Scanning Scholar Directory..." />;

  return (
    <>
      <div className="space-y-8 animate-slide-up relative">
        
        {/* 1. PULSE ANALYTICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Icons.Users} label="Resident Population" value={stats.total} color="blue" />
          <StatCard icon={Icons.UserCheck} label="Room Assignment" value={`${stats.occupancyPercent}%`} subValue={`${stats.allocated} Active`} color="teal" progress={stats.occupancyPercent} />
          <StatCard icon={Icons.Building2} label="Pending Requests" value={stats.pending} subValue="Needs Action" color="orange" />
          <StatCard icon={Icons.GraduationCap} label="Faculties" value={stats.depts.length} subValue="Departments" color="red" />
        </div>

        {/* 2. ADVANCED TOOLBAR */}
        <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center">
          <div className="relative flex-1 group">
            <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={20}/>
            <input 
              placeholder="Search by name or registration ID..." 
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all text-slate-900 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <FilterMenu icon={Icons.SortAsc} value={sortBy} onChange={setSortBy}>
              <option value="name">Sort: A-Z Name</option>
              <option value="reg_no">Sort: University ID</option>
              <option value="department">Sort: Faculty</option>
            </FilterMenu>
            
            <FilterMenu icon={Icons.Filter} value={filterStatus} onChange={setFilterStatus}>
              <option value="ALL">Status: All Residents</option>
              <option value="ALLOCATED">Status: Assigned Rooms</option>
              <option value="PENDING">Status: Pending Requests</option>
              <option value="NONE">Status: No Allocation</option>
            </FilterMenu>

            <FilterMenu icon={Icons.GraduationCap} value={filterDept} onChange={setFilterDept}>
              <option value="ALL">Faculty: All Depts</option>
              {stats.depts.map(d => <option key={d} value={d}>{d}</option>)}
            </FilterMenu>
          </div>
        </div>

        {/* 3. RESIDENT DIRECTORY */}
        <div className="space-y-4">
          <div className="hidden lg:grid grid-cols-12 px-8 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-2">
            <div className="col-span-5">Scholar Identity</div>
            <div className="col-span-3 text-center">Accommodation Status</div>
            <div className="col-span-4 text-right">Operational Actions</div>
          </div>

          <div className="space-y-4">
            {processedStudents.length > 0 ? processedStudents.map(s => (
              <ResidentCard 
                key={s.student_id} 
                student={s} 
                availableRooms={availableRooms}
                handleRoomAction={handleRoomAction}
                onRejectRequest={() => setRejectingStudent(s)}
                userRole={user?.role} 
              />
            )) : (
              <EmptyState message="No scholars found matching your criteria" />
            )}
          </div>
        </div>
      </div>

      {/* --- REJECTION note MODAL --- */}
      <AnimatePresence>
        {rejectingStudent && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Decline Application</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Reject Request.</h3>
                  </div>
                  <button onClick={() => setRejectingStudent(null)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Icons.X size={24} />
                  </button>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Target Scholar: <span className="text-slate-900 dark:text-white uppercase tracking-tight ml-1">{rejectingStudent.name}</span></p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Warden's Description (Reason for Rejection)</label>
                  <textarea 
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    placeholder="e.g. This wing is reserved for medical students only..."
                    className="w-full min-h-[150px] p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-medium text-sm shadow-inner"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => setRejectingStudent(null)}
                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleRoomAction('reject_request', rejectingStudent.student_id, null, null, rejectionNote)}
                    className="flex-[2] bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Icons.XCircle size={16} /> Confirm Rejection
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

// --- SUB-COMPONENTS ---

const ResidentCard = ({ student, availableRooms, handleRoomAction, onRejectRequest, userRole }) => {
  const [showSuggest, setShowSuggest] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');

  const { room_request_status, current_room_no, requested_room_no, student_id, requested_room_id, room_request_reason } = student;

  const getStatusUI = () => {
    switch(room_request_status) {
      case 'PENDING_INITIAL':
      case 'PENDING_CHANGE':
        return (
          <div className="flex flex-col items-center">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-[9px] font-black uppercase tracking-wider mb-2">
              <Icons.Clock size={10} /> Requesting {requested_room_no}
            </span>
            {room_request_reason && (
              <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                <Icons.MessageSquare size={10} className="text-orange-500" /> Statement Attached
              </div>
            )}
          </div>
        );
      case 'SUGGESTED':
        return (
          <div className="flex flex-col items-center">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-black uppercase tracking-wider mb-2">
              <Icons.ArrowRight size={10} /> Offer Pending
            </span>
          </div>
        );
      case 'ALLOCATED':
        return (
          <div className="flex flex-col items-center">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full text-[9px] font-black uppercase tracking-wider mb-2">
              <Icons.MapPin size={10} /> Room {current_room_no}
            </span>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-full text-[9px] font-black uppercase tracking-wider mb-2">
              No Assignment
            </span>
          </div>
        );
    }
  };

  const getActionsUI = () => {
    return (
      <div className="flex flex-col gap-3 items-end">
        <div className="flex gap-2">
          {(room_request_status === 'PENDING_INITIAL' || room_request_status === 'PENDING_CHANGE') && (
            <ActionButton onClick={() => handleRoomAction('allocate_room', student_id, requested_room_id)} icon={Icons.Check} label="Approve" primary />
          )}
          {room_request_status !== 'ALLOCATED' && room_request_status !== 'SUGGESTED' && (
            <ActionButton onClick={() => setShowSuggest(!showSuggest)} icon={Icons.Lightbulb} label="Suggest" />
          )}
          {room_request_status === 'ALLOCATED' && (
            <ActionButton onClick={() => { if(window.confirm("Confirm De-allocation?")) handleRoomAction('deallocate', student_id) }} icon={Icons.X} label="De-allocate" danger />
          )}
          {room_request_status !== 'NONE' && room_request_status !== 'ALLOCATED' && (
            <ActionButton onClick={onRejectRequest} icon={Icons.X} label="Cancel" danger />
          )}
          
          {userRole === 'SUPER' && (
            <ActionButton 
              onClick={() => { if(window.confirm("Permanently delete this scholar record? This will also remove all their complaints.")) handleRoomAction('delete_student', student_id) }} 
              icon={Icons.Trash2} 
              danger 
            />
          )}
        </div>
        
        {showSuggest && (
          <div className="flex gap-2 animate-in zoom-in-95 duration-200 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <select 
              className="text-[10px] font-bold p-2 bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white rounded-xl outline-none" 
              onChange={(e) => setSelectedRoom(e.target.value)} 
              value={selectedRoom}
            >
              <option value="">Choose Room...</option>
              {availableRooms.map(r => (
                <option key={r.room_id} value={r.room_id}>
                  {r.room_number} ({r.current_occupancy}/{r.capacity})
                </option>
              ))}
            </select>
            <button 
              disabled={!selectedRoom} 
              onClick={() => { handleRoomAction('suggest_room', student_id, null, selectedRoom); setShowSuggest(false); }} 
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1 rounded-xl text-[10px] font-black uppercase disabled:opacity-30"
            >
              Send
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm p-6 lg:p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all group grid grid-cols-1 lg:grid-cols-12 items-center gap-6">
        
        {/* Identity */}
        <div className="lg:col-span-5 flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-2xl text-slate-900 dark:text-white shadow-inner group-hover:scale-110 transition-transform">
            {(student.name || "?").charAt(0)}
          </div>
          <div className="min-w-0">
            <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-1 truncate">{student.name || "Unknown Scholar"}</h4>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md text-[9px] font-black tracking-widest uppercase">
                {student.reg_no || "No ID"}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                {student.department} • Year {student.year}
              </span>
            </div>
          </div>
        </div>

        {/* Room Status */}
        <div className="lg:col-span-3">
          {getStatusUI()}
        </div>

        {/* Actions */}
        <div className="lg:col-span-4">
          {getActionsUI()}
        </div>
      </div>

      {/* REASON DISPLAY AREA */}
      {(room_request_status === 'PENDING_INITIAL' || room_request_status === 'PENDING_CHANGE') && room_request_reason && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-8 -mt-2 p-6 bg-blue-500/5 dark:bg-blue-500/10 rounded-b-[2rem] border-x border-b border-blue-500/20 flex items-start gap-4"
        >
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Icons.FileText size={18} /></div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-500/60 mb-1">Scholar's Statement of Purpose</p>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic">"{room_request_reason}"</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Students;
