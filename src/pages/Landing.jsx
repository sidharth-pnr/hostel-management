import React, {useState} from'react';
import {Link} from'react-router-dom';
import {motion, AnimatePresence} from'framer-motion';
import * as Icons from'../components/Icons';
import BackgroundEffect from'../components/BackgroundEffect';
import {animations} from'../components/SharedUI';

const Landing = () => {
 const [activeManual, setActiveManual] = useState('student');
 const {fadeIn, slideUp, staggerContainer} = animations;

 return (
 <div className="min-h-screen transition-colors duration-500 selection:bg-slate-900 selection:text-white overflow-x-hidden relative">
 <BackgroundEffect />
 
 <motion.nav initial={{y: -100, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{duration: 0.8, ease:"easeOut"}} className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
 <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/70 backdrop-blur-xl border border-slate-200/50 px-6 py-3 rounded-2xl shadow-sm">
 <div className="flex items-center gap-3">
 <motion.div whileHover={{rotate: 10, scale: 1.1}} className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg"><Icons.Building2 size={22} /></motion.div>
 <span className="text-xl font-black tracking-tight text-slate-900 uppercase">Campus <span className="text-slate-500 font-medium">Housing</span></span>
 </div>
 <div className="hidden md:flex items-center gap-8">{['about','process','how-to','contact'].map((item) => (<motion.a key={item} href={`#${item}`} whileHover={{y: -2}} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">{item.replace('-','')} System</motion.a>))}</div>
 <div className="flex items-center gap-4"><motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}><Link to="/login"className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-slate-900/10 block">Access Portal</Link></motion.div></div>
 </div>
 </motion.nav>

 <section className="relative min-h-screen flex items-center justify-center pt-32 pb-24 px-6 overflow-hidden">
 <div className="max-w-5xl mx-auto text-center relative">
 <motion.div initial="hidden"animate="show"variants={staggerContainer} className="relative z-10">
 <div className="backdrop-blur-[2px] py-10 px-4 rounded-[3rem]">
 <motion.div variants={slideUp} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100/50 backdrop-blur-md rounded-full mb-10 border border-slate-200/50"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span></span><span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-sans">Hostel Room And Complaint Management System</span></motion.div>
 <motion.h1 variants={slideUp} className="text-5xl md:text-7xl font-serif font-black text-slate-900 tracking-tight leading-[1.1]">Your Academic Journey, <br /><motion.span initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.8, duration: 1}} className="text-slate-400 italic">Supported by a Better Home.</motion.span></motion.h1>
 <motion.p variants={slideUp} className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed mt-10">Experience a seamless digital ecosystem for hostel room allocation and rapid grievance resolution at CE Trikaripur.</motion.p>
 <motion.div variants={slideUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-12">
 <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}><Link to="/register"className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20">Apply for Admission <Icons.ArrowRight size={18} /></Link></motion.div>
 <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}><Link to="/login"className="w-full sm:w-auto px-10 py-5 bg-white/50 backdrop-blur-md text-slate-900 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm">Resident Sign In</Link></motion.div>
 </motion.div>
 </div>
 </motion.div>
 </div>
 <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 1.5, duration: 1}} className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"><span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">Discover More</span><motion.div animate={{y: [0, 8, 0]}} transition={{duration: 2, repeat: Infinity}} className="w-px h-10 bg-gradient-to-b from-slate-400 to-transparent"/></motion.div>
 </section>

 <motion.section id="about"initial="hidden"whileInView="show"viewport={{once: true, margin:"-100px"}} variants={fadeIn} className="py-24 px-6 border-t border-slate-100">
 <div className="max-w-7xl mx-auto">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
 <motion.div variants={slideUp} className="relative group"><div className="absolute -inset-4 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"/><img src="https://www.cetkr.ac.in/images/hostel-3.jpg"alt="Modern Dormitory"className="relative rounded-[2.5rem] shadow-2xl w-full object-cover aspect-[4/3] transform group-hover:scale-[1.02] transition-transform duration-700"/><div className="absolute bottom-8 left-8 right-8 p-6 backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl text-white"><p className="text-sm font-bold opacity-90 italic">"Technology at the service of comfort. Our goal is to make campus living as easy as possible."</p></div></motion.div>
 <div className="space-y-8">
 <motion.div variants={slideUp} className="space-y-4"><h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Digital Living, <br/>Simplified & Transparent.</h2><motion.div initial={{width: 0}} whileInView={{width: 80}} transition={{duration: 1, delay: 0.5}} className="h-1.5 bg-slate-900 rounded-full"/></motion.div>
 <div className="space-y-6"><motion.p variants={slideUp} className="text-slate-500 text-lg leading-relaxed">Campus Housing is more than just a booking portal. It's a comprehensive management system designed to eliminate the friction of traditional hostel administration.</motion.p><motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6"><FeatureMiniCard title="Room Automation"desc="Auto-matching based on preference and block availability."/><FeatureMiniCard title="Ticket Lifecycle"desc="Track your complaint from'Pending'to'Resolved'in real-time."/></motion.div></div>
 </div>
 </div>
 </div>
 </motion.section>

 <motion.section id="process"initial="hidden"whileInView="show"viewport={{once: true}} variants={fadeIn} className="py-32 bg-slate-50">
 <div className="max-w-7xl mx-auto px-6 text-center">
 <motion.div variants={slideUp} className="mb-20"><h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">The Scholar's Path</h2><p className="text-slate-400 uppercase font-black tracking-[0.3em] text-[10px]">Your 4-Step Journey to Accommodation</p></motion.div>
 <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 <ProcessStep number="01"icon={Icons.GraduationCap} title="Identity Check"desc="Register using your University ID and academic details for verification."/>
 <ProcessStep number="02"icon={Icons.ShieldCheck} title="Warden Review"desc="Administrative team checks eligibility and grants residential portal access."/>
 <ProcessStep number="03"icon={Icons.Map} title="Smart Booking"desc="Browse the 3D block map and select your preferred bed space."/>
 <ProcessStep number="04"icon={Icons.MessageSquare} title="Concierge Care"desc="Our maintenance team is one click away via the ticketing system."/>
 </motion.div>
 </div>
 </motion.section>

 <motion.section initial="hidden"whileInView="show"viewport={{once: true}} variants={fadeIn} className="py-24 px-6 bg-white">
 <div className="max-w-4xl mx-auto">
 <motion.div variants={slideUp} className="bg-slate-900 text-white rounded-[3rem] p-12 md:p-16 relative overflow-hidden shadow-2xl">
 <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"/><div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full -ml-32 -mb-32 blur-3xl"/>
 <div className="relative z-10 space-y-10">
 <div className="text-center"><motion.div animate={{y: [0, -10, 0]}} transition={{duration: 4, repeat: Infinity}}><Icons.UserPlus className="mx-auto mb-6 text-teal-400"size={48} /></motion.div><h2 className="text-3xl font-black tracking-tight mb-4">What you'll need to register</h2><p className="text-slate-400 text-sm uppercase font-black tracking-widest">Preparation Guide</p></div>
 <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-8"><PrepItem num="1"title="University ID"desc="Your official registration number provided by CE Trikaripur."/><PrepItem num="2"title="Valid Email"desc="Required for account security and important notifications."/><PrepItem num="3"title="Academic Year"desc="Your current semester and year of study for block priority."/><PrepItem num="4"title="Department Info"desc="Helps us organize residents by faculty for community events."/></motion.div>
 <div className="pt-6 flex justify-center"><motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}><Link to="/register"className="group flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Start Registration Now <Icons.ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/></Link></motion.div></div>
 </div>
 </motion.div>
 </div>
 </motion.section>

 <motion.section id="how-to"initial="hidden"whileInView="show"viewport={{once: true}} variants={fadeIn} className="py-24 px-6 bg-slate-50">
 <div className="max-w-7xl mx-auto">
 <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"><motion.div variants={slideUp} className="space-y-4"><h2 className="text-4xl font-black text-slate-900 tracking-tight">How to use the platform</h2><p className="text-slate-400 uppercase font-black tracking-[0.3em] text-[10px]">A step-by-step operational guide</p></motion.div><motion.div variants={slideUp} className="flex bg-white p-1.5 rounded-2xl border border-slate-200"><button onClick={() => setActiveManual('student')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeManual ==='student'?'bg-slate-900 text-white shadow-lg':'text-slate-400 hover:text-slate-600'}`}>For Residents</button><button onClick={() => setActiveManual('warden')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeManual ==='warden'?'bg-slate-900 text-white shadow-lg':'text-slate-400 hover:text-slate-600'}`}>For Wardens</button></motion.div></div>
 <AnimatePresence mode="wait"><motion.div key={activeManual} initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} transition={{duration: 0.5}} className="grid grid-cols-1 md:grid-cols-3 gap-8">{activeManual ==='student'? (<><ManualCard icon={Icons.ListChecks} title="Step 1: Check-In"desc="Log in and check your'Desk'for the status of your admission approval."/><ManualCard icon={Icons.Map} title="Step 2: Room Selection"desc="Once approved, head to'Stay'to browse available rooms and blocks."/><ManualCard icon={Icons.MessageSquare} title="Step 3: Support"desc="Need something fixed? Go to'Support'to create a high-priority ticket."/></>) : (<><ManualCard icon={Icons.UserPlus} title="Step 1: Approvals"desc="Review pending scholar applications in the'New Scholars'tab."/><ManualCard icon={Icons.ShieldCheck} title="Step 2: Monitoring"desc="Use the'Overview'dashboard to track hostel occupancy and urgent issues."/><ManualCard icon={Icons.Clock} title="Step 3: Resolution"desc="View grievances, assign staff, and mark tickets as'Resolved'when complete."/></>)}</motion.div></AnimatePresence>
 </div>
 </motion.section>

 <motion.section id="contact"initial="hidden"whileInView="show"viewport={{once: true}} variants={fadeIn} className="py-32 px-6 bg-white">
 <div className="max-w-7xl mx-auto">
 <motion.div variants={slideUp} className="bg-slate-50 rounded-[3.5rem] border border-slate-100 p-8 md:p-20 relative overflow-hidden">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
 <div className="space-y-8"><div className="space-y-4"><h2 className="text-4xl font-black text-slate-900 tracking-tight">Get in touch with us</h2><p className="text-slate-50 font-medium">Our administrative team is here to assist you with any housing queries or technical difficulties.</p></div><motion.div variants={staggerContainer} className="space-y-6"><ContactItem icon={Icons.Mail} label="Administrative Support"value="housing.support@cet.ac.in"/><ContactItem icon={Icons.Phone} label="Warden's Office"value="+91 467 2250311"/><ContactItem icon={Icons.MapPin} label="Office Location"value="Admin Block, CE Trikaripur, Kerala"/></motion.div></div>
 <motion.div whileHover={{y: -5}} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl"><Icons.HelpCircle className="text-slate-900 mb-6"size={32} /><h3 className="text-xl font-bold text-slate-900 mb-4 font-serif">Frequently Asked?</h3><div className="space-y-4"><FAQMini question="Lost your password?"answer="Contact the Chief Warden's office with your University ID for a secure reset."/><FAQMini question="Emergency after hours?"answer="Call the 24/7 security desk at Ext. 101 for immediate assistance."/></div></motion.div>
 </div>
 </motion.div>
 </div>
 </motion.section>

 <footer className="py-12 px-6 border-t border-slate-100 text-center"><div className="max-w-7xl mx-auto"><motion.div animate={{opacity: [0.3, 0.6, 0.3]}} transition={{duration: 4, repeat: Infinity}} className="flex items-center justify-center gap-3 mb-6 grayscale"><Icons.Building2 size={20} /><span className="text-sm font-black uppercase tracking-widest text-slate-900">Campus Housing</span></motion.div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Official System of College of Engineering Trikaripur • Designed by Group 15 • 2026</p></div></footer>
 </div>
 );
};

const FeatureMiniCard = ({title, desc}) => (<motion.div variants={{hidden: {y: 20, opacity: 0}, show: {y: 0, opacity: 1}}} whileHover={{y: -5, borderColor:'rgb(20, 184, 166)'}} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 transition-all"><Icons.CheckCircle2 className="text-teal-500 mb-3"size={24} /><h4 className="font-bold text-slate-900 mb-1">{title}</h4><p className="text-xs text-slate-500 font-medium">{desc}</p></motion.div>);
const ProcessStep = ({number, icon: Icon, title, desc}) => (<motion.div variants={{hidden: {y: 30, opacity: 0}, show: {y: 0, opacity: 1}}} className="relative p-10 bg-white rounded-[3rem] border border-slate-200/60 shadow-sm group hover:shadow-xl transition-all duration-500 hover:-translate-y-2"><div className="absolute top-6 right-8 text-4xl font-black text-slate-100 transition-colors group-hover:text-slate-200">{number}</div><div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:rotate-12 transition-transform"><Icon size={24} /></div><h3 className="text-xl font-black text-slate-900 mb-4 leading-tight">{title}</h3><p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p></motion.div>);
const PrepItem = ({num, title, desc}) => (<motion.div variants={{hidden: {x: -20, opacity: 0}, show: {x: 0, opacity: 1}}} className="flex items-start gap-4"><div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 font-bold">{num}</div><div><h4 className="font-bold mb-1">{title}</h4><p className="text-slate-400 text-xs leading-relaxed">{desc}</p></div></motion.div>);
const ManualCard = ({icon: Icon, title, desc}) => (<motion.div whileHover={{y: -5, scale: 1.02}} className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"><div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Icon size={24} /></div><h4 className="font-black text-slate-900 uppercase tracking-wider text-sm mb-3">{title}</h4><p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p></motion.div>);
const ContactItem = ({icon: Icon, label, value}) => (<motion.div variants={{hidden: {y: 10, opacity: 0}, show: {y: 0, opacity: 1}}} className="flex items-center gap-5"><div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm"><Icon size={20} /></div><div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p><p className="text-sm font-bold text-slate-900">{value}</p></div></motion.div>);
const FAQMini = ({question, answer}) => (<div className="space-y-2"><div className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-500"/>{question}</div><p className="text-xs text-slate-500 font-medium leading-relaxed pl-3.5">{answer}</p></div>);

export default Landing;

