import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  PlusCircle, Trash2, Home, Users, MapPin, 
  Eye, X, Building2, UserCheck, UserMinus, Activity,
  ShieldCheck, Info, Search, Filter, ArrowUpDown
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { API_BASE } from '../../config';

const RoomManagement = () => {
  const { user } = useOutletContext() || {};
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({ block: '', room_number: '', capacity: 3, price: '' });
  const [selectedRoom, setSelectedRoom] = useState(null); 
  const [occupants, setOccupants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // All, Available, Full
  const [sortBy, setSortBy] = useState('room_number'); // room_number, price, occupancy
  
  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_BASE}/manage_rooms.php`);
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Inventory sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);
  
  const addRoom = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Configuring room...");
    try {
      const res = await axios.post(`${API_BASE}/manage_rooms.php`, {
        ...newRoom,
        admin_name: user?.name,
        admin_role: user?.role
      });
      toast.dismiss(loadingToast);
      if (res.data.status === 'Success') { 
        toast.success("Infrastructure Updated!"); 
        fetchRooms(); 
        setNewRoom({ block: '', room_number: '', capacity: 3, price: '' }); 
      } else { 
        toast.error(res.data.error || "Failed to add room"); 
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Connection error");
    }
  };
  
  const deleteRoom = async (id) => {
    if(!window.confirm("Permanently decommission this room configuration?")) return;
    try {
      const res = await axios.post(`${API_BASE}/manage_rooms.php`, { 
        action: 'delete', 
        room_id: id,
        admin_name: user?.name,
        admin_role: user?.role
      });
      if (res.data.status === 'Success') {
        toast.success("Unit Removed");
        fetchRooms();
      } else {
        toast.error(res.data.error || "Deletion failed");
      }
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const viewOccupants = (room) => {
    setSelectedRoom(room);
    setOccupants([]); 
    axios.get(`${API_BASE}/get_data.php?type=room_occupants&room_id=${room.room_id}`)
      .then(res => setOccupants(Array.isArray(res.data) ? res.data : []));
  };

  // --- ANALYTICS, FILTERING & SORTING ---
  const stats = useMemo(() => {
    const total = rooms.length;
    const capacity = rooms.reduce((acc, r) => acc + parseInt(r.capacity || 0), 0);
    const occupied = rooms.reduce((acc, r) => acc + parseInt(r.current_occupancy || 0), 0);
    return { total, capacity, occupied, available: capacity - occupied };
  }, [rooms]);

  const filteredAndSortedRooms = useMemo(() => {
    let result = [...rooms];

    // 1. Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.room_number.toString().toLowerCase().includes(term) || 
        r.block.toLowerCase().includes(term)
      );
    }

    // 2. Filter Status
    if (filterStatus === 'Available') {
      result = result.filter(r => parseInt(r.current_occupancy) < parseInt(r.capacity));
    } else if (filterStatus === 'Full') {
      result = result.filter(r => parseInt(r.current_occupancy) >= parseInt(r.capacity));
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'price') return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === 'occupancy') return parseInt(b.current_occupancy) - parseInt(a.current_occupancy);
      return a.room_number.localeCompare(b.room_number, undefined, {numeric: true});
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

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. INVENTORY PULSE - Interactive Hover Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <PulseStat icon={Home} label="Total Inventory" value={stats.total} subValue="Configured Units" color="blue" />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <PulseStat icon={Users} label="Bed Capacity" value={stats.capacity} subValue="Max Occupancy" color="teal" />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <PulseStat icon={UserCheck} label="Beds Occupied" value={stats.occupied} subValue="Active Residents" color="orange" progress={stats.capacity > 0 ? (stats.occupied / stats.capacity) * 100 : 0} />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <PulseStat icon={UserMinus} label="Beds Available" value={stats.available} subValue="Current Vacancy" color="red" />
        </div>
      </div>

      {/* SEARCH, SORT & FILTER BAR */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-6 animate-slide-up shadow-sm" style={{ animationDelay: '0.45s' }}>
        <div className="flex-1 min-w-[280px] relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by Room or Block..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
            <Filter size={16} className="text-slate-400" />
            <select 
              className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white cursor-pointer appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Units</option>
              <option value="Available" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Available</option>
              <option value="Full" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Full Capacity</option>
            </select>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
            <ArrowUpDown size={16} className="text-slate-400" />
            <select 
              className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white cursor-pointer appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="room_number" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Sort: Room</option>
              <option value="price" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Sort: Price</option>
              <option value="occupancy" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Sort: Occupancy</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* 2. INFRASTRUCTURE VIEW (LEFT) */}
        <div className="xl:col-span-8 space-y-10">
          {Object.entries(roomsByBlock).length > 0 ? Object.entries(roomsByBlock).sort().map(([block, blockRooms], bIndex) => (
            <div key={block} className="space-y-6">
              <div className="flex items-center justify-between px-4 animate-fade-in" style={{ animationDelay: `${0.5 + bIndex * 0.1}s` }}>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-sm">
                    {block}
                  </div>
                  Block {block} Architecture
                </h3>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {blockRooms.length} Units • {blockRooms.reduce((a, r) => a + parseInt(r.capacity), 0)} Total Beds
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                {blockRooms.map((room, rIndex) => (
                  <div key={room.room_id} className="animate-slide-up" style={{ animationDelay: `${0.6 + rIndex * 0.05}s` }}>
                    <RoomTile 
                      room={room} 
                      onView={() => viewOccupants(room)} 
                      onDelete={() => deleteRoom(room.room_id)} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <div className="py-32 bg-white dark:bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 text-center animate-fade-in">
              <Activity size={64} strokeWidth={1} className="mx-auto mb-6 text-slate-200 dark:text-slate-700" />
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Infrastructure Empty</h3>
              <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-[10px] mt-2">No hostel blocks have been configured yet</p>
            </div>
          )}
        </div>

        {/* 3. CONFIGURATION CONSOLE (RIGHT) - ONLY SUPER */}
        {user?.role === 'SUPER' && (
          <div className="xl:col-span-4 sticky top-32 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow group">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Unit Console</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Configure New Accommodation</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white group-hover:rotate-12 transition-transform">
                  <PlusCircle size={24} />
                </div>
              </div>

              <form onSubmit={addRoom} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Block ID</label>
                  <input 
                    type="text" placeholder="e.g. A" required 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold text-sm"
                    value={newRoom.block} 
                    onChange={e => setNewRoom({...newRoom, block: e.target.value.toUpperCase()})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Number</label>
                  <input 
                    type="text" placeholder="e.g. 101" required 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold text-sm"
                    value={newRoom.room_number} 
                    onChange={e => setNewRoom({...newRoom, room_number: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Beds (Capacity)</label>
                  <input 
                    type="number" required 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold text-sm"
                    value={newRoom.capacity} 
                    onChange={e => setNewRoom({...newRoom, capacity: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Price (RS.)</label>
                  <input 
                    type="number" placeholder="e.g. 5000" required 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold text-sm"
                    value={newRoom.price} 
                    onChange={e => setNewRoom({...newRoom, price: e.target.value})} 
                  />
                </div>
                <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10">
                  <ShieldCheck size={18} /> Initialize Room
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* --- OCCUPANTS MODAL --- */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Room {selectedRoom.room_number}</h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md text-[9px] font-black uppercase tracking-widest">Block {selectedRoom.block}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Manifest</span>
                </div>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-2xl transition-all shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-10 max-h-[60vh] overflow-y-auto scrollbar-hide">
              {occupants.length > 0 ? (
                <div className="space-y-4">
                  {occupants.map((s, i) => (
                    <div key={i} className="flex items-center gap-6 p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800 group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xl shadow-lg">
                        {(s.name || "?").charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1 truncate">{s.name || "Unknown Scholar"}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.reg_no || "No ID"}</span>
                          <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                          <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">{s.department}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <UserMinus size={48} strokeWidth={1} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                  <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-xs">This residential unit is currently vacant</p>
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">End of Resident Manifest</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// --- SUB-COMPONENTS ---

const RoomTile = ({ room, onView, onDelete }) => {
  const percent = Math.round((room.current_occupancy / room.capacity) * 100);
  const isFull = room.current_occupancy >= room.capacity;

  return (
    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:scale-105 hover:border-slate-400 dark:hover:border-slate-600 transition-all group relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{room.room_number}</h4>
            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 mt-1">RS. {room.price}</span>
          </div>
          <button onClick={onDelete} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Occupancy</div>
            <div className={`text-[10px] font-black ${isFull ? 'text-red-500' : 'text-teal-600 dark:text-teal-400'}`}>
              {room.current_occupancy}/{room.capacity}
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${isFull ? 'bg-red-500' : 'bg-teal-500'}`} 
              style={{ width: `${percent}%` }} 
            />
          </div>
        </div>

        {parseInt(room.current_occupancy) > 0 && (
          <button 
            onClick={onView}
            className="mt-6 w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-105"
          >
            <Eye size={14} /> View Residents
          </button>
        )}
      </div>
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-5 ${isFull ? 'bg-red-500' : 'bg-teal-500'}`} />
    </div>
  );
};

const PulseStat = ({ icon: Icon, label, value, subValue, color, progress }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    teal: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20',
    orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    red: 'text-red-600 bg-red-50 dark:bg-red-900/20'
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:scale-105 hover:shadow-xl transition-all duration-300">
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:rotate-12 ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h4>
        </div>
        {subValue && <p className="text-[10px] font-bold text-slate-400 mt-2">{subValue}</p>}
      </div>
      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
          <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-slate-700">
    <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-white rounded-full animate-spin mb-4" />
    <p className="font-bold text-[10px] tracking-[0.3em] uppercase animate-pulse">Syncing Infrastructure Inventory...</p>
  </div>
);

export default RoomManagement;
