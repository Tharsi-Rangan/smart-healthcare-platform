function TransactionsPage() {
  const cards = [
    {
      title: "Payment Monitoring",
      description:
        "Track healthcare consultation payments after the payment service is connected.",
    },
    {
      title: "Transaction Records",
      description:
        "Planned support for transaction history, status, and summary review.",
    },
    {
      title: "Admin Oversight",
      description:
        "This area helps complete the admin operations side of the platform.",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-4xl border border-slate-200 bg-linear-to-r from-slate-900 to-cyan-700 p-8 text-white shadow-sm">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-100">
          Transactions
        </p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">Transactions</h1>
        <p className="mt-3 max-w-2xl text-base text-cyan-50 md:text-lg">
          This page is prepared for financial and payment visibility when the
          transaction backend becomes available.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {cards.map((item) => (
          <div
            key={item.title}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
            <p className="mt-3 text-slate-500">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="rounded-4xl border border-dashed border-slate-300 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Integration Note</h2>
        <p className="mt-3 text-slate-500">
          Connect this page once your payment or transaction microservice exposes
          admin reporting endpoints.
        </p>
      </section>
    </div>
  );
}

export default TransactionsPage;