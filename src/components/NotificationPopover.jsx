import React, { useState, useEffect } from 'react';
import * as Icons from './Icons';
import { adminService, studentService } from '../services/api';
import { StatusBadge } from './SharedUI';

const NotificationPopover = ({ user, role, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        let allNotifications = [];

        if (role === 'admin') {
          // Fetch pending students and complaints for admin
          const [pendingRes, complaintsRes] = await Promise.all([
            adminService.getPendingStudents(user).catch(() => ({ data: [] })),
            adminService.getComplaints(user).catch(() => ({ data: [] }))
          ]);

          const pendingItems = (pendingRes.data || []).slice(0, 3).map(item => ({
            id: `pending-${item.student_id || Math.random()}`,
            title: 'New Student Approval',
            message: `${item.name || 'Unknown Student'} (${item.reg_no || 'N/A'}) is waiting for approval.`,
            time: 'Recently',
            type: 'approval',
            status: 'PENDING'
          }));

          const complaintItems = (complaintsRes.data || []).slice(0, 3).map(item => ({
            id: `complaint-${item.complaint_id || Math.random()}`,
            title: 'New Grievance',
            message: `${item.student_name || 'Student'}: ${item.title || 'No Title'}`,
            time: item.created_at || 'Recently',
            type: 'complaint',
            status: item.status || 'PENDING'
          }));

          allNotifications = [...pendingItems, ...complaintItems].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);
        } else {
          // Fetch complaints for student
          const complaintsRes = await studentService.getComplaints(user.id).catch(() => ({ data: [] }));
          allNotifications = (complaintsRes.data || []).slice(0, 5).map(item => ({
            id: item.complaint_id || Math.random(),
            title: 'Complaint Update',
            message: `Your complaint "${item.title || 'N/A'}" is now ${item.status || 'Pending'}`,
            time: item.updated_at || item.created_at || 'Recently',
            type: 'complaint',
            status: item.status || 'PENDING'
          }));
        }

        setNotifications(allNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, role]);

  return (
    <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-[120px] p-4 shadow-2xl z-50 border border-white/60 rounded-[2rem] animate-in fade-in zoom-in duration-200 origin-top-right">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Icons.Bell size={16} className="text-blue-600" />
          Notifications
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <Icons.X size={14} />
        </button>
      </div>

      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Icons.Loader2 size={24} className="animate-spin text-blue-500" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Updating feed...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif.id} className="p-3 bg-white/50 border border-white/60 rounded-2xl hover:bg-white/80 transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  {notif.title}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">
                  {notif.time}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-bold leading-relaxed mb-2">
                {notif.message}
              </p>
              <div className="flex justify-end">
                <StatusBadge status={notif.status} className="scale-75 origin-right" />
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
              <Icons.Inbox size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400">All caught up!</p>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">No new alerts</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/40 text-center">
        <button 
          onClick={onClose}
          className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-blue-600 transition-colors"
        >
          Close Panel
        </button>
      </div>
    </div>
  );
};

export default NotificationPopover;
