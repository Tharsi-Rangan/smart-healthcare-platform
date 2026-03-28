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

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-cyan-100 px-4 py-1 text-sm font-medium text-cyan-700">
            About Smart Healthcare Platform
          </span>

          <h1 className="mt-6 text-4xl font-extrabold text-slate-900 md:text-5xl">
            Built for Better Healthcare Access
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            Smart Healthcare Platform is a modern appointment and telemedicine
            system designed to simplify how patients connect with doctors,
            manage appointments, attend consultations, and access essential
            health information.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/doctors"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              Find Doctors
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 text-3xl">{value.icon}</div>
              <h3 className="text-xl font-semibold text-slate-900">
                {value.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                What Our Platform Offers
              </h2>
              <ul className="mt-6 space-y-4 text-slate-600">
                <li>✔ Easy doctor discovery and appointment booking</li>
                <li>✔ Secure online consultations and telemedicine support</li>
                <li>✔ Access to prescriptions, reports, and records</li>
                <li>✔ Role-based experience for patients, doctors, and admins</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">Our Vision</h2>
              <p className="mt-6 leading-8 text-slate-600">
                We aim to bridge the gap between healthcare providers and
                patients through a professional, digital-first platform that is
                convenient, inclusive, and designed for real-world healthcare
                needs.
              </p>

              <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
                <p className="text-sm font-semibold text-cyan-800">
                  Real-world impact focus
                </p>
                <p className="mt-2 text-sm leading-7 text-cyan-700">
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