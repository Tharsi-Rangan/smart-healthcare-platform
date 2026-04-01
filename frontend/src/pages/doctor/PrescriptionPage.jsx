import { useMemo, useState } from "react";

const mockPatients = [
  "Nimal Perera",
  "Kasuni Silva",
  "Ahamed Rizwan",
  "Shalini Fernando",
];

const mockPrescriptions = [
  {
    id: "PR-3001",
    patientName: "Nimal Perera",
    diagnosis: "Mild hypertension",
    medicines: [
      { name: "Amlodipine 5mg", dosage: "1 tablet daily after breakfast" },
      { name: "Aspirin 75mg", dosage: "1 tablet daily at night" },
    ],
    notes: "Monitor blood pressure for 2 weeks and continue light exercise.",
    issuedAt: "2026-03-29 09:40 AM",
  },
  {
    id: "PR-3002",
    patientName: "Kasuni Silva",
    diagnosis: "Vitamin deficiency",
    medicines: [{ name: "Vitamin D3", dosage: "1 capsule weekly" }],
    notes: "Follow-up blood test after 1 month.",
    issuedAt: "2026-03-30 11:15 AM",
  },
];

function PrescriptionPage() {
  const [formData, setFormData] = useState({
    patientName: mockPatients[0],
    diagnosis: "",
    medicines: [{ name: "", dosage: "" }],
    notes: "",
  });

  const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((item) => {
      return (
        item.patientName.toLowerCase().includes(search.toLowerCase()) ||
        item.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [prescriptions, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.map((medicine, i) =>
        i === index ? { ...medicine, [field]: value } : medicine
      ),
    }));
  };

  const addMedicineRow = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", dosage: "" }],
    }));
  };

  const removeMedicineRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedMedicines = formData.medicines.filter(
      (medicine) => medicine.name.trim() && medicine.dosage.trim()
    );

    const newPrescription = {
      id: `PR-${Date.now()}`,
      patientName: formData.patientName,
      diagnosis: formData.diagnosis,
      medicines: cleanedMedicines,
      notes: formData.notes,
      issuedAt: new Date().toLocaleString(),
    };

    setPrescriptions((prev) => [newPrescription, ...prev]);
    setMessage("Prescription issued successfully.");

    setFormData({
      patientName: mockPatients[0],
      diagnosis: "",
      medicines: [{ name: "", dosage: "" }],
      notes: "",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Prescription Page</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create and review digital prescriptions for patients.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Issue New Prescription
          </h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Patient Name
              </label>
              <select
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
              >
                {mockPatients.map((patient) => (
                  <option key={patient} value={patient}>
                    {patient}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Diagnosis
              </label>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                placeholder="Enter diagnosis"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Medicines
                </label>

                <button
                  type="button"
                  onClick={addMedicineRow}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Add Medicine
                </button>
              </div>

              {formData.medicines.map((medicine, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr,1fr,auto]"
                >
                  <input
                    type="text"
                    value={medicine.name}
                    onChange={(e) =>
                      handleMedicineChange(index, "name", e.target.value)
                    }
                    className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                    placeholder="Medicine name"
                  />

                  <input
                    type="text"
                    value={medicine.dosage}
                    onChange={(e) =>
                      handleMedicineChange(index, "dosage", e.target.value)
                    }
                    className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                    placeholder="Dosage / instructions"
                  />

                  <button
                    type="button"
                    onClick={() => removeMedicineRow(index)}
                    className="rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                placeholder="Follow-up advice, lifestyle guidance, next review..."
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              Issue Prescription
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              Issued Prescriptions
            </h2>

            <div className="mt-4">
              <input
                type="text"
                placeholder="Search by patient, diagnosis, or ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredPrescriptions.length > 0 ? (
              filteredPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {prescription.patientName}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {prescription.id} • {prescription.issuedAt}
                      </p>
                    </div>

                    <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                      Download
                    </button>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p>
                      <span className="font-medium text-slate-800">Diagnosis:</span>{" "}
                      {prescription.diagnosis}
                    </p>

                    <div>
                      <p className="font-medium text-slate-800">Medicines:</p>
                      <ul className="mt-2 space-y-2">
                        {prescription.medicines.map((medicine, index) => (
                          <li
                            key={index}
                            className="rounded-xl bg-slate-50 px-3 py-2"
                          >
                            <span className="font-medium text-slate-800">
                              {medicine.name}
                            </span>{" "}
                            — {medicine.dosage}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p>
                      <span className="font-medium text-slate-800">Notes:</span>{" "}
                      {prescription.notes}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                No prescriptions found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionPage;