import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, FileText, Phone, ClipboardList } from "lucide-react";
import apiClient from "../../services/apiClient";

function ReportsReviewPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPatients = async () => {
    try {
      const response = await apiClient.get("/api/appointments/doctor/my");
      const appointments = response.data?.data?.appointments || [];

      // Extract unique patients from appointments
      const uniquePatients = [];
      const seenPatientIds = new Set();

      appointments.forEach((apt) => {
        if (apt.patientId && !seenPatientIds.has(apt.patientId)) {
          seenPatientIds.add(apt.patientId);
          uniquePatients.push({
            patientId: apt.patientId,
            patientName: apt.patientDetails?.fullName || "Unknown Patient",
            phone: apt.patientDetails?.phone || "-",
            email: apt.patientDetails?.email || "-",
            lastAppointment: apt.appointmentDate,
            appointmentCount: appointments.filter(
              (a) => a.patientId === apt.patientId
            ).length,
          });
        }
      });

      setPatients(uniquePatients);
    } catch (err) {
      console.error("Error loading patients:", err);
      setError("Unable to load patient records. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) =>
      patient.patientName?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(patientSearch.toLowerCase())
    );
  }, [patients, patientSearch]);

  const handleSelectPatient = (patient) => {
    navigate(`/doctor/reports/${patient.patientId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Medical Reports Management
              </h1>
              <p className="text-lg text-slate-600 mt-2">
                Select a patient to create or update their medical records
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-white rounded-lg border border-slate-200 px-6 py-3 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">{patients.length}</div>
                <div className="text-xs text-slate-600 mt-0.5">Active Patients</div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-xl bg-red-50 border border-red-200 px-6 py-4 text-red-700">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by patient name or phone number..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition shadow-sm"
            />
          </div>
        </div>

        {/* Patients Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-slate-300 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading patient records...</p>
            </div>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map((patient) => (
              <button
                key={patient.patientId}
                onClick={() => handleSelectPatient(patient)}
                className="group bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden text-left hover:border-cyan-300 transform hover:-translate-y-1"
              >
                {/* Header Background */}
                <div className="h-2 bg-gradient-to-r from-cyan-600 to-sky-700 group-hover:from-cyan-700 group-hover:to-sky-800 transition"></div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-cyan-600 transition line-clamp-2">
                        {patient.patientName}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">ID: {patient.patientId.slice(0, 8)}...</p>
                    </div>
                    <div className="p-3 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition">
                      <ClipboardList size={20} className="text-cyan-600" />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone size={16} className="text-slate-400" />
                      <span className="text-slate-700 font-medium">{patient.phone}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div className="text-center py-2">
                      <div className="text-2xl font-bold text-cyan-600">{patient.appointmentCount}</div>
                      <div className="text-xs text-slate-600 mt-1 font-medium">Visit{patient.appointmentCount !== 1 ? "s" : ""}</div>
                    </div>
                    <div className="text-center py-2">
                      <div className="text-lg font-bold text-slate-900">
                        {patient.lastAppointment ? new Date(patient.lastAppointment).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "—"}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 font-medium">Last Visit</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSelectPatient(patient)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-sky-700 text-white rounded-lg font-semibold hover:from-cyan-700 hover:to-sky-800 transition shadow-sm group-hover:shadow-md"
                    >
                      <FileText size={16} className="inline mr-2" />
                      Update Records
                    </button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Users size={64} className="text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Patients Found</h3>
            <p className="text-slate-600 text-center max-w-sm">
              {patients.length === 0
                ? "You don't have any patients yet. Patients will appear here after they book an appointment with you."
                : "No patients match your search criteria. Try adjusting your search terms."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsReviewPage;