import { useState, useEffect } from "react";
import axios from "axios";
import "./NotificationsPage.css";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(
        `http://localhost:5005/api/payments/notifications/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(response.data.data);
      setLoading(false);
    } catch (err) {
      console.log("Failed to fetch notifications");
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await axios.put(
        `http://localhost:5005/api/payments/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications(
        notifications.map((n) =>
          n._id === notificationId
            ? { ...n, readAt: response.data.data.readAt }
            : n
        )
      );
    } catch (err) {
      console.log("Failed to mark notification as read");
    }
  };

  const deleteNotification = (notificationId) => {
    setNotifications(notifications.filter((n) => n._id !== notificationId));
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case "appointment_booked":
        return "📅";
      case "payment_success":
        return "✓";
      case "consultation_reminder":
        return "⏰";
      case "consultation_completed":
        return "✔️";
      default:
        return "📬";
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case "appointment_booked":
        return "booking";
      case "payment_success":
        return "success";
      case "consultation_reminder":
        return "reminder";
      case "consultation_completed":
        return "completed";
      default:
        return "default";
    }
  };

  if (loading)
    return <div className="notifications-loading">Loading notifications...</div>;

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <h1>Notifications</h1>

        {error && <div className="error-alert">{error}</div>}

        {notifications.length === 0 ? (
          <div className="no-notifications">
            <div className="empty-icon">📭</div>
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${getEventColor(notification.eventType)} ${
                  notification.readAt ? "read" : "unread"
                }`}
              >
                <div className="notification-icon">
                  {getEventIcon(notification.eventType)}
                </div>
                <div className="notification-content">
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="notification-actions">
                  {!notification.readAt && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="btn-read"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="btn-delete"
                    title="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
