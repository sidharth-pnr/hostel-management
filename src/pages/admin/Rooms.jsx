import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import * as Icons from '../../components/Icons';
import { useOutletContext } from 'react-router-dom';
import { adminService } from '../../services/api';
import { GlassBox, Input, Select } from '../../components/SharedUI';
import { motion, AnimatePresence } from 'framer-motion';

const RoomManagement = () => {
  const { user, setIsHeaderVisible } = useOutletContext() || {};
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({ block: '', room_number: '', capacity: 3, price: '' });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [occupants, setOccupants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hide header when modal is open
  useEffect(() => {
    if (selectedRoom) {
      setIsHeaderVisible?.(false);
    } else {
      setIsHeaderVisible?.(true);
    }
    return () => setIsHeaderVisible?.(true);
  }, [selectedRoom, setIsHeaderVisible]);

  // Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // All, Available, Full
  const [sortBy, setSortBy] = useState('room_number'); // room_number, price, occupancy

  const fetchRooms = async () => {
    try {
      const res = await adminService.getRooms();
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Inventory sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const addRoom = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Configuring room...");
    try {
      await adminService.addRoom(newRoom, user);
      toast.dismiss(loadingToast);
      toast.success("Infrastructure Updated!");
      fetchRooms();
      setNewRoom({ block: '', room_number: '', capacity: 3, price: '' });
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to add room");
    }
  };

  const deleteRoom = async (id) => {
    if (user?.role !== 'SUPER') {
      toast.error("Access Denied: Only Super Admins can decommission rooms");
      return;
    }
    if (!window.confirm("Permanently decommission this room configuration?")) return;
    try {
      await adminService.deleteRoom(id, user);
      toast.success("Room Removed");
      fetchRooms();
    } catch (err) {
      toast.error(err.message || "Deletion failed");
    }
  };

  const viewOccupants = (room) => {
    setSelectedRoom(room);
    setOccupants([]);
    adminService.getRoomOccupants(room.room_id)
      .then(res => setOccupants(Array.isArray(res.data) ? res.data : []));
  };

  const stats = useMemo(() => {
    const total = rooms.length;
    const capacity = rooms.reduce((acc, r) => acc + parseInt(r.capacity || 0), 0);
    const occupied = rooms.reduce((acc, r) => acc + parseInt(r.current_occupancy || 0), 0);
    return { total, capacity, occupied, available: capacity - occupied };
  }, [rooms]);

  const filteredAndSortedRooms = useMemo(() => {
    let result = [...rooms];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => r.room_number.toString().toLowerCase().includes(term) || r.block.toLowerCase().includes(term));
    }
    if (filterStatus === 'Available') result = result.filter(r => parseInt(r.current_occupancy) < parseInt(r.capacity));
    else if (filterStatus === 'Full') result = result.filter(r => parseInt(r.current_occupancy) >= parseInt(r.capacity));
    result.sort((a, b) => {
      if (sortBy === 'price') return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === 'occupancy') return parseInt(b.current_occupancy) - parseInt(a.current_occupancy);
      return a.room_number.localeCompare(b.room_number, undefined, { numeric: true });
    });
    return result;
  }, [rooms, searchTerm, filterStatus, sortBy]);

  const roomsByBlock = useMemo(() => {
    const map = {};
    filteredAndSortedRooms.forEach(r => {
      if (!map[r.block]) map[r.block] = [];
      map[r.block].push(r);
    });
    return map;
  }, [filteredAndSortedRooms]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 opacity-20">
      <Icons.Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
      <p className="text-xs font-bold uppercase tracking-[0.3em]">Syncing Room Inventory...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard icon={Icons.Home} label="Total Rooms" value={stats.total} trend="Across all blocks" color="blue" />
        <MetricCard icon={Icons.Users} label="Bed Capacity" value={stats.capacity} trend="Maximum limit" color="teal" />
        <MetricCard icon={Icons.UserCheck} label="Beds Occupied" value={stats.occupied} trend="Active residents" color="orange" />
        <MetricCard icon={Icons.UserMinus} label="Beds Available" value={stats.available} trend="Ready for allocation" color="indigo" />
      </div>

      {/* Filter Bar */}
      <GlassBox className="p-4 flex flex-col xl:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <Input 
            placeholder="Search by Room or Block..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Icons.Search}
            className="!space-y-0"
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <Select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'All', label: 'All Blocks' },
              { value: 'Available', label: 'Available' },
              { value: 'Full', label: 'Full Capacity' }
            ]}
            className="min-w-[160px]"
          />
          <Select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'room_number', label: 'Sort: Room' },
              { value: 'price', label: 'Sort: Price' },
              { value: 'occupancy', label: 'Sort: Occupancy' }
            ]}
            className="min-w-[160px]"
          />
        </div>
      </GlassBox>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-8 space-y-12">
          {Object.entries(roomsByBlock).length > 0 ? Object.entries(roomsByBlock).sort().map(([block, blockRooms]) => (
            <div key={block} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-black shadow-lg">
                    {block}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">Block {block}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Infrastructure Wing</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white/50 px-4 py-1.5 rounded-full border border-white">
                  {blockRooms.length} Rooms • {blockRooms.reduce((a, r) => a + parseInt(r.capacity), 0)} Beds
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {blockRooms.map((room) => (
                    <motion.div key={room.room_id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                      <RoomCard room={room} onView={() => viewOccupants(room)} onDelete={() => deleteRoom(room.room_id)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center flex flex-col items-center opacity-40">
              <Icons.Search size={48} className="mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">No hostel blocks found</p>
            </div>
          )}
        </div>

        {user?.role === 'SUPER' && (
          <div className="xl:col-span-4 sticky top-32">
            <GlassBox className="p-8 group">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Room Console</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure New Accommodation</p>
                </div>
                <div className="p-3 bg-slate-100 text-blue-600 rounded-2xl group-hover:rotate-12 transition-transform">
                  <Icons.Plus size={24} />
                </div>
              </div>
              <form onSubmit={addRoom} className="space-y-6">
                <Input label="Block ID" placeholder="e.g. A" required value={newRoom.block} onChange={e => setNewRoom({ ...newRoom, block: e.target.value.toUpperCase() })} />
                <Input label="Room Number" placeholder="e.g. 101" required value={newRoom.room_number} onChange={e => setNewRoom({ ...newRoom, room_number: e.target.value })} />
                <Input label="Beds (Capacity)" type="number" required value={newRoom.capacity} onChange={e => setNewRoom({ ...newRoom, capacity: e.target.value })} />
                <Input label="Semester Price (CASH)" type="number" placeholder="e.g. 5000" required value={newRoom.price} onChange={e => setNewRoom({ ...newRoom, price: e.target.value })} />
                <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-slate-950 shadow-lg shadow-slate-900/20 transition-all active:scale-95">
                  <Icons.ShieldCheck size={18} /> Initialize Room
                </button>
              </form>
            </GlassBox>
          </div>
        )}
      </div>

      {/* Occupants Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Room {selectedRoom.room_number}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[9px] font-bold uppercase tracking-widest">Block {selectedRoom.block}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Manifest</span>
                  </div>
                </div>
                <button onClick={() => setSelectedRoom(null)} className="p-3 bg-white text-slate-400 hover:text-red-500 rounded-2xl transition-all shadow-sm">
                  <Icons.X size={20} />
                </button>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar">
                {occupants.length > 0 ? (
                  <div className="space-y-4">
                    {occupants.map((s, i) => (
                      <div key={i} className="flex items-center gap-5 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white transition-all">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                          {(s.name || "?").charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 leading-tight truncate">{s.name || "Unknown Scholar"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.reg_no}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{s.department}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center opacity-30">
                    <Icons.UserMinus size={48} className="mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">Residential room is currently vacant</p>
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">End of Resident Manifest</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, trend, color }) => (
  <GlassBox className="p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        color === 'blue' ? 'bg-slate-100 text-blue-600' :
        color === 'teal' ? 'bg-teal-50 text-teal-600' :
        color === 'orange' ? 'bg-orange-50 text-orange-600' :
        'bg-indigo-50 text-indigo-600'
      }`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h4 className="text-2xl font-black text-slate-800">{value}</h4>
      <p className="text-[10px] font-medium text-slate-500">{trend}</p>
    </div>
  </GlassBox>
);

const RoomCard = ({ room, onView, onDelete }) => {
  const percent = Math.round((room.current_occupancy / room.capacity) * 100);
  const isFull = room.current_occupancy >= room.capacity;
  return (
    <GlassBox className="p-6 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <h4 className="text-3xl font-black text-slate-800 tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
            {room.room_number}
          </h4>
          <span className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-widest">CASH {room.price}</span>
        </div>
        <button onClick={onDelete} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
          <Icons.Trash2 size={18} />
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Occupancy</div>
          <div className={`text-[10px] font-black ${isFull ? 'text-red-500' : 'text-blue-600'}`}>
            {room.current_occupancy} / {room.capacity}
          </div>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className={`h-full transition-all duration-1000 ${isFull ? 'bg-red-500' : 'bg-slate-900'}`} />
        </div>
      </div>
      {parseInt(room.current_occupancy) > 0 && (
        <button onClick={onView} className="mt-6 w-full py-2.5 bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg active:scale-95">
          <Icons.Eye size={14} /> View Residents
        </button>
      )}
    </GlassBox>
  );
};

export default RoomManagement;
