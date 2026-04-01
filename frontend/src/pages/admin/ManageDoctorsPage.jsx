import { useEffect, useState } from "react";
import { getAllDoctors } from "../../api/doctorApi";

function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await getAllDoctors();
        setDoctors(response.data?.doctors || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const statusStyles = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  if (loading) {
    return <p className="text-slate-500">Loading doctors...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manage Doctors</h1>
        <p className="mt-1 text-sm text-slate-500">
          View all doctors and their approval status.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4">Specialization</th>
                <th className="px-5 py-4">License</th>
                <th className="px-5 py-4">Hospital</th>
                <th className="px-5 py-4">Experience</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <tr key={doctor._id} className="border-t border-slate-200">
                    <td className="px-5 py-4 text-slate-800">{doctor.specialization}</td>
                    <td className="px-5 py-4 text-slate-600">{doctor.licenseNumber}</td>
                    <td className="px-5 py-4 text-slate-600">{doctor.hospital || "-"}</td>
                    <td className="px-5 py-4 text-slate-600">{doctor.experience || 0}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[doctor.approvalStatus] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {doctor.approvalStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-6 text-center text-slate-500">
                    No doctors found.
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

export default ManageDoctorsPage;