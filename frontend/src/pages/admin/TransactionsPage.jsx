import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, AlertCircle, Edit2, Eye, MoreVertical, Download, Filter } from 'lucide-react';
import { getAllPaymentsAdmin, getPaymentStats } from '../../services/paymentApi';
import { getAllPayments, approvePayment, rejectPayment } from '../../services/paymentConsultationApi';

const statusStyle = {
  completed: 'text-emerald-600',
  pending:   'text-amber-600',
  failed:    'text-red-500',
  refunded:  'text-blue-600',
};

const statusBg = {
  completed: 'bg-emerald-100 text-emerald-700',
  pending:   'bg-amber-100 text-amber-700',
  failed:    'bg-red-100 text-red-700',
  refunded:  'bg-blue-100 text-blue-700',
};

function TransactionsPage() {
  const [payments, setPayments]   = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [adminStatusFilter, setAdminStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const paymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
  const adminStatuses = ['pending', 'approved', 'rejected'];

  useEffect(() => { 
    fetchStats(); 
    fetchPayments(); 
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getPaymentStats();
      setStats(res.data?.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAllPayments();
      setPayments(res?.data?.payments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Update payment status (direct status change)
  const handleUpdatePaymentStatus = async () => {
    if (!newStatus.trim() || !selectedPayment) {
      setError('Please select a status');
      return;
    }

    if (!window.confirm(`Update payment status to "${newStatus}"?`)) return;

    try {
      setActionLoading(true);
      // API call would go here - for now using mock
      // await updatePaymentStatus(selectedPayment._id, newStatus, adminNotes);
      
      // Optimistic update
      setPayments(prev => 
        prev.map(p => 
          p._id === selectedPayment._id 
            ? { ...p, status: newStatus, adminNotes } 
            : p
        )
      );
      
      setSuccess('Payment status updated successfully');
      setTimeout(() => {
        setShowStatusModal(false);
        setSelectedPayment(null);
        setNewStatus('');
        setAdminNotes('');
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setActionLoading(false);
    }
  };

  // Update admin approval status
  const handleApprovePayment = async (paymentId) => {
    if (!window.confirm('Approve this payment?')) return;

    try {
      setActionLoading(true);
      
      // Optimistic update - immediately update local state
      setPayments(prev => 
        prev.map(p => 
          p._id === paymentId 
            ? { ...p, adminStatus: 'approved' } 
            : p
        )
      );

      await approvePayment(paymentId);
      setSuccess('Payment approved successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve payment');
      // Revert optimistic update on error
      await fetchPayments();
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async (paymentId) => {
    if (!rejectReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    if (!window.confirm('Reject this payment?')) return;

    try {
      setActionLoading(true);
      await rejectPayment(paymentId, rejectReason);
      await fetchPayments();
      setSelectedPayment(null);
      setRejectReason('');
      setSuccess('Payment rejected successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject payment');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
      p.patientEmail?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesAdminStatus = adminStatusFilter === 'all' || p.adminStatus === adminStatusFilter;

    return matchesSearch && matchesStatus && matchesAdminStatus;
  });

  // Calculate stats
  const calculateStats = () => ({
    total: payments.length,
    pending: payments.filter(p => p.adminStatus === 'pending').length,
    approved: payments.filter(p => p.adminStatus === 'approved').length,
    rejected: payments.filter(p => p.adminStatus === 'rejected').length,
    totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    completedAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0),
  });

  const statsData = calculateStats();

  const formatCurrency = (n) => `LKR ${(n || 0).toLocaleString()}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      pending: 'bg-amber-100 text-amber-700 border-amber-300',
      failed: 'bg-red-100 text-red-700 border-red-300',
      refunded: 'bg-blue-100 text-blue-700 border-blue-300',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-300';
  };

  const getAdminStatusColor = (status) => {
    const colors = {
      approved: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <section className="rounded-3xl border border-cyan-200 bg-gradient-to-r from-cyan-600 to-sky-700 p-6 text-white shadow-sm">
        <p className="text-xs uppercase tracking-wide text-cyan-100">
          Financial Management
        </p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Transactions & Payments</h1>
        <p className="mt-2 max-w-2xl text-sm text-cyan-50">
          Manage and approve payment transactions from consultations. Update payment status and track financial records.
        </p>
      </section>

      {/* Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-3"
        >
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">✕</button>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 flex items-center gap-3"
        >
          <CheckCircle2 size={20} className="flex-shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}

      {/* Stats Grid */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Total Transactions</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{statsData.total}</p>
          <p className="mt-1 text-xs text-slate-500">{formatCurrency(statsData.totalAmount)}</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm hover:shadow-md transition">
          <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold">Pending Approval</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{statsData.pending}</p>
          <p className="mt-1 text-xs text-amber-600">Awaiting admin review</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm hover:shadow-md transition">
          <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Approved Payments</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{statsData.approved}</p>
          <p className="mt-1 text-xs text-emerald-600">{formatCurrency(statsData.completedAmount)}</p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm hover:shadow-md transition">
          <p className="text-xs uppercase tracking-wide text-red-700 font-semibold">Rejected</p>
          <p className="mt-2 text-3xl font-bold text-red-700">{statsData.rejected}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Completed</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{payments.filter(p => p.status === 'completed').length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Failed/Refunded</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{payments.filter(p => p.status === 'failed' || p.status === 'refunded').length}</p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Filter size={20} />
            Filters & Search
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                placeholder="Patient, doctor, email, or transaction ID..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" 
              />
            </div>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status</label>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="all">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Admin Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Approval Status</label>
            <select 
              value={adminStatusFilter} 
              onChange={e => setAdminStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="all">All Approval Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Results counter */}
        <div className="pt-2 border-t border-slate-100 text-sm text-slate-600">
          Showing {filteredPayments.length} of {payments.length} transactions
        </div>
      </section>

      {/* Transactions List */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <Clock size={48} className="mx-auto mb-4 text-slate-300 animate-spin" />
          <p className="text-lg font-medium">Loading transactions...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <AlertCircle size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium text-slate-700">No transactions found</p>
          <p className="text-sm mt-2">Try adjusting your search criteria or filters</p>
        </div>
      ) : (
        <section className="space-y-3">
          {filteredPayments.map((payment) => (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-lg transition"
            >
              <div className="flex gap-5">
                {/* Left: Transaction Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {payment.patientName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Transaction: <span className="font-mono">{payment.transactionId || payment._id?.slice(-8)}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getAdminStatusColor(payment.adminStatus)}`}>
                        {payment.adminStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4 mb-4">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Doctor</p>
                      <p className="mt-1 font-medium text-slate-900 text-sm">{payment.doctorName}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Amount</p>
                      <p className="mt-1 font-bold text-slate-900 text-sm">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Method</p>
                      <p className="mt-1 font-medium text-slate-900 text-sm capitalize">{payment.paymentMethod}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Date</p>
                      <p className="mt-1 font-medium text-slate-900 text-sm">{formatDate(payment.createdAt)}</p>
                    </div>
                  </div>

                  {payment.adminNotes && (
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mb-3">
                      <p className="text-xs font-semibold text-blue-900">Admin Notes:</p>
                      <p className="text-sm text-blue-800 mt-1">{payment.adminNotes}</p>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 min-w-fit">
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowDetailModal(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition whitespace-nowrap"
                    title="View details"
                  >
                    <Eye size={16} />
                    Details
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setNewStatus(payment.status);
                      setShowStatusModal(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-medium text-white hover:bg-cyan-700 transition whitespace-nowrap"
                    title="Update payment status"
                  >
                    <Edit2 size={16} />
                    Update
                  </button>

                  {payment.adminStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprovePayment(payment._id)}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {actionLoading ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            Approve
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setRejectReason('');
                        }}
                        className="flex items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-200 transition whitespace-nowrap"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Reject Modal */}
              {selectedPayment?._id === payment._id && rejectReason === '' && payment.adminStatus === 'pending' && (
                <div className="mt-4 space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <div>
                    <label className="block text-sm font-semibold text-red-900 mb-2">Rejection Reason *</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Please explain why this payment is being rejected..."
                      className="w-full rounded border border-red-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows="3"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRejectPayment(payment._id)}
                      disabled={actionLoading || !rejectReason.trim()}
                      className="flex-1 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPayment(null);
                        setRejectReason('');
                      }}
                      className="flex-1 rounded bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </section>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-white p-6 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Update Payment Status</h2>
            <p className="text-sm text-slate-600 mb-5">
              {selectedPayment.patientName} - {formatCurrency(selectedPayment.amount)}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">New Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="">Select a status...</option>
                  {paymentStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this payment update..."
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  rows="4"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedPayment(null);
                    setNewStatus('');
                    setAdminNotes('');
                  }}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePaymentStatus}
                  disabled={actionLoading || !newStatus}
                  className="flex-1 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-white max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl"
          >
            <div className="p-6 border-b border-slate-200 sticky top-0 bg-white flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Transaction Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-2xl text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Patient Information</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Name</p>
                    <p className="mt-1 font-medium text-slate-900">{selectedPayment.patientName}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="mt-1 font-medium text-slate-900">{selectedPayment.patientEmail}</p>
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Doctor Information</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Name</p>
                    <p className="mt-1 font-medium text-slate-900">{selectedPayment.doctorName}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Specialization</p>
                    <p className="mt-1 font-medium text-slate-900">{selectedPayment.specialization || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Payment Information</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                    <p className="text-xs text-emerald-700">Amount</p>
                    <p className="mt-1 font-bold text-emerald-900 text-lg">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Method</p>
                    <p className="mt-1 font-medium text-slate-900 capitalize">{selectedPayment.paymentMethod}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Status</p>
                    <p className={`mt-1 font-medium capitalize ${
                      selectedPayment.status === 'completed' ? 'text-emerald-700' :
                      selectedPayment.status === 'pending' ? 'text-amber-700' :
                      selectedPayment.status === 'failed' ? 'text-red-700' : 'text-blue-700'
                    }`}>{selectedPayment.status}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Timeline</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Created</p>
                    <p className="mt-1 font-medium text-slate-900 text-sm">{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Updated</p>
                    <p className="mt-1 font-medium text-slate-900 text-sm">{formatDate(selectedPayment.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Approval Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Approval Status</h3>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 mb-2">Status</p>
                  <p className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getAdminStatusColor(selectedPayment.adminStatus)}`}>
                    {selectedPayment.adminStatus}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default TransactionsPage;