import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicDoctors } from "../../services/publicDoctorApi";

const SPECIALTIES = [
  "All",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Pediatrician",
  "Orthopedic",
  "General Physician",
  "Gynecologist",
  "Psychiatrist",
  "Ophthalmologist",
  "ENT Specialist",
];

function getInitials(name) {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "DR"
  );
}

const AVATAR_COLORS = [
  "bg-cyan-500",
  "bg-cyan-600",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
];

function FindDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSpecialty, setSpec] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getPublicDoctors();
        setDoctors(res || []);
      } catch {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = doctors.filter((d) => {
    const matchSearch =
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchSpec =
      activeSpecialty === "All" ||
      d.specialization
        ?.toLowerCase()
        .includes(activeSpecialty.toLowerCase());
    return matchSearch && matchSpec;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Find Doctors</h1>
        <p className="text-sm text-slate-500">
          Browse verified doctors and book an appointment
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or specialty..."
          className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
        />
      </div>

      {/* Specialty Filter */}
      <div className="flex flex-wrap gap-2">
        {SPECIALTIES.map((s) => (
          <button
            key={s}
            onClick={() => setSpec(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeSpecialty === s
                ? "bg-cyan-600 text-white"
                : "border border-cyan-200 bg-white text-cyan-600 hover:bg-cyan-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Doctor Cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-8 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <svg
              className="h-7 w-7 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="font-medium text-slate-700">No doctors found</p>
          <p className="text-sm text-slate-400 mt-1">
            {doctors.length === 0
              ? "No approved doctors available yet."
              : "Try a different search or specialty"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {filtered.map((doctor, index) => (
            <div
              key={doctor.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-cyan-300 hover:shadow-md transition"
            >
              {/* Avatar + Info */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                    AVATAR_COLORS[index % AVATAR_COLORS.length]
                  }`}
                >
                  {getInitials(doctor.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">
                    {doctor.name}
                  </h3>
                  <p className="text-sm text-cyan-600 font-medium truncate">
                    {doctor.specialization}
                  </p>
                  {doctor.hospital && (
                    <p className="text-xs text-slate-500 truncate">
                      {doctor.hospital}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between text-xs text-slate-600 mb-4 pb-4 border-b border-slate-100">
                <span className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {doctor.experience ? `${doctor.experience} yrs exp` : "Exp"}
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  5.0
                </span>
                {doctor.consultationFee && doctor.consultationFee !== "N/A" && (
                  <span className="font-semibold text-slate-700">
                    LKR{" "}
                    {typeof doctor.consultationFee === "number"
                      ? doctor.consultationFee.toLocaleString()
                      : doctor.consultationFee}
                  </span>
                )}
              </div>

              {/* Book Button */}
              <button
                onClick={() =>
                  navigate(`/book-appointment?doctorId=${doctor.id}`, {
                    state: { doctor },
                  })
                }
                className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2.5 transition"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FindDoctorsPage;
