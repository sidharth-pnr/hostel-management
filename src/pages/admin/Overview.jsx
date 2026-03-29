import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/api';
import * as Icons from '../../components/Icons';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { NavLink, useOutletContext } from 'react-router-dom';
import { COLORS } from '../../config';
import { GlassBox, StatusBadge } from '../../components/SharedUI';

const Overview = () => {
  const { user } = useOutletContext() || {};
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Data fetching
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await adminService.getStats();
      return res.data;
    },
    refetchInterval: 60000,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: async () => {
      const res = await adminService.getRooms();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const blocks = useMemo(() => {
    const map = {};
    rooms.forEach(r => {
      if (!map[r.block]) map[r.block] = { total: 0, occupied: 0 };
      map[r.block].total += parseInt(r.capacity);
      map[r.block].occupied += parseInt(r.current_occupancy);
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      ...data,
      percent: Math.round((data.occupied / data.total) * 100) || 0
    }));
  }, [rooms]);

  if (!stats) return (
    <div className="flex flex-col items-center justify-center py-20 opacity-20">
      <Icons.Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
      <p className="text-xs font-bold uppercase tracking-[0.3em]">Syncing Admin Console...</p>
    </div>
  );

  const { counts, departments, complaints_dist, recent_complaints } = stats;

  return (
    <div className="animate-in fade-in duration-700">
      
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard 
          icon={Icons.Users} 
          label="Total Students" 
          value={counts?.total_students} 
          trend="+2 this week"
          color="blue"
        />
        <MetricCard 
          icon={Icons.Home} 
          label="Occupancy" 
          value={`${counts?.occupancy_rate}%`} 
          trend={`${counts?.total_occupied} / ${counts?.total_capacity} beds`}
          color="teal"
        />
        <MetricCard 
          icon={Icons.UserPlus} 
          label="Pending Admissions" 
          value={counts?.pending_students} 
          trend="Needs review"
          color="orange"
          alert={counts?.pending_students > 0}
        />
        <MetricCard 
          icon={Icons.AlertCircle} 
          label="Active Complaints" 
          value={counts?.high_priority} 
          trend="Priority tickets"
          color="red"
          alert={counts?.high_priority > 0}
        />
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 auto-rows-min">
        
        {/* Infrastructure Heatmap */}
        <GlassBox className="lg:col-span-3 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Infrastructure Map</h3>
              <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Real-time block density</p>
            </div>
            <Icons.Building size={20} className="text-slate-300" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {blocks.map((block, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/60 transition-all group">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Block {block.name}</p>
                <div className="flex items-end justify-between mb-2">
                  <h4 className="text-2xl font-black text-slate-800 leading-none">{block.percent}%</h4>
                  <p className="text-[10px] font-bold text-slate-500">{block.occupied}/{block.total}</p>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${block.percent}%` }}
                    className={`h-full ${block.percent > 90 ? 'bg-red-500' : block.percent > 70 ? 'bg-orange-500' : 'bg-slate-900'}`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassBox>

        {/* Resolution Map */}
        <GlassBox className="lg:col-span-1 p-8 flex flex-col items-center">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 self-start">Resolution Map</h3>
          <div className="relative w-full h-[180px] min-h-[180px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie 
                    data={(complaints_dist || []).map(d => ({ ...d, value: Number(d.value) }))} 
                    cx="50%" cy="50%" 
                    innerRadius={55} outerRadius={75} 
                    paddingAngle={5} 
                    dataKey="value" 
                    stroke="none"
                  >
                    {(complaints_dist || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-black text-slate-800">{(complaints_dist || []).reduce((acc, curr) => acc + Number(curr.value || 0), 0)}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
            </div>
          </div>
          <div className="w-full mt-6 space-y-2">
            {(complaints_dist || []).slice(0, 3).map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-500">{entry.name}</span>
                </div>
                <span className="text-slate-800">{entry.value}</span>
              </div>
            ))}
          </div>
        </GlassBox>

        {/* Maintenance Queue */}
        <GlassBox className="lg:col-span-2 p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Maintenance Queue</h3>
            <NavLink to="/admin/complaints" className="text-[10px] font-bold text-blue-600 uppercase hover:underline">View All</NavLink>
          </div>
          <div className="space-y-3">
            {recent_complaints?.slice(0, 4).map((comp, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/40 border border-white/60 rounded-2xl hover:bg-white/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${comp.priority === 'Urgent' ? 'bg-red-500 animate-pulse' : 'bg-slate-900'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{comp.title}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{comp.student_name}</p>
                  </div>
                </div>
                <StatusBadge status={comp.status} />
              </div>
            ))}
          </div>
        </GlassBox>

        {/* Academic Composition */}
        <GlassBox className="lg:col-span-2 p-8">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Student Distribution</h3>
          <div className="h-[200px] min-h-[200px] w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={departments || []}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                    {(departments || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassBox>

      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, trend, color, alert }) => (
  <GlassBox className={`p-6 relative overflow-hidden ${alert ? 'border-orange-200 bg-orange-50/20' : ''}`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        color === 'blue' ? 'bg-slate-100 text-blue-600' :
        color === 'teal' ? 'bg-teal-50 text-teal-600' :
        color === 'orange' ? 'bg-orange-50 text-orange-600' :
        'bg-red-50 text-red-600'
      }`}>
        <Icon size={20} />
      </div>
      {alert && <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />}
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h4 className="text-2xl font-black text-slate-800">{value}</h4>
      <p className="text-[10px] font-medium text-slate-500">{trend}</p>
    </div>
  </GlassBox>
);

export default Overview;
