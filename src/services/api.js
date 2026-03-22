import axios from 'axios';
import { API_BASE } from '../config';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
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
    const message = error.response?.data?.error || 'Connection Error';
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
  getLogs: (id) => api.get(`/get_student_logs.php?id=${id}`),
  updateProfile: (data) => api.post('/update_student_profile.php', data),
  bookRoom: (data) => api.post('/book_room.php', data),
  processPayment: (data) => api.post('/process_payment.php', data),
  submitComplaint: (data) => api.post('/complaints.php', data),
  getComplaints: (id) => api.get(`/complaints.php?id=${id}`),
};

export const adminService = {
  getStats: () => api.get('/stats.php'),
  getRooms: () => api.get('/manage_rooms.php'),
  addRoom: (data) => api.post('/manage_rooms.php', data),
  deleteRoom: (id, adminInfo) => api.post('/manage_rooms.php', { action: 'delete', room_id: id, ...adminInfo }),
  getStudents: () => api.get('/get_data.php?type=students'),
  getRoomOccupants: (roomId) => api.get(`/get_data.php?type=room_occupants&room_id=${roomId}`),
  getPendingStudents: () => api.get('/get_data.php?type=pending_students'),
  adminAction: (data) => api.post('/admin_action.php', data),
  getComplaints: () => api.get('/complaints.php?type=all'),
  updateComplaint: (data) => api.post('/complaints.php', { action: 'update_status', ...data }),
  getAdmins: () => api.get('/manage_admins.php'),
  addAdmin: (data) => api.post('/manage_admins.php', data),
  deleteAdmin: (id) => api.post('/manage_admins.php', { action: 'delete', admin_id: id }),
};

export default api;
