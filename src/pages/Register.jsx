import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import toast from 'react-hot-toast';
import * as Icons from '../components/Icons';
import { isSuccess } from '../config';
import { AuthVisualSide, Input, Select, PrimaryButton, GlassBox } from '../components/SharedUI';
import BackgroundEffect from '../components/BackgroundEffect';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', reg_no: '', department: 'CSE', year: '1', phone: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation logic
    if (!formData.name.trim()) return toast.error("Please enter your full name");
    if (!formData.phone || formData.phone.length !== 10) return toast.error("Phone number must be 10 digits");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    setIsLoading(true);
    const loadingToast = toast.loading("Processing admission request...");
    try {
      const res = await authService.register(formData);
      toast.dismiss(loadingToast);
      if (isSuccess(res)) {
        toast.success("Registration Successful."); 
        navigate('/login'); 
      } else {
        toast.error(res.data.error || "Registration failed");
      }
    } catch (err) {
      toast.dismiss(loadingToast); 
      toast.error(err.message || "Network error"); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white transition-colors duration-500 overflow-hidden fixed inset-0">
      <AuthVisualSide 
        image="https://media.istockphoto.com/id/917609832/photo/man-pulling-suitcase-and-entering-hotel-room-traveler-going-in-to-room-or-walking-inside-motel.jpg?s=612x612&w=0&k=20&c=EJoJW4VqwIhl1rRlu5FnPuyqylnKIX1mPgW2WpIWap0="
        quote="A community built on"
        author="excellence & synergy."
        subtitle="Join the official residential registry of the College of Engineering community."
      />

      <div className="w-full lg:w-[40%] flex flex-col h-full bg-white relative z-10">
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-4">
          <div className="w-full max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-3 text-center sm:text-left">
              <div className="flex items-center gap-3 px-3 py-1.5 bg-blue-50 w-fit rounded-full border border-blue-100 mx-auto sm:mx-0">
                <Icons.Sparkles size={12} className="text-blue-600"/>
                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600">Student Register</span>
              </div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                New <span className="text-blue-600">Admission</span>
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input 
                  label="Full Legal Name" 
                  placeholder="Enter your name" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  required 
                  autoComplete="name"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="University ID" 
                    placeholder="TKR23..." 
                    value={formData.reg_no} 
                    onChange={e => setFormData({ ...formData, reg_no: e.target.value })} 
                    required 
                    autoComplete="username"
                  />
                  <Input 
                    label="Contact No" 
                    type="tel" 
                    placeholder="10-digit" 
                    value={formData.phone} 
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, ''); 
                      if (v.length <= 10) setFormData({ ...formData, phone: v });
                    }} 
                    required 
                    autoComplete="tel"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select 
                    label="Department" 
                    value={formData.department} 
                    onChange={e => setFormData({ ...formData, department: e.target.value })} 
                    options={['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'DS']} 
                  />
                  <Select 
                    label="Year of Study" 
                    value={formData.year} 
                    onChange={e => setFormData({ ...formData, year: e.target.value })} 
                    options={[
                      { value: '1', label: '1st Year' },
                      { value: '2', label: '2nd Year' },
                      { value: '3', label: '3rd Year' },
                      { value: '4', label: '4th Year' }
                    ]} 
                  />
                </div>
                <Input 
                  label="Secure Password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={e => setFormData({ ...formData, password: e.target.value })} 
                  required 
                  autoComplete="new-password"
                />
              </div>
              <PrimaryButton 
                isLoading={isLoading} 
                loadingText="Synchronizing..."
                icon={Icons.CheckCircle}
              >
                Submit Registry Request
              </PrimaryButton>
            </form>
            
            <div className="pt-6 border-t border-slate-50 text-center">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                Already a Member? 
                <Link to="/login" className="text-blue-600 font-black hover:underline underline-offset-4 ml-2">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-400">Security Standard Protocol • Group 15</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
