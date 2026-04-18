import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Filter,
} from "lucide-react";
import {
  getAllPayments,
  approvePayment,
  rejectPayment,
} from "../../services/paymentConsultationApi";

function TransactionsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adminStatusFilter, setAdminStatusFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllPayments();
      setPayments(res?.data?.payments || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    if (!window.confirm("Approve this payment?")) return;

    try {
      setActionLoading(true);
      await approvePayment(paymentId);
      await fetchPayments();
      setSuccess("Payment approved successfully");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve payment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async (paymentId) => {
    if (!rejectReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    if (!window.confirm("Reject this payment?")) return;

    try {
      setActionLoading(true);
      await rejectPayment(paymentId, rejectReason);
      await fetchPayments();
      setSelectedPayment(null);
      setRejectReason("");
      setSuccess("Payment rejected successfully");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject payment");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
      p.patientEmail?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesAdminStatus =
      adminStatusFilter === "all" || p.adminStatus === adminStatusFilter;

    return matchesSearch && matchesStatus && matchesAdminStatus;
  });

  const statsData = {
    total: payments.length,
    pending: payments.filter((p) => p.adminStatus === "pending").length,
    approved: payments.filter((p) => p.adminStatus === "approved").length,
    rejected: payments.filter((p) => p.adminStatus === "rejected").length,
    totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    completedAmount: payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + (p.amount || 0), 0),
  };

  const formatCurrency = (n) => `LKR ${(n || 0).toLocaleString()}`;
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-emerald-100 text-emerald-700 border border-emerald-300",
      pending: "bg-amber-100 text-amber-700 border border-amber-300",
      failed: "bg-red-100 text-red-700 border border-red-300",
      refunded: "bg-blue-100 text-blue-700 border border-blue-300",
    };
    return colors[status] || "bg-slate-100 text-slate-700 border border-slate-300";
  };

  const getAdminStatusColor = (status) => {
    const colors = {
      approved: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
          Financial Management
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Transactions & Payments
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
          Manage and review consultation payments with a simple, focused admin view.
        </p>
      </section>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total Transactions
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {statsData.total}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatCurrency(statsData.totalAmount)}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Pending Approval
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {statsData.pending}
          </p>
          <p className="mt-1 text-xs text-amber-600">
            Awaiting admin review
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Approved Payments
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {statsData.approved}
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            {formatCurrency(statsData.completedAmount)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-900">
            Filters & Search
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Search
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Patient, doctor, email, or transaction ID..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Payment Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="all">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Approval Status
            </label>
            <select
              value={adminStatusFilter}
              onChange={(e) => setAdminStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="all">All Approval Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-2 text-sm text-slate-600">
          Showing {filteredPayments.length} of {payments.length} transactions
        </div>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <Clock size={44} className="mx-auto mb-4 text-slate-300 animate-spin" />
          <p className="text-lg font-medium">Loading transactions...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <AlertCircle size={44} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium text-slate-700">
            No transactions found
          </p>
          <p className="mt-2 text-sm">
            Try adjusting your search criteria or filters
          </p>
        </div>
      ) : (
        <section className="space-y-3">
          {filteredPayments.map((payment) => (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Patient
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {payment.patientName || "-"}
                    </p>
                    <p className="break-all text-xs text-slate-500">
                      {payment.patientEmail || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Doctor
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {payment.doctorName || "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {payment.transactionId || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Amount
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {payment.createdAt ? formatDate(payment.createdAt) : "-"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-start gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status || "unknown"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getAdminStatusColor(
                        payment.adminStatus
                      )}`}
                    >
                      {payment.adminStatus || "pending"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowDetailModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    View
                  </button>

                  {payment.adminStatus === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprovePayment(payment._id)}
                        disabled={actionLoading}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {selectedPayment?._id === payment._id &&
                payment.adminStatus === "pending" && (
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <label className="mb-2 block text-sm font-medium text-rose-700">
                      Rejection Reason
                    </label>
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Explain why this payment is being rejected..."
                      className="w-full rounded-xl border border-rose-200 bg-white px-3 py-3 text-sm outline-none focus:border-rose-300"
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedPayment(null);
                          setRejectReason("");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRejectPayment(payment._id)}
                        disabled={actionLoading}
                        className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                      >
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                )}
            </motion.div>
          ))}
        </section>
      )}

      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  Transaction Details
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  Payment Overview
                </h3>
              </div>

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedPayment(null);
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Patient
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedPayment.patientName || "-"}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedPayment.patientEmail || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Doctor
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedPayment.doctorName || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Amount
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatCurrency(selectedPayment.amount)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Transaction ID
                </p>
                <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                  {selectedPayment.transactionId || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Payment Status
                </p>
                <div className="mt-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                      selectedPayment.status
                    )}`}
                  >
                    {selectedPayment.status || "unknown"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Approval Status
                </p>
                <div className="mt-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getAdminStatusColor(
                      selectedPayment.adminStatus
                    )}`}
                  >
                    {selectedPayment.adminStatus || "pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default TransactionsPage;