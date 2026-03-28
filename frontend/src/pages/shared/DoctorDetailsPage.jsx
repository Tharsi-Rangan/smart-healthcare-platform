import { Link, useLocation, useParams } from "react-router-dom";
import { mockDoctors } from "./doctorMockData";

function DoctorDetailsPage() {
  const { id } = useParams();
  const location = useLocation();

  const doctorFromState = location.state?.doctor;
  const doctor =
    (doctorFromState && doctorFromState.id === id && doctorFromState) ||
    mockDoctors.find((item) => item.id === id);

  if (!doctor) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Doctor not found</h1>
        <p className="text-sm text-slate-500">
          The doctor profile you requested is unavailable right now.
        </p>
        <Link
          to="/doctors"
          className="inline-flex rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
        >
          Back to Doctor List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Doctor Details</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review the profile and continue to appointment booking.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">{doctor.name}</h2>
            <p className="mt-1 text-sm font-medium text-cyan-700">
              {doctor.specialization}
            </p>
          </div>

          <div className="rounded-xl bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
            <p className="font-semibold">Fee: BDT {doctor.consultationFee}</p>
            <p className="mt-1">{doctor.availabilityText}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Experience</h3>
            <p className="mt-2 text-sm text-slate-600">{doctor.experience}</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800">About Doctor</h3>
            <p className="mt-2 text-sm text-slate-600">{doctor.about}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/doctors"
            className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to List
          </Link>

          <Link
            to={`/book-appointment?doctorId=${doctor.id}`}
            state={{ doctor }}
            className="inline-flex rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            Continue to Booking
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DoctorDetailsPage;
