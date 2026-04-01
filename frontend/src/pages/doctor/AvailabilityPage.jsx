import { useEffect, useState } from "react";
import {
  getDoctorAvailability,
  updateDoctorAvailability,
} from "../../api/doctorApi";

const emptySlot = {
  day: "Monday",
  startTime: "",
  endTime: "",
  slotDuration: 30,
  isActive: true,
};

function AvailabilityPage() {
  const [slots, setSlots] = useState([emptySlot]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const response = await getDoctorAvailability();
        const data = response.data?.availability || [];

        if (data.length > 0) {
          setSlots(
            data.map((slot) => ({
              day: slot.day,
              startTime: slot.startTime,
              endTime: slot.endTime,
              slotDuration: slot.slotDuration,
              isActive: slot.isActive,
            }))
          );
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || "Failed to load availability");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, []);

  const handleChange = (index, field, value) => {
    setSlots((prev) =>
      prev.map((slot, i) =>
        i === index ? { ...slot, [field]: field === "slotDuration" ? Number(value) : value } : slot
      )
    );
  };

  const addSlot = () => {
    setSlots((prev) => [...prev, emptySlot]);
  };

  const removeSlot = (index) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await updateDoctorAvailability({ slots });
      setMessage(response.message || "Availability saved successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-slate-500">Loading availability...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Availability</h1>
        <p className="mt-1 text-sm text-slate-500">
          Set your working days and available consultation slots.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-5"
          >
            <select
              value={slot.day}
              onChange={(e) => handleChange(index, "day", e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
            >
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
              <option>Sunday</option>
            </select>

            <input
              type="time"
              value={slot.startTime}
              onChange={(e) => handleChange(index, "startTime", e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
            />

            <input
              type="time"
              value={slot.endTime}
              onChange={(e) => handleChange(index, "endTime", e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
            />

            <input
              type="number"
              value={slot.slotDuration}
              onChange={(e) => handleChange(index, "slotDuration", e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
              min="5"
              placeholder="Duration"
            />

            <button
              type="button"
              onClick={() => removeSlot(index)}
              className="rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        ))}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={addSlot}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Add Slot
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Availability"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AvailabilityPage;