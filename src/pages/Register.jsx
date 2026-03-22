import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as Icons from '../components/Icons';
import ThemeToggle from '../components/ThemeToggle';
import { API_BASE } from '../config';

const Register = ({ isDark, setIsDark }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    reg_no: '', 
    department: 'CSE', 
    year: '1', 
    phone: '', 
    password: '' 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.name || !formData.reg_no || !formData.password) {
      return toast.error("Essential identity fields are required");
    }

    if(!formData.phone || formData.phone.length !== 10) {
      return toast.error("Phone number must be exactly 10 digits");
    }
    
    setIsLoading(true);
    const loadingToast = toast.loading("Processing admission request...");
    try {
      const res = await axios.post(`${API_BASE}/register.php`, formData);
      toast.dismiss(loadingToast);
      if (res.data.status === "success") {
        toast.success("Registration Successful. Please sign in.");
        navigate('/login');
      } else {
        toast.error(res.data.error || "Registration failed");
      }
    } catch (err) { 
      toast.dismiss(loadingToast);
      toast.error("Network synchronization failed"); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden fixed inset-0">
      
      {/* LEFT SIDE: CINEMATIC VISUAL (60%) */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-slate-900 h-full">
        <img 
          src="https://media.istockphoto.com/id/917609832/photo/man-pulling-suitcase-and-entering-hotel-room-traveler-going-in-to-room-or-walking-inside-motel.jpg?s=612x612&w=0&k=20&c=EJoJW4VqwIhl1rRlu5FnPuyqylnKIX1mPgW2WpIWap0=" 
          alt="Campus Community" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 animate-ken-burns scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
        
        <div className="absolute bottom-16 left-16 right-16 space-y-4 animate-slide-up">
          <div className="w-10 h-1 bg-white rounded-full opacity-50" />
          <div className="relative">
            <Icons.Quote className="absolute -top-8 -left-8 w-16 h-16 text-white/5" />
            <h2 className="text-4xl font-serif font-black text-white leading-tight tracking-tight max-w-xl">
              A community built on <br/>
              <span className="text-slate-400 italic font-medium">excellence & synergy.</span>
            </h2>
          </div>
          <p className="text-slate-400 font-medium text-base max-w-md">
            Join the official residential registry of College of Engineering Trikaripur.
          </p>
        </div>

        <div className="absolute bottom-8 left-16 flex items-center gap-2 text-white/20">
          <Icons.Building2 size={14} />
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">Campus Housing Secure Protocol</span>
        </div>
      </div>

      {/* RIGHT SIDE: REGISTRATION CONSOLE (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col h-full bg-white dark:bg-slate-950">
        
        {/* Navigation & Controls - Compact */}
        <div className="p-6 flex justify-between items-center w-full">
          <Link to="/" className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
            <Icons.ChevronLeft size={18} />
            <span className="text-[9px] font-black uppercase tracking-widest">Back to Home</span>
          </Link>
          <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-4">
          <div className="w-full max-w-lg mx-auto space-y-6 animate-slide-up">
            
            {/* Branding - Compact */}
            <div className="space-y-3 text-center sm:text-left">
              <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 w-fit rounded-full border border-slate-100 dark:border-slate-800 mx-auto sm:mx-0">
                <Icons.Sparkles size={12} className="text-teal-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Student Register</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">New <span className="text-slate-400">Admission</span></h1>
            </div>

            {/* Form - Compact 2 Column Grid */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                {/* Full Width Field */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" required 
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border-none text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold text-sm"
                    placeholder="Legal Name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                {/* 2-Column Grid Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">University ID</label>
                    <input 
                      type="text" required 
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border-none text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold text-sm"
                      placeholder="TKR23..."
                      value={formData.reg_no}
                      onChange={e => setFormData({...formData, reg_no: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact No</label>
                    <input 
                      type="tel" 
                      maxLength={10}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border-none text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold text-sm"
                      placeholder="10-digit Number"
                      value={formData.phone}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) setFormData({...formData, phone: val});
                      }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <select 
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border-none text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold text-sm appearance-none"
                      value={formData.department} 
                      onChange={e => setFormData({...formData, department: e.target.value})}
                    >
                      {['CSE','ECE','EEE','MECH','CIVIL','IT','DS'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
                    <select 
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border-none text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold text-sm appearance-none"
                      value={formData.year} 
                      onChange={e => setFormData({...formData, year: e.target.value})}
                    >
                      {[1,2,3,4].map(y => <option key={y} value={y}>{y} Year</option>)}
                    </select>
                  </div>
                </div>

                {/* Full Width Password */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    type="password" required 
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border-none text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                </div>
              </div>
              
              <button 
                disabled={isLoading}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10"
              >
                {isLoading ? "Synchronizing..." : "Submit Registry Request"}
                {!isLoading && <Icons.ArrowRight size={16} />}
              </button>
            </form>
            
            <div className="pt-6 border-t border-slate-50 dark:border-slate-900 text-center">
              <p className="text-[11px] font-bold text-slate-400">
                Already a Member? <Link to="/login" className="text-slate-900 dark:text-white font-black hover:underline decoration-2 underline-offset-4 ml-1">Sign In</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-6 text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-200 dark:text-slate-800">
             Campus Housing • Security Standard • Group 15
           </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
