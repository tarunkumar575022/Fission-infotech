import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const reservationAPI = {
  getAllReservations: (params) => api.get('/reservations', { params }),
  getMyReservations: () => api.get('/reservations/my'),
  getReservationById: (id) => api.get(`/reservations/${id}`),
  createReservation: (data) => api.post('/reservations', data),
  updateReservation: (id, data) => api.put(`/reservations/${id}`, data),
  cancelReservation: (id) => api.patch(`/reservations/${id}/cancel`),
  confirmReservation: (id) => api.patch(`/reservations/${id}/confirm`),
  deleteReservation: (id) => api.delete(`/reservations/${id}`),
};

export default api;
