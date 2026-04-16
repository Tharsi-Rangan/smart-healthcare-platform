import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getPublicDoctorById } from "../../services/publicDoctorApi";

function DoctorDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [loading, setLoading] = useState(!location.state?.doctor);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDoctor = async () => {
      if (location.state?.doctor && location.state?.doctor.id === id) {
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        const fetchedDoctor = await getPublicDoctorById(id);

        if (!isMounted) {
          return;
        }

        setDoctor(fetchedDoctor);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(
          error?.response?.data?.message ||
            "Unable to load doctor details right now."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDoctor();

    return () => {
      isMounted = false;
    };
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading doctor details...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{loadError || "Doctor not found."}</p>
        <Link
          to="/doctors"
          className="mt-4 inline-flex rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
        >
          Back to Doctors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{doctor.name}</h1>
            <p className="mt-2 text-base font-medium text-cyan-700">
              {doctor.specialization}
            </p>
            <p className="mt-3 text-sm text-slate-600">{doctor.about}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Fee:</span> BDT {doctor.consultationFee}
            </p>
            <p className="mt-2">
              <span className="font-semibold">Hospital:</span> {doctor.hospital}
            </p>
            <p className="mt-2">
              <span className="font-semibold">Availability:</span>{" "}
              {doctor.availabilityText}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Experience</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{doctor.experience}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Quick Summary</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>✔ Trusted specialist consultation</li>
            <li>✔ Easy appointment booking</li>
            <li>✔ Online and offline options</li>
            <li>✔ Secure healthcare workflow</li>
          </ul>

          <div className="mt-5">
            <Link
              to={`/book-appointment?doctorId=${doctor.id}`}
              state={{ doctor }}
              className="inline-flex rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              Continue to Booking
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDetailsPage;