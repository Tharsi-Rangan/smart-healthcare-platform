import { useState } from "react";
import {
  Bell,
  CalendarCheck,
  Check,
  CheckCheck,
  CreditCard,
  FileText,
  MessageCircle,
  Pill,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Video,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../features/auth/AuthContext";

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

const normalizeType = (type = "") => {
  if (!type) return "system";
  if (type.startsWith("doctor_")) return "verification";
  if (type.startsWith("payment_")) return "payment";
  if (type.includes("_")) return type.split("_")[0];
  return type;
};

const typeMeta = {
  appointment: {
    Icon: CalendarCheck,
    item: "border-cyan-200 bg-cyan-50/70 ring-cyan-100",
    icon: "bg-cyan-100 text-cyan-700",
  },
  payment: {
    Icon: CreditCard,
    item: "border-emerald-200 bg-emerald-50/70 ring-emerald-100",
    icon: "bg-emerald-100 text-emerald-700",
  },
  consultation: {
    Icon: Video,
    item: "border-sky-200 bg-sky-50/70 ring-sky-100",
    icon: "bg-sky-100 text-sky-700",
  },
  verification: {
    Icon: ShieldCheck,
    item: "border-amber-200 bg-amber-50/70 ring-amber-100",
    icon: "bg-amber-100 text-amber-700",
  },
  prescription: {
    Icon: Pill,
    item: "border-pink-200 bg-pink-50/70 ring-pink-100",
    icon: "bg-pink-100 text-pink-700",
  },
  report: {
    Icon: FileText,
    item: "border-cyan-200 bg-cyan-50/70 ring-cyan-100",
    icon: "bg-cyan-100 text-cyan-700",
  },
  system: {
    Icon: Settings,
    item: "border-slate-200 bg-slate-50/80 ring-slate-100",
    icon: "bg-slate-100 text-slate-600",
  },
  message: {
    Icon: MessageCircle,
    item: "border-indigo-200 bg-indigo-50/70 ring-indigo-100",
    icon: "bg-indigo-100 text-indigo-700",
  },
};

const getTypeMeta = (type) =>
  typeMeta[type] || {
    Icon: Bell,
    item: "border-slate-200 bg-slate-50/80 ring-slate-100",
    icon: "bg-slate-100 text-slate-600",
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

  const filteredNotifications = notifications.filter((notification) => {
    const normalizedType = normalizeType(notification.type);
    const searchValue = searchTerm.trim().toLowerCase();
    const title = notification.title || notification.subject || "";
    const message = notification.message || "";

    const matchesSearch =
      !searchValue ||
      title.toLowerCase().includes(searchValue) ||
      message.toLowerCase().includes(searchValue);

    const matchesType = filterType === "all" || normalizedType === filterType;
    const matchesRead =
      filterRead === "all" ||
      (filterRead === "unread" && !notification.isRead) ||
      (filterRead === "read" && notification.isRead);

    return matchesSearch && matchesType && matchesRead;
  });

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-cyan-100 bg-linear-to-br from-white to-cyan-50/70 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-700 text-white shadow-sm">
                <Bell size={24} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-cyan-700">
                  Notification Center
                </p>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Notifications
                </h1>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${
                    unreadCount !== 1 ? "s" : ""
                  }`
                : "All notifications read"}
            </p>
          </div>

          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatTile label="Total" value={notifications.length} valueClass="text-slate-900" />
        <StatTile label="Unread" value={unreadCount} valueClass="text-amber-600" />
        <StatTile
          label="Read"
          value={notifications.length - unreadCount}
          valueClass="text-emerald-600"
        />
        <StatTile
          label="Types"
          value={new Set(notifications.map((notification) => notification.type)).size}
          valueClass="text-cyan-600"
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Search Notifications
          </label>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title or message..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FilterSelect
            label="Type"
            value={filterType}
            onChange={setFilterType}
            options={notificationTypes}
          />
          <FilterSelect
            label="Status"
            value={filterRead}
            onChange={setFilterRead}
            options={[
              { value: "all", label: "All Notifications" },
              { value: "unread", label: "Unread" },
              { value: "read", label: "Read" },
            ]}
          />
        </div>
      </section>

      <section className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-cyan-100 bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading notifications...
          </div>
        ) : filteredNotifications.length > 0 ? (
          <>
            <p className="px-2 text-sm text-slate-600">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </p>

            {filteredNotifications.map((notification) => {
              const normalizedType = normalizeType(notification.type);
              const meta = getTypeMeta(normalizedType);
              const Icon = meta.Icon;

              return (
                <div
                  key={notification._id}
                  className={`rounded-2xl border p-4 shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${meta.item}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.icon}`}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {notification.title ||
                              notification.subject ||
                              "Notification"}
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-slate-700">
                            {notification.message}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-block rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                              {notification.type || normalizedType}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatTime(notification.createdAt)}
                            </span>
                            {!notification.isRead ? (
                              <span className="h-2 w-2 rounded-full bg-cyan-500" />
                            ) : null}
                          </div>
                        </div>

                        {notification.isRead ? (
                          <div className="shrink-0 text-emerald-600">
                            <Check size={20} />
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {!notification.isRead ? (
                        <button
                          type="button"
                          onClick={() => markAsRead(notification._id)}
                          className="rounded-lg p-2 transition hover:bg-white/80"
                          title="Mark as read"
                        >
                          <Check size={18} className="text-slate-600" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => deleteOne(notification._id)}
                        className="rounded-lg p-2 transition hover:bg-red-100"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-cyan-200 bg-white p-12 text-center shadow-sm">
            <Bell size={48} className="mx-auto mb-4 text-cyan-200" />
            <p className="text-lg font-semibold text-slate-800">No notifications</p>
            <p className="mt-2 text-slate-500">
              {searchTerm || filterType !== "all" || filterRead !== "all"
                ? "Try adjusting your filters"
                : "You're all caught up!"}
            </p>
          </div>
        )}
      </section>

      {notifications.length > 0 ? (
        <section className="flex items-center justify-between rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">
            {notifications.length} total notification
            {notifications.length !== 1 ? "s" : ""}
          </p>
          <button
            type="button"
            onClick={deleteAll}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        </section>
      ) : null}
    </div>
  );
}

function StatTile({ label, value, valueClass }) {
  return (
    <div className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

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
