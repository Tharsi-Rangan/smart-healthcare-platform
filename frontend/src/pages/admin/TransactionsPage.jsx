import { useState, useEffect } from 'react';
import { getAllPaymentsAdmin, getPaymentStats } from '../../services/paymentApi';

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
  const [filter, setFilter]       = useState('');
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchPayments(); }, [filter, page]);

  const fetchStats = async () => {
    try {
      const res = await getPaymentStats();
      setStats(res.data?.stats);
    } catch {}
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (filter) params.status = filter;
      const res = await getAllPaymentsAdmin(params);
      setPayments(res.data?.payments || []);
      setPagination(res.data?.pagination || {});
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter(p =>
    p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    p.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
    p.transactionId?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (n) => `LKR ${(n || 0).toLocaleString()}`;

  const STAT_CARDS = [
    { label: 'Total Revenue',     value: formatCurrency(stats?.revenue),   color: 'text-teal-600',    bg: 'bg-teal-50' },
    { label: 'Completed',         value: stats?.completed ?? '—',           color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending',           value: stats?.pending   ?? '—',           color: 'text-amber-600',   bg: 'bg-amber-50' },
    { label: 'Failed',            value: stats?.failed    ?? '—',           color: 'text-red-500',     bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-teal-800 to-teal-600 p-6 text-white shadow-sm">
        <p className="text-xs uppercase tracking-wide text-teal-100">
          Transactions
        </p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Transactions</h1>
        <p className="mt-2 max-w-2xl text-sm text-teal-50">
          This page is prepared for financial and payment visibility when the
          transaction backend becomes available.
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {STAT_CARDS.map(s => (
          <div key={s.label} className={`rounded-xl border border-slate-200 ${s.bg} p-4`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient, doctor, or transaction ID..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
        </div>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-teal-500">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
          <span>Transaction ID</span>
          <span>Patient</span>
          <span>Doctor</span>
          <span>Method</span>
          <span>Amount</span>
          <span>Status</span>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="animate-pulse grid grid-cols-6 gap-2 px-3 py-2">
                {[1,2,3,4,5,6].map(j => <div key={j} className="h-3 bg-slate-100 rounded" />)}
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">No transactions found</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(payment => (
              <div key={payment._id} className="grid grid-cols-6 items-center px-3 py-2 hover:bg-slate-50 transition">
                <span className="text-xs font-mono text-slate-500 truncate">
                  {payment.transactionId || payment._id?.slice(-8) || '—'}
                </span>
                <span className="text-xs font-medium text-slate-800 truncate">{payment.patientName}</span>
                <span className="text-xs text-slate-600 truncate">{payment.doctorName}</span>
                <span className="text-xs text-slate-600 capitalize">{payment.paymentMethod}</span>
                <span className="text-xs font-semibold text-slate-800">
                  {formatCurrency(payment.amount)}
                </span>
                <span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBg[payment.status] || 'bg-slate-100 text-slate-600'}`}>
                    {payment.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="rounded-lg border px-2.5 py-1 text-xs disabled:opacity-40 hover:bg-slate-50">← Prev</button>
          <span className="px-2.5 py-1 text-xs text-slate-600">{page} / {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            className="rounded-lg border px-2.5 py-1 text-xs disabled:opacity-40 hover:bg-slate-50">Next →</button>
        </div>
      )}
    </div>
  );
}

export default TransactionsPage;