import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as Icons from '../../components/Icons';
import { adminService } from '../../services/api';
import { GlassBox, Input, Select, PrimaryButton } from '../../components/SharedUI';
import { motion, AnimatePresence } from 'framer-motion';

const Admins = () => {
  const { user } = useOutletContext();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'STAFF' });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await adminService.getAdmins(user);
      setAdmins(res.data);
    } catch (err) {
      toast.error(err.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Configuring credentials...");
    try {
      await adminService.addAdmin(formData, user);
      toast.dismiss(loadingToast);
      toast.success("Admin account created");
      setShowAddForm(false);
      setFormData({ name: '', username: '', password: '', role: 'STAFF' });
      fetchAdmins();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to add admin");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admin account permanently?")) return;
    try {
      await adminService.deleteAdmin(id, user);
      toast.success("Admin removed");
      fetchAdmins();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  if (user.role !== 'SUPER') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 animate-in fade-in duration-700">
        <Icons.ShieldAlert size={64} className="mb-6 text-red-500 opacity-20" />
        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Access Restricted</h2>
        <p className="font-medium text-slate-500">Only Super Administrators can manage system credentials.</p>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 opacity-20">
      <Icons.Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
      <p className="text-xs font-bold uppercase tracking-[0.3em]">Syncing security protocols...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Administrators</h2>
          <p className="text-slate-500 font-medium">Manage access control and staff permissions</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-6 py-3 rounded-2xl text-sm font-bold flex items-center transition-all shadow-lg active:scale-95 ${
            showAddForm 
              ? 'bg-slate-800 text-white shadow-slate-900/20' 
              : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700'
          }`}
        >
          {showAddForm ? <Icons.X size={18} className="mr-2" /> : <Icons.UserPlus size={18} className="mr-2" />}
          {showAddForm ? 'Cancel' : 'New Admin'}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-10"
          >
            <GlassBox className="p-8 max-w-3xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Icons.ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800">Provision New Credentials</h4>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Administrative Access</p>
                </div>
              </div>

              <form onSubmit={handleAdd} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Full Name" 
                    required 
                    placeholder="Staff Name" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    icon={Icons.User}
                  />
                  <Input 
                    label="Username" 
                    required 
                    placeholder="Login ID" 
                    value={formData.username} 
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    icon={Icons.Fingerprint}
                  />
                  <Input 
                    label="Password" 
                    type="password" 
                    required 
                    placeholder="••••••••" 
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    icon={Icons.Shield}
                  />
                  <Select 
                    label="Access Level" 
                    value={formData.role} 
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    options={[
                      { value: 'STAFF', label: 'Staff (Limited Access)' },
                      { value: 'SUPER', label: 'Super (Full Access)' }
                    ]}
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <PrimaryButton className="w-auto px-10" icon={Icons.CheckCircle}>
                    Create Admin Account
                  </PrimaryButton>
                </div>
              </form>
            </GlassBox>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {admins.map(adm => (
            <motion.div
              key={adm.admin_id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassBox className="p-8 flex flex-col h-full group">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                    adm.role === 'SUPER' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Icons.Shield size={28} />
                  </div>
                  {adm.admin_id !== 1 && adm.admin_id != user.id && (
                    <button 
                      onClick={() => handleDelete(adm.admin_id)} 
                      className="p-3 bg-white/50 border border-white/80 text-slate-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-2xl transition-all"
                    >
                      <Icons.Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">{adm.name}</h3>
                  <div className="flex items-center gap-2 text-slate-500 mb-6">
                    <Icons.User size={14} className="opacity-50" />
                    <span className="text-xs font-bold">{adm.username}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/40">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    adm.role === 'SUPER' 
                      ? 'bg-amber-100/80 text-amber-700 border-amber-200' 
                      : 'bg-blue-100/80 text-blue-700 border-blue-200'
                  }`}>
                    {adm.role} Administrator
                  </span>
                </div>
              </GlassBox>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <footer className="mt-12 text-center opacity-30">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-500">Security Clearance Level Required • Official Log</p>
      </footer>
    </div>
  );
};

export default Admins;
