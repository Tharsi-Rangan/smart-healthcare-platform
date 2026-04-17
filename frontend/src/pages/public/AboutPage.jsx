import { Link } from "react-router-dom";

const AboutPage = () => {
  const values = [
    {
      title: "Patient-Centered Care",
      description:
        "We focus on making healthcare easier, safer, and more accessible for every patient.",
      icon: "💙",
    },
    {
      title: "Modern Digital Experience",
      description:
        "From online appointments to telemedicine and records, everything is designed for simplicity.",
      icon: "🌐",
    },
    {
      title: "Trusted & Secure",
      description:
        "We aim to provide a secure platform where patients, doctors, and administrators can work confidently.",
      icon: "🔒",
    },
  ];

  return (
    <div className="relative bg-slate-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-72 bg-linear-to-b from-cyan-100/60 to-transparent" />

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700">
            About Smart Healthcare Platform
          </span>

          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 md:text-3xl">
            Built for Better Healthcare Access
          </h1>

          <p className="mt-3 text-base leading-6 text-slate-600">
            Smart Healthcare Platform is a modern appointment and telemedicine
            system designed to simplify how patients connect with doctors,
            manage appointments, attend consultations, and access essential
            health information.
          </p>

          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
            <Link
              to="/doctors"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-cyan-600"
            >
              Find Doctors
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-5 lg:px-10">
        <div className="grid gap-3 md:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-2 text-2xl">{value.icon}</div>
              <h3 className="text-base font-semibold text-slate-900">
                {value.title}
              </h3>
              <p className="mt-2 text-xs leading-6 text-slate-600">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-5 lg:px-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                What Our Platform Offers
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>✔ Easy doctor discovery and appointment booking</li>
                <li>✔ Secure online consultations and telemedicine support</li>
                <li>✔ Access to prescriptions, reports, and records</li>
                <li>✔ Role-based experience for patients, doctors, and admins</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">Our Vision</h2>
              <p className="mt-3 leading-6 text-sm text-slate-600">
                We aim to bridge the gap between healthcare providers and
                patients through a professional, digital-first platform that is
                convenient, inclusive, and designed for real-world healthcare
                needs.
              </p>

              <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50 p-3">
                <p className="text-xs font-semibold text-cyan-800">
                  Real-world impact focus
                </p>
                <p className="mt-1 text-xs leading-6 text-cyan-700">
                  We prioritize reliable appointment flow, clearer communication,
                  and secure access so users of all age groups can use the
                  platform confidently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="grid gap-6 rounded-3xl bg-linear-to-r from-cyan-600 to-cyan-500 p-8 text-white shadow-xl md:grid-cols-3">
          <div>
            <p className="text-3xl font-bold">10K+</p>
            <p className="mt-2 text-sm text-cyan-50">Patients Reached</p>
          </div>
          <div>
            <p className="text-3xl font-bold">500+</p>
            <p className="mt-2 text-sm text-cyan-50">Healthcare Professionals</p>
          </div>
          <div>
            <p className="text-3xl font-bold">24/7</p>
            <p className="mt-2 text-sm text-cyan-50">Digital Access Availability</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;