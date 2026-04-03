function TransactionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-slate-900">Transactions</h1>
        <p className="mt-3 text-2xl text-slate-500">
          View and manage platform transactions
        </p>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xl text-slate-500">
          Transactions UI is ready to connect once a payment/transaction backend API is available.
        </p>
      </div>
    </div>
  );
}

export default TransactionsPage;