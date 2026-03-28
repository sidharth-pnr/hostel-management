import axios from'axios';
import {API_BASE} from'../config';

const api = axios.create({
 baseURL: API_BASE,
 headers: {
'Content-Type':'application/json',
},
});

// Request interceptor for logging or adding tokens later
api.interceptors.request.use(
 (config) => {
 // If you add JWT later, you can inject it here
 // const token = localStorage.getItem('token');
 // if (token) config.headers.Authorization = `Bearer ${token}`;
 return config;
},
 (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
 (response) => response,
 (error) => {
 const message = error.response?.data?.error ||'Connection Error';
 return Promise.reject(new Error(message));
}
);

export const authService = {
 login: (credentials) => api.post('/login.php', credentials),
 register: (data) => api.post('/register.php', data),
};

export const studentService = {
 getRoomInfo: (id) => api.get(`/student_room.php?id=${id}`),
 getRoommates: (id) => api.get(`/get_roommates.php?student_id=${id}`),
 updateProfile: (data) => api.post('/update_student_profile.php', data),
 bookRoom: (data, user) => api.post('/book_room.php', { ...data, student_id: user.id, role: 'student' }),
 processPayment: (data, user) => api.post('/process_payment.php', { ...data, student_id: user.id, role: 'student' }),
 submitComplaint: (data, user) => api.post('/complaints.php', { ...data, student_id: user.id, role: 'student' }),
 getComplaints: (id) => api.get(`/complaints.php?id=${id}&role=student`),
 updateComplaintStatus: (data, user) => api.post('/complaints.php', { action: 'update_status', ...data, student_id: user.id, role: 'student' }),
 deleteComplaint: (id, user) => api.delete(`/complaints.php?id=${id}&student_id=${user.id}&role=student`),
};

export const adminService = {
 getStats: () => api.get('/stats.php'),
 getRooms: () => api.get('/manage_rooms.php'),
 addRoom: (data, user) => api.post('/manage_rooms.php', { ...data, admin_name: user.name, admin_role: user.role }),
 deleteRoom: (roomId, user) => api.post('/manage_rooms.php', { action: 'delete', room_id: roomId, admin_name: user.name, admin_role: user.role }),
 getStudents: (user) => api.get(`/get_data.php?type=students&admin_role=${user.role}`),
 getRoomOccupants: (roomId, user) => api.get(`/get_data.php?type=room_occupants&room_id=${roomId}&admin_role=${user?.role || 'student'}`),
 getPendingStudents: (user) => api.get(`/get_data.php?type=pending&admin_role=${user.role}`),
 adminAction: (data, user) => api.post('/admin_action.php', { ...data, admin_name: user.name, admin_role: user.role }),
 getComplaints: (user) => api.get(`/complaints.php?type=all&admin_role=${user.role}`),
 updateComplaint: (data, user) => api.post('/complaints.php', { action: 'update_status', ...data, admin_name: user.name, admin_role: user.role }),
 getAdmins: (user) => api.post('/manage_admins.php', { action: 'list', admin_role: user.role }),
 addAdmin: (data, user) => api.post('/manage_admins.php', { ...data, action: 'add', admin_role: user.role }),
 deleteAdmin: (id, user) => api.post('/manage_admins.php', { action: 'delete', id, admin_role: user.role }),
};

export default api;

