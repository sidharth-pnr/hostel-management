import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from '../../components/Icons';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import { GlassBox, StatusBadge, Input, Select, PrimaryButton } from '../../components/SharedUI';

const Complaints = () => {
  const { user, setIsHeaderVisible } = useOutletContext();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Other');
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, RESOLVED, CLOSED
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [trackingComplaint, setTrackingComplaint] = useState(null);

  const categories = [
    { id: 'Electrical', icon: Icons.Zap, label: 'Electrical', color: 'blue' },
    { id: 'Plumbing', icon: Icons.Wrench, label: 'Plumbing', color: 'teal' },
    { id: 'Internet', icon: Icons.Wifi, label: 'Internet', color: 'blue' },
    { id: 'Furniture', icon: Icons.Layers, label: 'Furniture', color: 'teal' },
    { id: 'Cleaning', icon: Icons.Ghost, label: 'Cleaning', color: 'blue' },
    { id: 'Other', icon: Icons.MoreHorizontal, label: 'Other', color: 'slate' },
  ];

  // Hide header when tracking modal is open
  useEffect(() => {
    if (trackingComplaint) {
      setIsHeaderVisible?.(false);
    } else {
      setIsHeaderVisible?.(true);
    }
    return () => setIsHeaderVisible?.(true);
  }, [trackingComplaint, setIsHeaderVisible]);

  const fetchData = async () => {
    try {
      const res = await studentService.getComplaints(user.id);
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user.id]);

  const filteredComplaints = useMemo(() => {
    if (filter === 'ACTIVE') return complaints.filter(c => ['PENDING', 'IN_PROGRESS'].includes(c.status));
    if (filter === 'RESOLVED') return complaints.filter(c => c.status === 'RESOLVED');
    if (filter === 'CLOSED') return complaints.filter(c => c.status === 'CLOSED');
    return complaints;
  });

  const handleComplaint = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      category: selectedCategory
    };

    const loadingToast = toast.loading("Submitting ticket...");
    try {
      await studentService.submitComplaint(payload, user);
      toast.dismiss(loadingToast);
      toast.success("Ticket created successfully.");
      e.target.reset();
      setShowNewTicket(false);
      fetchData();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to submit");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await studentService.updateComplaintStatus({ complaint_id: id, status }, user);
      toast.success(`Ticket marked as ${status.toLowerCase()}.`);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatFullTime = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Complaints Tracker</h3>
          <p className="text-sm font-medium text-slate-500">Submit and track maintenance requests</p>
        </div>
        {!showNewTicket && (
          <button 
            onClick={() => setShowNewTicket(true)}
            className="bg-slate-900 hover:bg-slate-950 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center transition-all shadow-lg shadow-slate-900/20 active:scale-95"
          >
            <Icons.Plus size={18} className="mr-2" /> New Ticket
          </button>
        )}
      </div>

      <AnimatePresence>
        {showNewTicket && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-10"
          >
            <GlassBox className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-lg font-bold text-slate-800">Create New Ticket</h4>
                <button onClick={() => setShowNewTicket(false)} className="text-slate-400 hover:text-slate-600">
                  <Icons.X size={20} />
                </button>
              </div>

              <form onSubmit={handleComplaint} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Select Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                            selectedCategory === cat.id
                              ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105'
                              : 'bg-white/50 border-white hover:border-blue-200 text-slate-400'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="text-[10px] font-bold uppercase tracking-tight">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Subject" 
                    name="title" 
                    placeholder="E.g., Fan regulator broken" 
                    required 
                    icon={Icons.MessageSquare}
                  />
                  <Select 
                    label="Urgency" 
                    name="priority" 
                    required 
                    options={[
                      { value: 'Low', label: 'Low' },
                      { value: 'Medium', label: 'Medium' },
                      { value: 'High', label: 'High' },
                      { value: 'Urgent', label: 'Critical' }
                    ]}
                  />
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Detailed Description</label>
                    <textarea 
                      name="description" 
                      required 
                      rows="4" 
                      placeholder="Please provide specifics (e.g., Block A, Room 302, left-side fan)..."
                      className="w-full p-4 bg-white/50 border border-white/80 text-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white/80 transition-all font-bold text-sm resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowNewTicket(false)}
                    className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <PrimaryButton className="w-auto px-10" icon={Icons.Send}>
                    Submit Ticket
                  </PrimaryButton>
                </div>
              </form>
            </GlassBox>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar pb-2">
          {['ALL', 'ACTIVE', 'RESOLVED', 'CLOSED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                filter === f
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white/50 text-slate-500 border-white/80 hover:bg-white'
              }`}
            >
              {f === 'RESOLVED' ? 'Resolved' : f}
            </button>
          ))}
        </div>

        <GlassBox className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/40 border-b border-white/60 backdrop-blur-md">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Issue</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {filteredComplaints.length > 0 ? filteredComplaints.map((c) => (
                  <tr key={c.complaint_id} className="hover:bg-white/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-bold text-slate-600 bg-white/60 px-2 py-1 rounded-md border border-white">
                        #TK-{c.complaint_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        {c.category}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs sm:max-w-md">
                        <p className="text-sm font-bold text-slate-800 truncate">{c.title}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{c.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={c.status} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Reported {formatDateTime(c.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => setTrackingComplaint(c)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Track Progress"
                        >
                          <Icons.History size={18} />
                        </button>
                        {c.status === 'RESOLVED' && (
                          <div className="flex items-center gap-2 mr-2">
                            <button 
                              onClick={() => updateStatus(c.complaint_id, 'PENDING')}
                              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                              title="Reopen"
                            >
                              <Icons.RefreshCcw size={16} />
                            </button>
                            <button 
                              onClick={() => updateStatus(c.complaint_id, 'CLOSED')}
                              className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                              title="Close"
                            >
                              <Icons.CheckCircle size={16} />
                            </button>
                          </div>
                        )}
                        <PriorityBadge level={c.priority} />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <Icons.ClipboardList size={48} className="mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">No tickets found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassBox>
      </div>

      {/* Tracking History Modal */}
      <AnimatePresence>
        {trackingComplaint && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">Complaint Tracking</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ticket #TK-{trackingComplaint.complaint_id}</p>
                </div>
                <button onClick={() => setTrackingComplaint(null)} className="p-3 bg-white text-slate-400 hover:text-red-500 rounded-2xl transition-all shadow-sm">
                  <Icons.X size={20} />
                </button>
              </div>

              <div className="p-8">
                <div className="relative space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                  
                  {/* Step 1: Reported */}
                  <div className="relative flex items-start gap-6">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center z-10 shrink-0 shadow-lg shadow-slate-900/20">
                      <Icons.Clock size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ticket Created</p>
                      <p className="text-sm font-bold text-slate-800">{formatFullTime(trackingComplaint.created_at)}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">Issue reported to management</p>
                    </div>
                  </div>

                  {/* Step 2: In Progress */}
                  <div className={`relative flex items-start gap-6 ${!trackingComplaint.in_progress_at ? 'opacity-30 grayscale' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 ${trackingComplaint.in_progress_at ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-200 text-slate-400'}`}>
                      <Icons.Activity size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Investigation Started</p>
                      <p className="text-sm font-bold text-slate-800">{formatFullTime(trackingComplaint.in_progress_at) || 'Pending Allocation'}</p>
                      {trackingComplaint.in_progress_at && <p className="text-xs font-medium text-slate-500 mt-1">Warden has initiated repair protocol</p>}
                    </div>
                  </div>

                  {/* Step 3: Resolved */}
                  <div className={`relative flex items-start gap-6 ${!trackingComplaint.resolved_at ? 'opacity-30 grayscale' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 ${trackingComplaint.resolved_at ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-200 text-slate-400'}`}>
                      <Icons.CheckCircle2 size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Issue Resolved</p>
                      <p className="text-sm font-bold text-slate-800">{formatFullTime(trackingComplaint.resolved_at) || 'Awaiting Completion'}</p>
                      {trackingComplaint.resolved_at && (
                        <div className="mt-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Resolution Note</p>
                          <p className="text-xs font-medium text-emerald-800 italic">"{trackingComplaint.resolution_note || 'Issue resolved.'}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                <button onClick={() => setTrackingComplaint(null)} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors">Dismiss Tracker</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-12 text-center opacity-30">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-500">Complaints Management Protocol • Campus Housing</p>
      </footer>
    </div>
  );
};

const PriorityBadge = ({ level }) => {
  const getStyles = (l) => {
    switch(l) {
      case 'Urgent': return 'bg-red-50 text-red-600 border-red-100';
      case 'High': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Medium': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${getStyles(level)}`}>
      {level}
    </span>
  );
};

export default Complaints;
