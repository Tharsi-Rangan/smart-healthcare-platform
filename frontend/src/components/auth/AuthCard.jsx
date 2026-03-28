function AuthCard({ title, subtitle, children }) {
  return (
    <div className="mx-auto my-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <h1 className="mb-2 text-3xl font-bold text-slate-800">{title}</h1>

      {subtitle && <p className="mb-6 text-sm text-slate-500">{subtitle}</p>}

      {children}
    </div>
  );
}

export default AuthCard;