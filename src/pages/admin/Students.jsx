import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from '../../components/Icons';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';
import { adminService } from '../../services/api';
import { GlassBox, StatusBadge, Input, Select } from '../../components/SharedUI';

const Students = () => {
  const { user } = useOutletContext() || {};
  const [students, setStudents] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDept, setFilterDept] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [rejectingStudent, setRejectingStudent] = useState(null);
  const [rejectionNote, setRejectionNote] = useState('');

  const fetchData = async () => {
    try {
      const [studentsRes, roomsRes] = await Promise.all([
        adminService.getStudents(user),
        adminService.getRooms()
      ]);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setAvailableRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
    } catch (err) {
      toast.error("Failed to sync resident data");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoomAction = async (action, student_id, room_id = null, suggested_room_id = null, note = '') => {
    const loadingToast = toast.loading("Updating status...");
    try {
      const payload = { action, student_id, rejection_note: note };
      if (room_id) payload.room_id = room_id;
      if (suggested_room_id) payload.suggested_room_id = suggested_room_id;

      await adminService.adminAction(payload, user);
      toast.dismiss(loadingToast);

      toast.success("Operation successful");
      setRejectingStudent(null);
      setRejectionNote('');
      fetchData();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Operation failed");
    }
  };

  const stats = useMemo(() => {
    const activeStudents = students.filter(s => s.account_status === 'ACTIVE');
    const total = activeStudents.length;
    const allocated = activeStudents.filter(s => s.current_room_no).length;
    const pending = activeStudents.filter(s => ['REQUESTED', 'SUGGESTED', 'APPROVED'].includes(s.room_request_status)).length;
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
        const matchesSearch = (s.name || "").toLowerCase().includes(query) || (s.reg_no || "").toLowerCase().includes(query);
        const matchesStatus = filterStatus === 'ALL' ||
          (filterStatus === 'ALLOCATED' && s.current_room_no) ||
          (filterStatus === 'PENDING' && ['REQUESTED', 'SUGGESTED', 'APPROVED'].includes(s.room_request_status)) ||
          (filterStatus === 'NONE' && !s.current_room_no && !s.room_request_status);
        const matchesDept = filterDept === 'ALL' || s.department === filterDept;
        return matchesSearch && matchesStatus && matchesDept;
      })
      .sort((a, b) => (a[sortBy] || "").localeCompare(b[sortBy] || ""));
  }, [students, search, sortBy, filterStatus, filterDept]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 opacity-20">
      <Icons.Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
      <p className="text-xs font-bold uppercase tracking-[0.3em]">Scanning Scholar Directory...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard icon={Icons.Users} label="Resident Population" value={stats.total} color="blue" />
        <MetricCard icon={Icons.UserCheck} label="Room Assignment" value={`${stats.occupancyPercent}%`} trend={`${stats.allocated} Active`} color="teal" />
        <MetricCard icon={Icons.Building2} label="Pending Requests" value={stats.pending} trend="Action required" color="orange" alert={stats.pending > 0} />
        <MetricCard icon={Icons.GraduationCap} label="Active Faculties" value={stats.depts.length} color="indigo" />
      </div>

      {/* Filter Bar */}
      <GlassBox className="p-4 flex flex-col xl:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <Input 
            placeholder="Search by name or registration ID..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            icon={Icons.Search}
            className="!space-y-0"
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <Select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'name', label: 'Sort: A-Z Name' },
              { value: 'reg_no', label: 'Sort: University ID' },
              { value: 'department', label: 'Sort: Faculty' }
            ]}
            className="min-w-[160px]"
          />
          <Select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'ALLOCATED', label: 'Assigned Rooms' },
              { value: 'PENDING', label: 'Pending Requests' },
              { value: 'NONE', label: 'No Allocation' }
            ]}
            className="min-w-[160px]"
          />
          <Select 
            value={filterDept} 
            onChange={(e) => setFilterDept(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Faculties' },
              ...stats.depts.map(d => ({ value: d, label: d }))
            ]}
            className="min-w-[160px]"
          />
        </div>
      </GlassBox>

      {/* Residents Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {processedStudents.length > 0 ? processedStudents.map(s => (
            <motion.div 
              key={s.student_id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ResidentCard 
                student={s} 
                availableRooms={availableRooms} 
                handleRoomAction={handleRoomAction} 
                onRejectRequest={() => setRejectingStudent(s)} 
                userRole={user?.role} 
              />
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center opacity-40">
              <Icons.Search size={48} className="mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">No scholars found matching your criteria</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectingStudent && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Decline Application</p>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Reject Request</h3>
                </div>
                <button onClick={() => setRejectingStudent(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-all">
                  <Icons.X size={24} />
                </button>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                <p className="text-xs font-bold text-slate-500">Target Scholar: <span className="text-slate-800 uppercase tracking-tight ml-1">{rejectingStudent.name}</span></p>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Reason for Rejection</label>
                <textarea 
                  value={rejectionNote} 
                  onChange={(e) => setRejectionNote(e.target.value)} 
                  placeholder="Provide details for the student..." 
                  className="w-full min-h-[150px] p-5 bg-white border border-slate-200 text-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-bold text-sm resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button onClick={() => setRejectingStudent(null)} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={() => handleRoomAction('reject_request', rejectingStudent.student_id, null, null, rejectionNote)} 
                  className="flex-[2] bg-red-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Icons.XCircle size={16} /> Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, trend, color, alert }) => (
  <GlassBox className={`p-6 relative overflow-hidden ${alert ? 'border-orange-200 bg-orange-50/20' : ''}`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        color === 'blue' ? 'bg-blue-50 text-blue-600' :
        color === 'teal' ? 'bg-teal-50 text-teal-600' :
        color === 'orange' ? 'bg-orange-50 text-orange-600' :
        'bg-indigo-50 text-indigo-600'
      }`}>
        <Icon size={20} />
      </div>
      {alert && <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />}
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h4 className="text-2xl font-black text-slate-800">{value}</h4>
      {trend && <p className="text-[10px] font-medium text-slate-500">{trend}</p>}
    </div>
  </GlassBox>
);

const ResidentCard = ({ student, availableRooms, handleRoomAction, onRejectRequest, userRole }) => {
  const [showSuggest, setShowSuggest] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const { room_request_status, current_room_no, requested_room_no, student_id, requested_room_id, room_request_reason } = student;

  return (
    <GlassBox className="p-8 flex flex-col h-full group">
      <div className="flex items-start gap-6 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center font-black text-2xl text-slate-800 transition-transform group-hover:scale-110">
          {(student.name || "?").charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xl font-black text-slate-800 tracking-tight mb-1 truncate">{student.name || "Unknown Scholar"}</h4>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{student.reg_no}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.department} • Year {student.year}</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          {current_room_no ? (
            <StatusBadge status="ALLOCATED" className="!bg-teal-50 !text-teal-700 !border-teal-100" />
          ) : (
            <StatusBadge status={room_request_status || 'Unassigned'} />
          )}
          {current_room_no && <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Room {current_room_no}</span>}
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {['REQUESTED', 'APPROVED', 'SUGGESTED'].includes(room_request_status) && (
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                {room_request_status === 'SUGGESTED' ? 'Offer Pending' : `Requesting ${requested_room_no || 'Room'}`}
              </span>
              {room_request_status === 'APPROVED' && <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Approved (Unpaid)</span>}
            </div>
            {room_request_reason && (
              <p className="text-xs font-medium text-slate-600 italic">"{room_request_reason}"</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 justify-end">
        {['REQUESTED', 'SUGGESTED'].includes(room_request_status) && (
          <button 
            onClick={() => handleRoomAction('allocate_room', student_id, requested_room_id)} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Icons.Check size={14} /> Approve
          </button>
        )}
        
        {!current_room_no && !['REQUESTED', 'SUGGESTED', 'APPROVED'].includes(room_request_status) && (
          <button 
            onClick={() => setShowSuggest(!showSuggest)} 
            className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-white/80 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-all"
          >
            <Icons.Lightbulb size={14} /> Suggest Room
          </button>
        )}

        {current_room_no && (
          <button 
            onClick={() => { if (window.confirm("Confirm De-allocation?")) handleRoomAction('deallocate', student_id) }} 
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all"
          >
            <Icons.X size={14} /> De-allocate
          </button>
        )}

        {room_request_status && room_request_status !== 'ALLOCATED' && (
          <button 
            onClick={onRejectRequest} 
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all"
          >
            <Icons.X size={14} /> Cancel
          </button>
        )}

        {userRole === 'SUPER' && (
          <button 
            onClick={() => { if (window.confirm("Permanently delete record?")) handleRoomAction('delete_student', student_id) }} 
            className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <Icons.Trash2 size={14} />
          </button>
        )}
      </div>

      {showSuggest && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mt-4 flex gap-2 p-2 bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 shadow-xl"
        >
          <select 
            className="flex-1 text-[10px] font-bold p-2 bg-slate-50 border-none text-slate-800 rounded-xl outline-none cursor-pointer"
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
            className="bg-blue-600 text-white px-4 py-1 rounded-xl text-[10px] font-black uppercase disabled:opacity-30 transition-all"
          >
            Send
          </button>
        </motion.div>
      )}
    </GlassBox>
  );
};

export default Students;
