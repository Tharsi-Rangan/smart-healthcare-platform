import { useEffect, useRef, useState } from "react";
import { Bell, Check, Trash2, CheckCheck } from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationApi";

const normalizeType = (type = "") => {
  if (!type) return "system";
  if (type.includes("_")) return type.split("_")[0];
  return type;
};

function NotificationBell({ role = "patient" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef(null);
  const menuRef = useRef(null);

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotifications(); // No role parameter - backend returns notifications for logged-in user
        setNotifications(data.notifications || []);
        const unread = data.notifications?.filter((n) => !n.isRead).length || 0;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [role]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        bellRef.current &&
        !bellRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      appointment: "📅",
      payment: "💳",
      consultation: "🎥",
      verification: "✓",
      prescription: "💊",
      report: "📄",
      system: "⚙️",
      message: "💬",
    };
    return iconMap[type] || "🔔";
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      appointment: "bg-blue-50 border-blue-200",
      payment: "bg-green-50 border-green-200",
      consultation: "bg-purple-50 border-purple-200",
      verification: "bg-amber-50 border-amber-200",
      prescription: "bg-pink-50 border-pink-200",
      report: "bg-cyan-50 border-cyan-200",
      system: "bg-gray-50 border-gray-200",
      message: "bg-indigo-50 border-indigo-200",
    };
    return colorMap[type] || "bg-slate-50 border-slate-200";
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition duration-200"
        title="Notifications"
      >
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-12 w-96 max-h-96 bg-white rounded-lg border border-slate-200 shadow-2xl z-50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-500">
                  ({unreadCount} new)
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 transition"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-slate-500">
                <span className="text-sm">Loading notifications...</span>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 hover:bg-slate-50 transition cursor-pointer border-l-4 ${
                      notification.isRead
                        ? "border-l-slate-200 bg-white"
                        : "border-l-cyan-500 bg-cyan-50/30"
                    }`}
                    onClick={() =>
                      !notification.isRead &&
                      handleMarkAsRead(notification._id)
                    }
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-lg">
                        {getNotificationIcon(normalizeType(notification.type))}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                          {notification.title || notification.subject || "Notification"}
                        </p>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      {/* Status Indicator */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-cyan-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-slate-500">
                <div className="text-center">
                  <Bell size={32} className="mx-auto opacity-20 mb-2" />
                  <span className="text-sm">No notifications yet</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-200 px-4 py-3 bg-slate-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page if needed
                  // navigate(`/${role}/notifications`);
                }}
                className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold transition"
              >
                View All Notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to format time
function formatTime(timestamp) {
  if (!timestamp) return "";

  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffMs = now - notificationTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return notificationTime.toLocaleDateString();
}

export default NotificationBell;
