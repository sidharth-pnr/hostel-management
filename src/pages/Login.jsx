import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as Icons from '../components/Icons';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE, isSuccess } from '../config';
import { AuthVisualSide, Input, PrimaryButton, GlassBox } from '../components/SharedUI';
import BackgroundEffect from '../components/BackgroundEffect';

const Login = ({ setUser }) => {
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
      if (isSuccess(res)) {
        toast.success(`Welcome back, ${res.data.user.name}`);
        const userWithRole = { ...res.data.user, role: role === 'admin' ? res.data.user.role : 'student' };
        setUser(userWithRole);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        navigate(role === 'admin' ? '/admin' : '/student');
      } else {
        toast.error(res.data.error || "Access Denied: Invalid Credentials");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Connection Error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white transition-colors duration-500 overflow-hidden fixed inset-0">
      <AuthVisualSide 
        image="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        quote="Precision in management,"
        author="comfort in living."
        subtitle="The official residential gateway for the College of Engineering community."
      />

      <div className="w-full lg:w-[40%] flex flex-col h-full bg-white relative z-10">
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 py-4">
          <div className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl flex items-center justify-center text-white shadow-lg transform hover:rotate-12 transition-transform">
                <Icons.Building2 size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Portal <span className="text-blue-600 font-medium">Access</span></h1>
                <p className="text-slate-500 font-medium text-[11px] uppercase tracking-widest">Authorized Entry Only</p>
              </div>
            </div>

            <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
              {['student', 'admin'].map(r => (
                <button 
                  key={r} 
                  type="button"
                  onClick={() => setRole(r)} 
                  className={`flex-1 py-2.5 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    role === r 
                      ? 'bg-white shadow-sm text-blue-600 border border-white' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {r === 'admin' ? <Icons.Shield size={12} /> : <Icons.User size={12} />} 
                  {r === 'admin' ? 'Warden' : 'Student'}
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <Input 
                  label={role === 'admin' ? "Username" : "University ID"} 
                  placeholder={role === 'admin' ? "e.g. WARDEN_01" : "e.g. TKR23CS101"} 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  autoComplete="username"
                />
                <Input 
                  label="Password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  autoComplete="current-password"
                />
              </div>
              <PrimaryButton 
                isLoading={isLoading} 
                loadingText="Validating..."
                icon={Icons.ArrowRight}
              >
                Sign In
              </PrimaryButton>
            </form>
            
            <div className="pt-6 border-t border-slate-50 text-center">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                New to College Hostel? 
                <Link to="/register" className="text-blue-600 font-black hover:underline underline-offset-4 ml-2">Register Now</Link>
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 text-center">
          <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-400">Secure Housing Protocol • Group 15</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
