import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { createAppointment } from "../../services/appointmentApi";
import { mockDoctors } from "./doctorMockData";

function BookAppointmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    consultationType: "online",
    reason: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const doctorId = searchParams.get("doctorId");

  const selectedDoctor = useMemo(() => {
    const doctorFromState = location.state?.doctor;

    if (doctorFromState && doctorFromState.id === doctorId) {
      return doctorFromState;
    }

    return mockDoctors.find((doctor) => doctor.id === doctorId);
  }, [location.state, doctorId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const today = new Date().toISOString().split("T")[0];

    if (!formData.appointmentDate) {
      errors.appointmentDate = "Appointment date is required.";
    } else if (formData.appointmentDate < today) {
      errors.appointmentDate = "Appointment date cannot be in the past.";
    }

    if (!formData.appointmentTime) {
      errors.appointmentTime = "Appointment time is required.";
    }

    if (!formData.consultationType) {
      errors.consultationType = "Please select consultation type.";
    }

    if (!formData.reason.trim()) {
      errors.reason = "Please provide a brief reason.";
    }

    if (!selectedDoctor) {
      errors.doctor = "Please select a doctor first.";
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = {
      doctorId: selectedDoctor.id,
      specialty: selectedDoctor.specialization,
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      consultationType: formData.consultationType,
      reason: formData.reason.trim(),
    };

    setLoading(true);

    try {
      await createAppointment(payload);
      setSubmitSuccess("Appointment booked successfully.");
      setFormData({
        appointmentDate: "",
        appointmentTime: "",
        consultationType: "online",
        reason: "",
      });
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          "Appointment service is not available right now. Please try again shortly."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Book Appointment</h1>
        <p className="mt-1 text-sm text-slate-500">
          Complete the booking form to confirm your appointment.
        </p>
      </div>

      {!selectedDoctor ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            No doctor is selected. Start from the doctor list and choose a doctor profile.
          </p>
          <Link
            to="/doctors"
            className="mt-4 inline-flex rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            Browse Doctors
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">Selected Doctor</h2>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
              <p>
                <span className="font-medium text-slate-700">Name:</span> {selectedDoctor.name}
              </p>
              <p>
                <span className="font-medium text-slate-700">Specialization:</span>{" "}
                {selectedDoctor.specialization}
              </p>
              <p>
                <span className="font-medium text-slate-700">Fee:</span> BDT{" "}
                {selectedDoctor.consultationFee}
              </p>
              <p>
                <span className="font-medium text-slate-700">Availability:</span>{" "}
                {selectedDoctor.availabilityText}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Appointment Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                />
                {fieldErrors.appointmentDate && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.appointmentDate}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Appointment Time
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                />
                {fieldErrors.appointmentTime && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.appointmentTime}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Consultation Type
              </label>
              <select
                name="consultationType"
                value={formData.consultationType}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
              {fieldErrors.consultationType && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.consultationType}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Reason</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Write your symptoms or consultation reason"
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
              {fieldErrors.reason && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.reason}</p>
              )}
            </div>

            {fieldErrors.doctor && <p className="text-sm text-red-500">{fieldErrors.doctor}</p>}
            {submitError && <p className="text-sm text-red-500">{submitError}</p>}
            {submitSuccess && <p className="text-sm text-emerald-600">{submitSuccess}</p>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Booking..." : "Submit Appointment"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/patient/appointments")}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Go to My Appointments
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default BookAppointmentPage;
