import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowRight, ShieldCheck, UserCircle, ChevronLeft, Quote } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import { API_BASE } from '../config';

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
        const userWithRole = { 
          ...res.data.user, 
          role: role === 'admin' ? res.data.user.role : 'student' 
        };
        setUser(userWithRole);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        navigate(role === 'admin' ? '/admin' : '/student');
      } else { 
        toast.error(res.data.error || "Access Denied: Invalid Credentials"); 
      }
    } catch (err) { 
      toast.dismiss(loadingToast);
      toast.error('Connection Error. Check your server status.'); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden fixed inset-0">
      
      {/* LEFT SIDE: CINEMATIC VISUAL (60%) */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-slate-900 h-full">
        <img 
          src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Campus Architecture" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 animate-ken-burns scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
        
        <div className="absolute bottom-16 left-16 right-16 space-y-4 animate-slide-up">
          <div className="w-10 h-1 bg-white rounded-full opacity-50" />
          <div className="relative">
            <Quote className="absolute -top-8 -left-8 w-16 h-16 text-white/5" />
            <h2 className="text-4xl font-serif font-black text-white leading-tight tracking-tight max-w-xl">
              Precision in management, <br/>
              <span className="text-slate-400 italic font-medium">comfort in living.</span>
            </h2>
          </div>
          <p className="text-slate-400 font-medium text-base max-w-md">
            The official residential gateway for the College of Engineering Trikaripur community.
          </p>
        </div>

        <div className="absolute bottom-8 left-16 flex items-center gap-2 text-white/20">
          <Building2 size={14} />
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">Campus Housing Secure Protocol</span>
        </div>
      </div>

      {/* RIGHT SIDE: PORTAL CONSOLE (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col h-full bg-white dark:bg-slate-950">
        
        {/* Navigation & Controls - Compact */}
        <div className="p-6 flex justify-between items-center w-full">
          <Link to="/" className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
            <ChevronLeft size={18} />
            <span className="text-[9px] font-black uppercase tracking-widest">Back to Home</span>
          </Link>
          <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 py-4">
          <div className="w-full max-w-sm mx-auto space-y-8 animate-slide-up">
            
            {/* Branding - Smaller */}
            <div className="space-y-3">
              <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 shadow-xl transform hover:rotate-12 transition-transform">
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Portal <span className="text-slate-400 font-medium">Access</span></h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-[13px]">Authorized residential entry</p>
              </div>
            </div>

            {/* Role Switcher - Tighter */}
            <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <button 
                onClick={() => setRole('student')} 
                className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${role === 'student' ? 'bg-white dark:bg-slate-800 shadow-lg text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <UserCircle size={12} /> Student
              </button>
              <button 
                onClick={() => setRole('admin')} 
                className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${role === 'admin' ? 'bg-white dark:bg-slate-800 shadow-lg text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ShieldCheck size={12} /> Warden
              </button>
            </div>

            {/* Form - Tighter spacing */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {role === 'admin' ? "Username" : "University ID"}
                  </label>
                  <input 
                    type="text" required 
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold text-sm" 
                    placeholder={role === 'admin' ? "e.g. WARDEN_01" : "e.g. TKR23CS101"} 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    type="password" required 
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold text-sm" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                  />
                </div>
              </div>
              
              <button 
                disabled={isLoading}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10"
              >
                {isLoading ? "Validating..." : "Sign In"}
                {!isLoading && <ArrowRight size={16} />}
              </button>
            </form>
            
            <div className="pt-6 border-t border-slate-50 dark:border-slate-900 text-center">
              <p className="text-[11px] font-bold text-slate-400">
                New to College Hostel? <Link to="/register" className="text-slate-900 dark:text-white font-black hover:underline decoration-2 underline-offset-4 ml-1">Register Now</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Minimum padding */}
        <div className="p-6 text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-200 dark:text-slate-800">
             Campus Housing • Secure Protocol • Group 15
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
