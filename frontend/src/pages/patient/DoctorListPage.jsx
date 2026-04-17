import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { getPublicDoctors } from "../../services/publicDoctorApi";

function DoctorListPage() {
  const [searchParams] = useSearchParams();
  const specializationFromQuery = searchParams.get("specialization")?.trim() || "";

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState(
    specializationFromQuery || "all"
  );

  useEffect(() => {
    let isMounted = true;

    const loadDoctors = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const result = await getPublicDoctors();

        if (!isMounted) {
          return;
        }

        setDoctors(result);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(
          error?.response?.data?.message ||
            "Unable to fetch doctors right now. Please try again shortly."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDoctors();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!specializationFromQuery) {
      return;
    }

    const matchedSpecialization = doctors.find(
      (doctor) =>
        String(doctor.specialization || "").toLowerCase() ===
        specializationFromQuery.toLowerCase()
    )?.specialization;

    if (matchedSpecialization) {
      setSpecializationFilter(matchedSpecialization);
      return;
    }

    setSpecializationFilter(specializationFromQuery);
  }, [doctors, specializationFromQuery]);

  const specializations = useMemo(() => {
    return ["all", ...new Set(doctors.map((doctor) => doctor.specialization))];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const normalizedSearch = searchText.toLowerCase().trim();

    return doctors.filter((doctor) => {
      const matchesSpecialization =
        specializationFilter === "all" ||
        String(doctor.specialization || "").toLowerCase() ===
          String(specializationFilter || "").toLowerCase();

      const searchableText =
        `${doctor.name} ${doctor.specialization} ${doctor.hospital}`.toLowerCase();

      const matchesSearch = searchableText.includes(normalizedSearch);

      return matchesSpecialization && matchesSearch;
    });
  }, [doctors, searchText, specializationFilter]);

  const hasActiveFilters = searchText.trim() || specializationFilter !== "all";

  const clearFilters = () => {
    setSearchText("");
    setSpecializationFilter("all");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Find a Doctor</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search by doctor name or specialization and continue to appointment booking.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <SlidersHorizontal size={16} className="text-cyan-700" />
            Search & Filters
          </p>
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{filteredDoctors.length}</span> doctors
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Search Doctor
          </label>
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search by doctor name, specialization, or hospital"
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Specialization
          </label>
          <select
            value={specializationFilter}
            onChange={(event) => setSpecializationFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          >
            {specializations.map((specialization) => (
              <option key={specialization} value={specialization}>
                {specialization === "all" ? "All Specializations" : specialization}
              </option>
            ))}
          </select>
        </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading doctors...
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 shadow-sm">
          {loadError}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          No doctors matched your search. Try another keyword or specialization.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">{doctor.name}</h2>
                  <p className="mt-1 text-sm font-medium text-cyan-700">
                    {doctor.specialization}
                  </p>
                </div>

                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                  Available
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-700">Hospital:</span>{" "}
                  {doctor.hospital}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Consultation Fee:</span>{" "}
                  BDT {doctor.consultationFee}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Availability:</span>{" "}
                  {doctor.availabilityText}
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <Link
                  to={`/doctors/${doctor.id}`}
                  state={{ doctor }}
                  className="inline-flex rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
                >
                  View Details
                </Link>

                <Link
                  to={`/book-appointment?doctorId=${doctor.id}`}
                  state={{ doctor }}
                  className="inline-flex rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorListPage;