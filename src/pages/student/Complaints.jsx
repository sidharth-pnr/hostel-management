import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from '../../components/Icons';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import { GlassBox, StatusBadge, Input, Select, PrimaryButton } from '../../components/SharedUI';

const Complaints = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Other');
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, RESOLVED, CLOSED
  const [showNewTicket, setShowNewTicket] = useState(false);

  const categories = [
    { id: 'Electrical', icon: Icons.Zap, label: 'Electrical', color: 'blue' },
    { id: 'Plumbing', icon: Icons.Wrench, label: 'Plumbing', color: 'teal' },
    { id: 'Internet', icon: Icons.Wifi, label: 'Internet', color: 'blue' },
    { id: 'Furniture', icon: Icons.Layers, label: 'Furniture', color: 'teal' },
    { id: 'Cleaning', icon: Icons.Ghost, label: 'Cleaning', color: 'blue' },
    { id: 'Other', icon: Icons.MoreHorizontal, label: 'Other', color: 'slate' },
  ];

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

  return (
    <div className="animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Grievance Tracker</h3>
          <p className="text-sm font-medium text-slate-500">Submit and track maintenance requests</p>
        </div>
        {!showNewTicket && (
          <button 
            onClick={() => setShowNewTicket(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center transition-all shadow-lg shadow-blue-600/20 active:scale-95"
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
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105'
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
              {f === 'RESOLVED' ? 'Fixed' : f}
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
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
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
                    <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                      {formatDateTime(c.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.status === 'RESOLVED' && (
                          <>
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
                          </>
                        )}
                        <PriorityDot level={c.priority} />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
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

      <footer className="mt-12 text-center opacity-30">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-500">Grievance Management Protocol • Campus Housing</p>
      </footer>
    </div>
  );
};

const PriorityDot = ({ level }) => {
  const getStyles = (l) => {
    switch(l) {
      case 'Urgent': return 'bg-red-500 shadow-red-200';
      case 'High': return 'bg-orange-500 shadow-orange-200';
      case 'Medium': return 'bg-blue-500 shadow-blue-200';
      default: return 'bg-slate-300 shadow-slate-100';
    }
  };

  return (
    <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${getStyles(level)}`} title={`Priority: ${level}`} />
  );
};

export default Complaints;
