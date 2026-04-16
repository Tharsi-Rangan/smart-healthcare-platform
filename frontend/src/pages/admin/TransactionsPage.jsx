import { useState, useEffect } from "react";
import { getAllTransactions } from "../../api/adminUserApi";
import { motion } from "framer-motion";

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await getAllTransactions();
        setTransactions(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-base text-slate-500">Loading transactions...</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-[34px] border border-cyan-800/30 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 text-white shadow-xl shadow-cyan-900/10"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-cyan-600/20 blur-3xl" />

        <p className="text-sm uppercase tracking-[0.25em] text-cyan-100">
          Platform Finances
        </p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">Transactions</h1>
        <p className="mt-3 max-w-2xl text-base text-cyan-50 md:text-lg">
          Monitor all platform consultation payments across doctors and patients.
        </p>
      </motion.section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-600 shadow-sm">
          {error}
        </div>
      )}

      <motion.section
        variants={itemVariants}
        className="rounded-4xl border border-slate-200/50 bg-white/70 shadow-sm overflow-hidden backdrop-blur-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 font-semibold tracking-wider">Transaction ID</th>
                <th className="px-6 py-5 font-semibold tracking-wider">Appointment ID</th>
                <th className="px-6 py-5 font-semibold tracking-wider">Amount</th>
                <th className="px-6 py-5 font-semibold tracking-wider">Gateway</th>
                <th className="px-6 py-5 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-5 font-semibold tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length > 0 ? (
                transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {txn.transactionId || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {txn.appointmentId}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {txn.amount} {txn.currency}
                    </td>
                    <td className="px-6 py-5 capitalize">
                      <span className="flex items-center gap-2">
                        {txn.paymentGateway === "payhere" && (
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                        {txn.paymentGateway}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          txn.status === "paid"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"
                            : txn.status === "failed"
                            ? "bg-rose-100 text-rose-700 border border-rose-200 shadow-sm"
                            : "bg-amber-100 text-amber-700 border border-amber-200 shadow-sm"
                        }`}
                      >
                        {txn.status === "paid" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                        {txn.status === "failed" && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
                        {txn.status === "pending" && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default TransactionsPage;