import { useEffect, useMemo, useState } from "react";
import {
  createPrescription,
  getPrescriptions,
} from "../../api/doctorApi";

function PrescriptionPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    patientName: "",
    diagnosis: "",
    medicines: [{ name: "", dosage: "" }],
    notes: "",
  });

  const loadPrescriptions = async () => {
    try {
      setError("");
      const response = await getPrescriptions();
      setPrescriptions(response.data?.prescriptions || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((item) => {
      return (
        item.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        item.diagnosis?.toLowerCase().includes(search.toLowerCase())
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
      medicines: prev.medicines.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addMedicine = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", dosage: "" }],
    }));
  };

  const removeMedicine = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const cleanedMedicines = formData.medicines.filter(
        (item) => item.name.trim() && item.dosage.trim()
      );

      const payload = {
        ...formData,
        medicines: cleanedMedicines,
      };

      const response = await createPrescription(payload);

      setMessage(response.message || "Prescription created successfully");

      setFormData({
        patientName: "",
        diagnosis: "",
        medicines: [{ name: "", dosage: "" }],
        notes: "",
      });

      await loadPrescriptions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create prescription");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-slate-900">
          Digital Prescriptions
        </h1>
        <p className="mt-3 text-2xl text-slate-500">
          Create and manage prescriptions
        </p>
      </div>

      {message && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-lg text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-lg text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1fr,1fr]">
        {/* LEFT - FORM */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-8 text-4xl font-semibold text-slate-900">
            Issue Prescription
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-3 block text-xl text-slate-500">
                Patient Name
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="mb-3 block text-xl text-slate-500">
                Diagnosis
              </label>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                placeholder="Mild hypertension"
              />
            </div>

            {/* Medicines */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xl text-slate-500">Medicines</label>
                <button
                  type="button"
                  onClick={addMedicine}
                  className="rounded-2xl bg-slate-100 px-5 py-3 text-xl font-medium text-slate-900"
                >
                  Add
                </button>
              </div>

              {formData.medicines.map((med, index) => (
                <div
                  key={index}
                  className="grid gap-4 rounded-[24px] border border-slate-200 p-5 md:grid-cols-[1fr,1fr,auto]"
                >
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) =>
                      handleMedicineChange(index, "name", e.target.value)
                    }
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-xl outline-none"
                    placeholder="Medicine name"
                  />

                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) =>
                      handleMedicineChange(index, "dosage", e.target.value)
                    }
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-xl outline-none"
                    placeholder="Dosage"
                  />

                  <button
                    type="button"
                    onClick={() => removeMedicine(index)}
                    className="rounded-2xl bg-rose-50 px-4 py-4 text-xl text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="mb-3 block text-xl text-slate-500">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                placeholder="Additional instructions..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-cyan-600 px-8 py-4 text-2xl font-semibold text-white"
            >
              {saving ? "Saving..." : "Create Prescription"}
            </button>
          </form>
        </div>

        {/* RIGHT - LIST */}
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-4xl font-semibold text-slate-900">
              Prescriptions
            </h2>

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
            />
          </div>

          {loading ? (
            <div className="text-xl text-slate-500">Loading...</div>
          ) : filteredPrescriptions.length > 0 ? (
            filteredPrescriptions.map((item) => (
              <div
                key={item._id}
                className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm"
              >
                <h3 className="text-3xl font-semibold text-slate-900">
                  {item.patientName}
                </h3>

                <p className="mt-2 text-xl text-slate-500">
                  {item.issuedAt}
                </p>

                <div className="mt-4 text-xl">
                  <p>
                    <b>Diagnosis:</b> {item.diagnosis}
                  </p>

                  <div className="mt-3 space-y-2">
                    {item.medicines.map((med, i) => (
                      <div key={i} className="rounded-xl bg-slate-50 p-3">
                        {med.name} — {med.dosage}
                      </div>
                    ))}
                  </div>

                  <p className="mt-3">
                    <b>Notes:</b> {item.notes}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xl text-slate-500">No prescriptions found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrescriptionPage;