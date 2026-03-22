import React from 'react';
import * as Icons from '../../components/Icons';
import { motion } from 'framer-motion';
import BackgroundEffect from '../../components/BackgroundEffect';
import { GlassCard, PageHeader, InfoNode } from '../../components/student/StudentShared';

const StudentAbout = () => {
  const slideUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-700 max-w-6xl mx-auto px-4">
      <BackgroundEffect />

      <PageHeader 
        title="About the Project." 
        subtitle="The Campus Nest is a digital system designed to make hostel life easier. We help students book rooms and report problems directly to the management."
        badge="System Version 2.4.0"
        badgeIcon={Icons.Cpu}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div variants={slideUp} initial="hidden" animate="show" className="space-y-6">
          <div className="flex items-center gap-3 px-2"><Icons.Terminal size={18} className="text-blue-500" /><h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Contact Support</h3></div>
          <div className="grid gap-4">
            <GlassCard p="p-6" className="group hover:border-blue-500/30 transition-all cursor-default"><InfoNode label="Warden's Office" value="warden.ops@campus.edu" icon={Icons.Mail} color="blue" /></GlassCard>
            <GlassCard p="p-6" className="group hover:border-blue-500/30 transition-all cursor-default"><InfoNode label="Technical Support" value="support.systems@campus.edu" icon={Icons.Database} color="indigo" /></GlassCard>
          </div>
        </motion.div>

        <motion.div variants={slideUp} initial="hidden" animate="show" className="space-y-6">
          <div className="flex items-center gap-3 px-2"><Icons.Globe size={18} className="text-teal-500" /><h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Important Links</h3></div>
          <GlassCard p="p-6" className="space-y-1">
            <PortalLink label="Main University Site" />
            <PortalLink label="Hostel Rule Book" />
            <PortalLink label="Student Handbook 2024" />
            <PortalLink label="Privacy Policy" />
          </GlassCard>
        </motion.div>
      </div>

      <motion.section variants={slideUp} initial="hidden" animate="show" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000"><Icons.Zap size={180} /></div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-2"><p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-60">System Status</p><h3 className="text-3xl font-black tracking-tighter uppercase">Network Status.</h3></div>
          <p className="text-xs font-bold opacity-70 max-w-md uppercase tracking-widest leading-relaxed">All rooms and systems are connected. The hostel network is currently 100% active.</p>
          <div className="flex items-center gap-4 pt-4"><div className="h-1 flex-1 bg-white/20 dark:bg-slate-900/20 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} className="h-full bg-blue-500" /></div><span className="text-[10px] font-black tracking-widest">SECURED</span></div>
        </div>
      </motion.section>

      <footer className="pt-10 text-center opacity-30"><div className="flex items-center justify-center gap-4 mb-4"><div className="h-px w-12 bg-slate-400" /><Icons.ShieldCheck size={16} /><div className="h-px w-12 bg-slate-400" /></div><p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-500">Developed by Group 15 • Official Hostel System</p></footer>
    </div>
  );
};

const PortalLink = ({ label }) => (
  <a href="#" className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group">
    <span className="text-xs font-black text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-widest transition-colors flex items-center gap-3"><Icons.ChevronRight size={14} className="text-blue-500 group-hover:translate-x-1 transition-transform" />{label}</span>
    <Icons.ArrowUpRight size={16} className="text-slate-300 dark:text-slate-700 group-hover:text-blue-500 transition-colors" />
  </a>
);

export default StudentAbout;
