import { useMemo, useState } from "react";

const mockReports = [
  {
    id: "REP-2001",
    patientName: "Nimal Perera",
    reportTitle: "ECG Report",
    uploadedAt: "2026-03-29 08:45 AM",
    category: "Cardiology",
    status: "New",
  },
  {
    id: "REP-2002",
    patientName: "Kasuni Silva",
    reportTitle: "Blood Test Result",
    uploadedAt: "2026-03-29 10:20 AM",
    category: "Lab",
    status: "Reviewed",
  },
  {
    id: "REP-2003",
    patientName: "Ahamed Rizwan",
    reportTitle: "Blood Pressure History",
    uploadedAt: "2026-03-30 01:10 PM",
    category: "General",
    status: "New",
  },
  {
    id: "REP-2004",
    patientName: "Shalini Fernando",
    reportTitle: "Chest X-Ray",
    uploadedAt: "2026-03-30 03:25 PM",
    category: "Radiology",
    status: "Reviewed",
  },
];

const statusClasses = {
  New: "bg-amber-100 text-amber-700",
  Reviewed: "bg-emerald-100 text-emerald-700",
};

function ReportsReviewPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredReports = useMemo(() => {
    return mockReports.filter((report) => {
      const matchesSearch =
        report.patientName.toLowerCase().includes(search.toLowerCase()) ||
        report.reportTitle.toLowerCase().includes(search.toLowerCase()) ||
        report.category.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports Review</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review uploaded patient reports before consultations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Reports</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">4</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">New Reports</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">2</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Reviewed Reports</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">2</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search by patient or report title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Reviewed">Reviewed</option>
          </select>

          <div className="flex items-center justify-end text-sm text-slate-500">
            Showing {filteredReports.length} report(s)
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4">Patient</th>
                <th className="px-5 py-4">Report Title</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Uploaded At</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="border-t border-slate-200">
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {report.patientName}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {report.reportTitle}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{report.category}</td>
                    <td className="px-5 py-4 text-slate-600">{report.uploadedAt}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusClasses[report.status]
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                          View
                        </button>
                        <button className="rounded-xl bg-cyan-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-600">
                          Mark Reviewed
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-6 text-center text-slate-500">
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportsReviewPage;