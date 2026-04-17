import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
} from "../services/notificationApi";

/**
 * Custom hook for managing notifications
 * @param {Object} options - Configuration options
 * @param {string} options.role - User role (admin, doctor, patient)
 * @param {number} options.pollingInterval - Polling interval in milliseconds (default: 30000)
 * @param {boolean} options.autoRefresh - Auto-refresh notifications (default: true)
 * @returns {Object} Notification state and functions
 */
export function useNotifications(options = {}) {
  const {
    role = "patient",
    pollingInterval = 30000,
    autoRefresh = true,
  } = options;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications({ role });
      setNotifications(data.notifications || []);
      setUnreadCount(
        data.notifications?.filter((n) => !n.isRead).length || 0
      );
    } catch (err) {
      setError(err);
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Set up polling
  useEffect(() => {
    if (!autoRefresh) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, pollingInterval);

    return () => clearInterval(interval);
  }, [role, pollingInterval, autoRefresh]);

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      throw err;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      throw err;
    }
  };

  // Delete single notification
  const deleteOne = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => {
        const remaining = prev.filter((n) => n._id !== notificationId);
        setUnreadCount(remaining.filter((n) => !n.isRead).length);
        return remaining;
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
      throw err;
    }
  };

  // Delete all notifications
  const deleteAll = async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
      throw err;
    }
  };

  // Manually refresh unread count
  const refreshUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to refresh unread count:", err);
      throw err;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteOne,
    deleteAll,
    refreshUnreadCount,
  };
}

/**
 * Hook to get notifications of a specific type
 * @param {string} type - Notification type to filter
 * @param {Object} options - useNotifications options
 * @returns {Array} Filtered notifications
 */
export function useNotificationsByType(type, options = {}) {
  const { notifications } = useNotifications(options);
  return notifications.filter((n) => n.type === type);
}

/**
 * Hook to get unread notifications only
 * @param {Object} options - useNotifications options
 * @returns {Array} Unread notifications
 */
export function useUnreadNotifications(options = {}) {
  const { notifications } = useNotifications(options);
  return notifications.filter((n) => !n.isRead);
}

/**
 * Hook to monitor notification updates in real-time
 * Useful for updating components when notifications change
 * @param {Function} callback - Function to call when notifications update
 * @param {Object} options - useNotifications options
 * @returns {void}
 */
export function useNotificationListener(callback, options = {}) {
  const { notifications } = useNotifications(options);

  useEffect(() => {
    if (callback && typeof callback === "function") {
      callback(notifications);
    }
  }, [notifications, callback]);
}

/**
 * Hook to get notification count by type
 * @param {Object} options - useNotifications options
 * @returns {Object} Object with count by type
 */
export function useNotificationCounts(options = {}) {
  const { notifications } = useNotifications(options);

  const counts = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    appointment: notifications.filter((n) => n.type === "appointment").length,
    payment: notifications.filter((n) => n.type === "payment").length,
    consultation: notifications.filter((n) => n.type === "consultation")
      .length,
    verification: notifications.filter((n) => n.type === "verification")
      .length,
    prescription: notifications.filter((n) => n.type === "prescription")
      .length,
    report: notifications.filter((n) => n.type === "report").length,
    system: notifications.filter((n) => n.type === "system").length,
    message: notifications.filter((n) => n.type === "message").length,
  };

  return counts;
}
