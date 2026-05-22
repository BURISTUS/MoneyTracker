import api from './api';

const notificationsService = {
  getNotifications: (page = 1, limit = 30) =>
    api.get('/notifications', { params: { page, limit } }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export default notificationsService;
