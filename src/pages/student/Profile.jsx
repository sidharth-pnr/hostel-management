import React, { useState, useEffect } from 'react';
import * as Icons from '../../components/Icons';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import { GlassBox, StatusBadge, Input, Select, PrimaryButton } from '../../components/SharedUI';

const Profile = () => {
  const { user, setUser } = useOutletContext();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editData, setEditData] = useState({
    name: user.name,
    department: user.department,
    year: user.year,
    phone: user.phone,
  });

  const studentId = user.student_id || user.id;

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      const [roomRes, profileRes] = await Promise.all([
        studentService.getRoomInfo(studentId),
        studentService.getProfile(studentId)
      ]);
      setRoom(roomRes.data);
      setProfileData(profileRes.data.student);
      
      if (profileRes.data.student) {
        const latest = { ...user, ...profileRes.data.student };
        if (JSON.stringify(latest) !== JSON.stringify(user)) {
          setUser(latest);
          localStorage.setItem('user', JSON.stringify(latest));
        }
      }
    } catch (err) {
      console.error("Fetch failure:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (editData.phone && editData.phone.length !== 10) return toast.error("Phone number must be 10 digits");
    
    const loadingToast = toast.loading("Saving changes...");
    try {
      await studentService.updateProfile({ student_id: studentId, ...editData });
      toast.dismiss(loadingToast);
      toast.success("Profile updated successfully.");
      setIsEditing(false);
      fetchData();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Update failed.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="animate-in fade-in duration-700">
      
      {/* Profile Header Card */}
      <GlassBox className="p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Icons.UserCircle size={150} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-white/50 border border-white p-1 shadow-xl">
              <div className="w-full h-full rounded-[1.25rem] bg-slate-100 flex items-center justify-center text-slate-400">
                <Icons.UserCircle size={80} strokeWidth={1} />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-xl border-4 border-white shadow-lg">
              <Icons.ShieldCheck size={16} className="text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
              <StatusBadge status={user.account_status} />
              <span className="px-3 py-1 bg-white/50 border border-white/80 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Student Portal
              </span>
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-1">{user.name}</h2>
            <p className="text-sm font-medium text-slate-500">
              Registration No: <span className="text-slate-900 font-bold">{user.reg_no}</span>
            </p>
          </div>

          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-slate-800 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all active:scale-95 flex items-center gap-2"
            >
              <Icons.Pencil size={14} /> Edit Profile
            </button>
          )}
        </div>
      </GlassBox>

      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div 
            key="view" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Academic Info */}
            <GlassBox className="p-8">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Academic Details</h4>
              <div className="space-y-6">
                <ProfileDetail icon={Icons.GraduationCap} label="Department" value={user.department} />
                <ProfileDetail icon={Icons.Layers} label="Year of Study" value={`Year ${user.year}`} />
                <ProfileDetail icon={Icons.Calendar} label="Member Since" value={formatDate(user.created_at)} />
              </div>
            </GlassBox>

            {/* Contact & Room Info */}
            <div className="space-y-6">
              <GlassBox className="p-8">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Contact Information</h4>
                <ProfileDetail icon={Icons.Phone} label="Phone Number" value={user.phone || 'Not provided'} />
              </GlassBox>

              {room && room.room_number ? (
                <GlassBox 
                  className="p-8 border-l-4 border-slate-900 cursor-pointer bg-white/80 text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-500 group"
                  onClick={() => navigate('/student/book')}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:text-slate-400 transition-colors">Active Residence</p>
                      <h3 className="text-3xl font-black tracking-tight">Room {room.room_number}</h3>
                      <p className="text-sm font-bold opacity-60 group-hover:text-slate-400 transition-colors">Block {room.block} • Standard Wing</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-all duration-500">
                      <Icons.ArrowUpRight size={24} />
                    </div>
                  </div>
                </GlassBox>
              ) : (
                <GlassBox 
                  className="p-8 border-dashed border-2 border-slate-200 bg-transparent flex flex-col items-center justify-center text-center group cursor-pointer"
                  onClick={() => navigate('/student/book')}
                >
                  <Icons.PlusCircle size={32} className="text-slate-300 mb-2 group-hover:text-slate-900 transition-colors" />
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Active Room</p>
                </GlassBox>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="edit" 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <GlassBox className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-lg font-bold text-slate-800">Edit Profile Information</h4>
                <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                  <Icons.X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Full Name" 
                    value={editData.name} 
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })} 
                  />
                  <Input 
                    label="Phone Number" 
                    value={editData.phone} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setEditData({ ...editData, phone: val });
                    }} 
                  />
                  <Select 
                    label="Department" 
                    value={editData.department} 
                    onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                    options={['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'DS']}
                  />
                  <Select 
                    label="Year of Study" 
                    value={editData.year} 
                    onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                    options={[
                      { value: 1, label: 'Year 1' },
                      { value: 2, label: 'Year 2' },
                      { value: 3, label: 'Year 3' },
                      { value: 4, label: 'Year 4' }
                    ]}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-white/40">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <PrimaryButton className="w-auto px-10" icon={Icons.CheckCircle}>
                    Save Changes
                  </PrimaryButton>
                </div>
              </form>
            </GlassBox>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-12 text-center opacity-30">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-500">Student Identity Verification • Official Record</p>
      </footer>
    </div>
  );
};

const ProfileDetail = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 group">
    <div className="w-10 h-10 bg-white/50 border border-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

export default Profile;
