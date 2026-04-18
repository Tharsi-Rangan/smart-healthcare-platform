import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, FileText, Phone } from "lucide-react";
import apiClient from "../../services/apiClient";

function PrescriptionPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPatients = async () => {
    try {
      const response = await apiClient.get("/api/appointments/doctor/my");
      const appointments = response.data?.data?.appointments || [];

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
    } catch {
      setError("Unable to load patient records. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter(
      (patient) =>
        patient.patientName?.toLowerCase().includes(patientSearch.toLowerCase()) ||
        patient.phone?.toLowerCase().includes(patientSearch.toLowerCase())
    );
  }, [patients, patientSearch]);

  const handleSelectPatient = (patient) => {
    navigate(`/doctor/prescriptions/${patient.patientId}`);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Prescription Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Prescriptions
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Select a patient to create or review digital prescriptions.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Active Patients
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {patients.length}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by patient name or phone number..."
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
          />
        </div>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-500">Loading patient records...</p>
        </div>
      ) : filteredPatients.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPatients.map((patient) => (
            <button
              key={patient.patientId}
              onClick={() => handleSelectPatient(patient)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-cyan-200 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-slate-900">
                    {patient.patientName}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    ID: {patient.patientId.slice(0, 8)}...
                  </p>
                </div>

                <div className="rounded-xl bg-cyan-50 p-3">
                  <Users size={18} className="text-cyan-700" />
                </div>
              </div>

              <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400" />
                  <span>{patient.phone}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <div className="text-2xl font-bold text-cyan-700">
                    {patient.appointmentCount}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Consultation{patient.appointmentCount !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <div className="text-sm font-bold text-slate-900">
                    {patient.lastAppointment
                      ? new Date(patient.lastAppointment).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" }
                      )
                      : "—"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Last Visit</div>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white">
                <FileText size={14} className="mr-2" />
                Open Prescription
              </div>
            </button>
          ))}
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Users size={56} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900">No Patients Found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {patients.length === 0
              ? "Patients will appear here after they book an appointment with you."
              : "No patients match your search criteria."}
          </p>
        </div>
      )}
    </div>
  );
}

export default PrescriptionPage;