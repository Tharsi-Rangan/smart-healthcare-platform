import { Link } from "react-router-dom";
import hero1Image from "../../assets/hero1.png";
import { mockDoctors } from "../shared/doctorMockData";

function HomePage() {
  const sampleDoctorId = mockDoctors[0]?.id || "";

  const features = [
    {
      title: "Book Appointments Easily",
      description:
        "Find the right doctor, choose a convenient time slot, and schedule appointments in minutes.",
      icon: "📅",
    },
    {
      title: "Online Consultations",
      description:
        "Attend telemedicine consultations securely from anywhere using your device.",
      icon: "💻",
    },
    {
      title: "Health Records in One Place",
      description:
        "Access prescriptions, reports, and medical history with a simple and organized experience.",
      icon: "📄",
    },
  ];

  const highlights = [
    "Certified and trusted healthcare professionals",
    "Simple and secure digital appointment flow",
    "Designed for patients, families, elders, and children",
  ];

  const trustIndicators = [
    { label: "Verified Doctors", icon: "✅" },
    { label: "Secure Patient Data", icon: "🔒" },
    { label: "Role-Based Access", icon: "🛡️" },
  ];

  const audienceCards = [
    {
      title: "For Patients",
      description:
        "Search doctors, book appointments, and manage consultations with ease.",
      icon: "🧑",
    },
    {
      title: "For Families",
      description:
        "Support elders and children with a simple and guided healthcare experience.",
      icon: "👨‍👩‍👧",
    },
    {
      title: "For Doctors",
      description:
        "Manage appointments efficiently and keep consultation workflows organized.",
      icon: "🩺",
    },
  ];

  const journey = [
    {
      step: "Step 1",
      title: "Find Doctors",
      description: "Browse doctors by specialization and availability.",
      to: "/doctors",
      action: "Open Doctor List",
    },
    {
      step: "Step 2",
      title: "Review Doctor Details",
      description: "Check profile details, experience, and consultation fee.",
      to: `/doctors/${sampleDoctorId}`,
      action: "View Sample Profile",
    },
    {
      step: "Step 3",
      title: "Book Appointment",
      description: "Choose date, time, and consultation type in one form.",
      to: `/book-appointment?doctorId=${sampleDoctorId}`,
      action: "Start Booking",
    },
    {
      step: "Step 4",
      title: "Manage Appointments",
      description: "Track status, reschedule, or cancel from your dashboard.",
      to: "/patient/appointments",
      action: "Open Dashboard",
    },
  ];

  return (
    <div className="relative bg-slate-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-80 rounded-b-3xl bg-linear-to-b from-cyan-100/45 via-cyan-50/20 to-transparent" />

      <section className="relative z-10 mx-auto grid min-h-[84vh] max-w-360 items-center gap-12 px-6 py-14 md:grid-cols-2 lg:px-10">
        <div className="max-w-xl">
          <span className="inline-flex rounded-full bg-cyan-100 px-4 py-1 text-sm font-medium text-cyan-700 shadow-sm">
            Smart Healthcare, Made Simple
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Your Health Journey,
            <span className="block text-cyan-600">Clear, Secure, and Fast</span>
          </h1>

          <p className="mt-6 text-base leading-8 text-slate-600 md:text-lg">
            Connect with trusted doctors, book appointments in minutes, attend
            online consultations, and manage health records from one platform.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/doctors"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-200 transition duration-300 hover:-translate-y-0.5 hover:bg-cyan-600"
            >
              Find Doctors
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Create Account
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {trustIndicators.map((indicator) => (
              <span
                key={indicator.label}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                <span>{indicator.icon}</span>
                {indicator.label}
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/80 px-4 py-3"
              >
                <span className="mt-0.5 text-cyan-600">✔</span>
                <p className="text-sm text-slate-600 md:text-base">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex justify-center md:justify-end">
          <div className="absolute -left-2 top-8 hidden w-44 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur md:block">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <p className="text-xs font-medium text-slate-500">Appointments</p>
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900">1,250+</p>
            <p className="text-sm text-cyan-600">Booked successfully</p>
          </div>

          <div className="absolute bottom-6 right-0 hidden w-48 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur md:block">
            <div className="flex items-center gap-2">
              <span className="text-lg">💻</span>
              <p className="text-xs font-medium text-slate-500">Consultations</p>
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900">24/7</p>
            <p className="text-sm text-cyan-600">Digital care access</p>
          </div>

          <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200">
            <img
              src={hero1Image}
              alt="Doctor providing digital healthcare consultation"
              className="h-auto w-full max-w-xl rounded-3xl object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-360 px-6 py-10 lg:px-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Core Features</h2>
              <p className="mt-1 text-sm text-slate-500">
                Everything you need for a smooth healthcare experience.
              </p>
            </div>
            <Link
              to="/about"
              className="hidden rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:inline-flex"
            >
              Learn More
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 text-3xl">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-360 px-6 py-10 lg:px-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Built for Everyone</h2>
            <p className="mt-1 text-sm text-slate-500">
              A simple healthcare experience designed for modern patient care.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {audienceCards.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 text-3xl">{item.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-360 px-6 py-10 lg:px-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
          <p className="mt-2 text-sm text-slate-500">
            Follow this simple path from discovery to appointment management.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {journey.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                  {item.step}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
                <Link
                  to={item.to}
                  className="mt-4 inline-flex rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
                >
                  {item.action}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-360 px-6 py-14 lg:px-10">
        <div className="grid gap-8 rounded-3xl bg-linear-to-r from-cyan-600 to-cyan-500 p-8 text-white shadow-xl md:grid-cols-3">
          <div>
            <p className="text-3xl font-bold">10K+</p>
            <p className="mt-2 text-sm text-cyan-50">Patients Supported</p>
          </div>
          <div>
            <p className="text-3xl font-bold">500+</p>
            <p className="mt-2 text-sm text-cyan-50">Trusted Doctors</p>
          </div>
          <div>
            <p className="text-3xl font-bold">99%</p>
            <p className="mt-2 text-sm text-cyan-50">Secure Digital Experience</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-360 px-6 pb-16 lg:px-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:flex md:items-center md:justify-between md:gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Ready to book your next consultation?
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Explore trusted doctors and manage your healthcare journey from one
              secure platform.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-0">
            <Link
              to="/doctors"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              Find Doctors
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;