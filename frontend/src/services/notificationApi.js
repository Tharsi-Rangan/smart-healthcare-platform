import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications`;
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const normalizeNotificationsResponse = (payload = {}) => {
  const notifications =
    payload?.data?.notifications ||
    payload?.notifications ||
    [];

  return {
    success: payload?.success ?? true,
    notifications,
  };
};

export const getNotifications = async (filters = {}) => {
  try {
    const response = await axios.get(API_URL, {
      params: filters,
      headers: authHeaders(),
    });
    return normalizeNotificationsResponse(response.data);
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${notificationId}/read`,
      {},
      { headers: authHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.patch(
      `${API_URL}/read-all`,
      {},
      { headers: authHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(`${API_URL}/${notificationId}`, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteAllNotifications = async () => {
  try {
    const response = await axios.delete(
      `${API_URL}/delete-all`,
      { headers: authHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/unread-count`, {
      headers: authHeaders(),
    });
    const payload = response.data || {};
    return {
      success: payload?.success ?? true,
      unreadCount: payload?.data?.count ?? payload?.unreadCount ?? 0,
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};
