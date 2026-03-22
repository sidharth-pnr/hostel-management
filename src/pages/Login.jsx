import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as Icons from '../components/Icons';
import axios from 'axios';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import { API_BASE } from '../config';
import { AuthVisualSide, Input, PrimaryButton } from '../components/SharedUI';

const Login = ({ setUser, isDark, setIsDark }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading("Verifying identity...");
    try {
      const res = await axios.post(`${API_BASE}/login.php`, { email, password, role });
      toast.dismiss(loadingToast);
      if (res.data.status === "success") {
        toast.success(`Welcome back, ${res.data.user.name}`);
        const userWithRole = { ...res.data.user, role: role === 'admin' ? res.data.user.role : 'student' };
        setUser(userWithRole);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        navigate(role === 'admin' ? '/admin' : '/student');
      } else toast.error(res.data.error || "Access Denied: Invalid Credentials"); 
    } catch (err) { toast.dismiss(loadingToast); toast.error('Connection Error.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="h-screen w-full flex bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden fixed inset-0">
      <AuthVisualSide 
        image="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        quote="Precision in management,"
        author="comfort in living."
        subtitle="The official residential gateway for the College of Engineering Trikaripur community."
      />

      <div className="w-full lg:w-[40%] flex flex-col h-full bg-white dark:bg-slate-950">
        <div className="p-6 flex justify-between items-center w-full">
          <Link to="/" className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><Icons.ChevronLeft size={18} /><span className="text-[9px] font-black uppercase tracking-widest">Back to Home</span></Link>
          <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 py-4">
          <div className="w-full max-w-sm mx-auto space-y-8 animate-slide-up">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 shadow-xl transform hover:rotate-12 transition-transform"><Icons.Building2 size={24} /></div>
              <div><h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Portal <span className="text-slate-400 font-medium">Access</span></h1><p className="text-slate-500 dark:text-slate-400 font-medium text-[13px]">Authorized residential entry</p></div>
            </div>

            <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800/50">
              {['student', 'admin'].map(r => (
                <button key={r} onClick={() => setRole(r)} className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${role === r ? 'bg-white dark:bg-slate-800 shadow-lg text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                  {r === 'admin' ? <Icons.ShieldCheck size={12} /> : <Icons.UserCircle size={12} />} {r === 'admin' ? 'Warden' : 'Student'}
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                <Input label={role === 'admin' ? "Username" : "University ID"} placeholder={role === 'admin' ? "e.g. WARDEN_01" : "e.g. TKR23CS101"} value={email} onChange={e => setEmail(e.target.value)} required />
                <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <PrimaryButton isLoading={isLoading} loadingText="Validating...">Sign In</PrimaryButton>
            </form>
            
            <div className="pt-6 border-t border-slate-50 dark:border-slate-900 text-center"><p className="text-[11px] font-bold text-slate-400">New to College Hostel? <Link to="/register" className="text-slate-900 dark:text-white font-black hover:underline decoration-2 underline-offset-4 ml-1">Register Now</Link></p></div>
          </div>
        </div>
        <div className="p-6 text-center"><p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-200 dark:text-slate-800">Campus Housing • Secure Protocol • Group 15</p></div>
      </div>
    </div>
  );
};

export default Login;
