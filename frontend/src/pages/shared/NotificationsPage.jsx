import { useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  CheckCheck,
  Search,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../features/auth/AuthContext";

const normalizeType = (type = "") => {
  if (!type) return "system";
  if (type.includes("_")) return type.split("_")[0];
  return type;
};

function NotificationsPage() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteOne,
    deleteAll,
  } = useNotifications({ role: user?.role });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState("all");

  const notificationTypes = [
    { value: "all", label: "All Notifications" },
    { value: "appointment", label: "Appointments" },
    { value: "payment", label: "Payments" },
    { value: "consultation", label: "Consultations" },
    { value: "verification", label: "Verification" },
    { value: "prescription", label: "Prescriptions" },
    { value: "report", label: "Reports" },
    { value: "system", label: "System" },
    { value: "message", label: "Messages" },
  ];

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
      appointment: "bg-blue-50 border-blue-200 border-l-4 border-l-blue-500",
      payment: "bg-green-50 border-green-200 border-l-4 border-l-green-500",
      consultation: "bg-purple-50 border-purple-200 border-l-4 border-l-purple-500",
      verification: "bg-amber-50 border-amber-200 border-l-4 border-l-amber-500",
      prescription: "bg-pink-50 border-pink-200 border-l-4 border-l-pink-500",
      report: "bg-cyan-50 border-cyan-200 border-l-4 border-l-cyan-500",
      system: "bg-gray-50 border-gray-200 border-l-4 border-l-gray-500",
      message: "bg-indigo-50 border-indigo-200 border-l-4 border-l-indigo-500",
    };
    return colorMap[type] || "bg-slate-50 border-slate-200 border-l-4 border-l-slate-500";
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const normalizedType = normalizeType(notification.type);
    const matchesSearch =
      (notification.title || notification.subject || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || normalizedType === filterType;

    const matchesRead =
      filterRead === "all" ||
      (filterRead === "unread" && !notification.isRead) ||
      (filterRead === "read" && notification.isRead);

    return matchesSearch && matchesType && matchesRead;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-cyan-700 p-6 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bell size={28} />
              <h1 className="text-3xl font-bold">Notifications</h1>
            </div>
            <p className="text-cyan-100">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${
                    unreadCount !== 1 ? "s" : ""
                  }`
                : "All notifications read"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          )}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {notifications.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Unread
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {unreadCount}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Read
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {notifications.length - unreadCount}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Types
          </p>
          <p className="mt-2 text-2xl font-bold text-cyan-600">
            {new Set(notifications.map((n) => n.type)).size}
          </p>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search Notifications
          </label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or message..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
            />
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
            >
              {notificationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notifications List */}
      <section className="space-y-3">
        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading notifications...
          </div>
        ) : filteredNotifications.length > 0 ? (
          <>
            <p className="text-sm text-slate-600 px-2">
              Showing {filteredNotifications.length} of{
                notifications.length
              } notifications
            </p>
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-lg border p-4 transition ${getNotificationColor(
                  normalizeType(notification.type)
                )}`}
              >
                <div className="flex gap-4 items-start">
                  {/* Icon */}
                  <div className="flex-shrink-0 text-2xl">
                    {getNotificationIcon(normalizeType(notification.type))}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {notification.title || notification.subject || "Notification"}
                        </h3>
                        <p className="text-sm text-slate-700 mt-1">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="inline-block text-xs bg-slate-200 text-slate-700 rounded-full px-2.5 py-1">
                            {notification.type}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <span className="inline-block h-2 w-2 bg-cyan-500 rounded-full"></span>
                          )}
                        </div>
                      </div>

                      {notification.isRead && (
                        <div className="flex-shrink-0 text-emerald-600">
                          <Check size={20} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="p-2 hover:bg-slate-200/50 rounded-lg transition"
                        title="Mark as read"
                      >
                        <Check size={18} className="text-slate-600" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteOne(notification._id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
            <Bell size={48} className="mx-auto opacity-20 mb-4" />
            <p className="text-lg font-semibold text-slate-800">
              No notifications
            </p>
            <p className="text-slate-500 mt-2">
              {searchTerm || filterType !== "all" || filterRead !== "all"
                ? "Try adjusting your filters"
                : "You're all caught up!"}
            </p>
          </div>
        )}
      </section>

      {/* Bulk Actions */}
      {notifications.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            {notifications.length} total notification
            {notifications.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={deleteAll}
            className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        </section>
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

export default NotificationsPage;
