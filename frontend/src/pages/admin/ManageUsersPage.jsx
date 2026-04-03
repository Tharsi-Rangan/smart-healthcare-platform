function ManageUsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-slate-900">Manage Users</h1>
        <p className="mt-3 text-2xl text-slate-500">
          View and manage patient accounts
        </p>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xl text-slate-500">
          This page is ready for UI, but the real admin users API is not connected yet.
          Connect it when your auth/user service exposes an admin users list endpoint.
        </p>
      </div>
    </div>
  );
}

export default ManageUsersPage;