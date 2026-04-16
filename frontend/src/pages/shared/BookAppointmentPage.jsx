import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  ListChecks,
  MapPin,
  Phone,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { createAppointment } from "../../services/appointmentApi";
import { getToken } from "../../features/auth/authStorage";
import { getPublicDoctorById } from "../../services/publicDoctorApi";

function BookAppointmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    appointmentDate: "",
    appointmentTime: "",
    consultationType: "online",
    reason: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);

  const doctorId = searchParams.get("doctorId");

  const selectedDoctor = useMemo(() => {
    const doctorFromState = location.state?.doctor;

    if (doctorFromState && doctorFromState.id === doctorId) {
      return doctorFromState;
    }

    return null;
  }, [location.state, doctorId]);

  const [resolvedDoctor, setResolvedDoctor] = useState(selectedDoctor);

  useEffect(() => {
    setResolvedDoctor(selectedDoctor);
  }, [selectedDoctor]);

  useEffect(() => {
    let isMounted = true;

    const loadDoctor = async () => {
      if (!doctorId || resolvedDoctor) {
        return;
      }

      setDoctorLoading(true);

      try {
        const doctor = await getPublicDoctorById(doctorId);

        if (!isMounted) {
          return;
        }

        setResolvedDoctor(doctor);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setSubmitError(
          error?.response?.data?.message ||
            "Selected doctor could not be loaded. Please choose a doctor again."
        );
      } finally {
        if (isMounted) {
          setDoctorLoading(false);
        }
      }
    };

    loadDoctor();

    return () => {
      isMounted = false;
    };
  }, [doctorId, resolvedDoctor]);

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

    if (!formData.fullName.trim()) {
      errors.fullName = "Patient name is required.";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required.";
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

    if (!resolvedDoctor) {
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

    const token = getToken();

    if (!token) {
      setSubmitError("Please login as a patient to book an appointment.");

      setTimeout(() => {
        navigate("/login", {
          state: {
            from: `/book-appointment?doctorId=${resolvedDoctor.id}`,
            doctor: resolvedDoctor,
          },
        });
      }, 1200);

      return;
    }

    const payload = {
      doctorId: resolvedDoctor.id,
      specialty: resolvedDoctor.specialization,
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      consultationType: formData.consultationType,
      reason: formData.reason.trim(),
      patientDetails: {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      },
    };

    setLoading(true);

    try {
      await createAppointment(payload, token);
      setSubmitSuccess("Appointment booked successfully.");

      setTimeout(() => {
        navigate("/patient/appointments");
      }, 1200);
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
          Confirm your consultation with a quick and secure booking flow.
        </p>
      </div>

      {doctorLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Loading selected doctor...</p>
        </div>
      ) : !resolvedDoctor ? (
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
        <div className="grid gap-6 lg:grid-cols-[minmax(260px,340px)_1fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-800">
                <UserRound size={18} className="text-cyan-700" />
                Selected Doctor
              </h2>
              <div className="mt-3 grid gap-3 text-sm text-slate-600">
                <p>
                  <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                    <UserRound size={14} />
                    Name:
                  </span>{" "}
                  {resolvedDoctor.name}
                </p>
                <p>
                  <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                    <Stethoscope size={14} />
                    Specialization:
                  </span>{" "}
                  {resolvedDoctor.specialization}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Fee:</span> BDT{" "}
                  {resolvedDoctor.consultationFee}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Availability:</span>{" "}
                  {resolvedDoctor.availabilityText}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-linear-to-r from-cyan-700 to-sky-600 p-5 text-white shadow-md">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-100">
                <ListChecks size={14} />
                Booking Steps
              </p>
              <ol className="mt-3 space-y-2 text-sm text-cyan-50">
                <li>1. Select date and time in the future.</li>
                <li>2. Choose consultation type.</li>
                <li>3. Add your reason clearly.</li>
                <li>4. Submit and review in My Appointments.</li>
              </ol>
            </div>
          </aside>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                Patient Details (Mandatory)
              </p>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <UserRound size={15} className="text-cyan-700" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter patient full name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Phone size={15} className="text-cyan-700" />
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <MapPin size={15} className="text-cyan-700" />
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter current address"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  />
                  {fieldErrors.address && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.address}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CalendarDays size={15} className="text-cyan-700" />
                  Appointment Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                />
                {fieldErrors.appointmentDate && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.appointmentDate}</p>
                )}
              </div>

              <div>
                <label className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Clock3 size={15} className="text-cyan-700" />
                  Appointment Time
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                />
                {fieldErrors.appointmentTime && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.appointmentTime}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <CheckCircle2 size={15} className="text-cyan-700" />
                Consultation Type
              </label>
              <select
                name="consultationType"
                value={formData.consultationType}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
              {fieldErrors.consultationType && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.consultationType}</p>
              )}
            </div>

            <div>
              <label className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <FileText size={15} className="text-cyan-700" />
                Reason
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Write your symptoms or consultation reason"
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
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
        </div>
      )}
    </div>
  );
}

export default BookAppointmentPage;