import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as Icons from '../../components/Icons';
import { API_BASE } from '../../config';

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
      const res = await axios.post(`${API_BASE}/manage_admins.php`, {
        admin_role: user.role,
        action: 'list'
      });
      if (res.data.error) toast.error(res.data.error);
      else setAdmins(res.data);
    } catch (err) {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/manage_admins.php`, {
        ...formData,
        admin_role: user.role,
        action: 'add'
      });
      if (res.data.status === 'Success') {
        toast.success("Admin account created");
        setShowAddForm(false);
        setFormData({ name: '', username: '', password: '', role: 'STAFF' });
        fetchAdmins();
      } else {
        toast.error(res.data.error || "Failed to add admin");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admin account permanently?")) return;
    try {
      const res = await axios.post(`${API_BASE}/manage_admins.php`, {
        id,
        admin_role: user.role,
        action: 'delete'
      });
      if (res.data.status === 'Success') {
        toast.success("Admin removed");
        fetchAdmins();
      } else {
        toast.error(res.data.error || "Failed to delete");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  if (user.role !== 'SUPER') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Icons.Shield size={48} className="mb-4 opacity-20" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p>Only SUPER admins can manage other accounts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">System Administrators</h2>
          <p className="text-slate-500 text-sm">Manage access control and staff permissions</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
        >
          <Icons.UserPlus size={18} />
          {showAddForm ? 'Cancel' : 'New Admin'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-xl max-w-2xl mx-auto animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
              <input
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm"
                placeholder="Staff Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Username</label>
              <input
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm"
                placeholder="Login ID"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
              <input
                required
                type="password"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role Type</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="STAFF">Staff (Limited Access)</option>
                <option value="SUPER">Super (Full Access)</option>
              </select>
            </div>
            <button className="md:col-span-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold mt-2">
              Create Admin Account
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map(adm => (
          <div key={adm.admin_id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${adm.role === 'SUPER' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                <Icons.Shield size={24} />
              </div>
              {adm.admin_id !== 1 && adm.admin_id != user.id && (
                <button
                  onClick={() => handleDelete(adm.admin_id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Icons.Trash2 size={18} />
                </button>
              )}
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">{adm.name}</h3>
            <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
              <Icons.User size={12} />
              <span>{adm.username}</span>
            </div>
            <div className="mt-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                adm.role === 'SUPER' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500'
              }`}>
                {adm.role} Admin
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admins;
