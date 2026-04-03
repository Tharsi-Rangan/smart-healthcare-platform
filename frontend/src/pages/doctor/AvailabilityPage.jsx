import { useEffect, useMemo, useState } from "react";
import {
  getDoctorAvailability,
  updateDoctorAvailability,
} from "../../api/doctorApi";

const newSlot = {
  day: "Monday",
  startTime: "",
  endTime: "",
  slotDuration: 30,
  isActive: true,
};

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function AvailabilityPage() {
  const [slots, setSlots] = useState([newSlot]);
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
              day: slot.day || "Monday",
              startTime: slot.startTime || "",
              endTime: slot.endTime || "",
              slotDuration: slot.slotDuration || 30,
              isActive: slot.isActive !== false,
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

  const stats = useMemo(() => {
    const total = slots.length;
    const active = slots.filter((slot) => slot.isActive !== false).length;
    const inactive = total - active;
    const avgDuration =
      total > 0
        ? Math.round(
            slots.reduce((sum, slot) => sum + (Number(slot.slotDuration) || 0), 0) /
              total
          )
        : 0;

    return { total, active, inactive, avgDuration };
  }, [slots]);

  const handleChange = (index, field, value) => {
    setSlots((prev) =>
      prev.map((slot, i) =>
        i === index
          ? {
              ...slot,
              [field]: field === "slotDuration" ? Number(value) : value,
            }
          : slot
      )
    );
  };

  const toggleActive = (index) => {
    setSlots((prev) =>
      prev.map((slot, i) =>
        i === index ? { ...slot, isActive: !slot.isActive } : slot
      )
    );
  };

  const addSlot = () => {
    setSlots((prev) => [...prev, { ...newSlot }]);
  };

  const removeSlot = (index) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const validateSlots = () => {
    for (const slot of slots) {
      if (!slot.day || !slot.startTime || !slot.endTime) {
        return "Please fill day, start time, and end time for all slots.";
      }

      if (!slot.slotDuration || Number(slot.slotDuration) < 5) {
        return "Slot duration must be at least 5 minutes.";
      }
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const validationError = validateSlots();

    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

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
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-base text-slate-500">Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-[32px] border border-slate-200 bg-gradient-to-r from-cyan-600 to-sky-700 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-100">
              Doctor Schedule Management
            </p>
            <h1 className="mt-3 text-4xl font-bold md:text-5xl">
              Availability
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-cyan-50">
              Set your weekly working hours and manage consultation slots for
              appointment handling.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 px-5 py-4 backdrop-blur-sm">
            <p className="text-sm text-cyan-100">Active Slots</p>
            <p className="mt-2 text-3xl font-bold">{stats.active}</p>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-base text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-base text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Total Slots
          </p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">
            {stats.total}
          </h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Active
          </p>
          <h3 className="mt-3 text-3xl font-bold text-emerald-600">
            {stats.active}
          </h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Inactive
          </p>
          <h3 className="mt-3 text-3xl font-bold text-slate-600">
            {stats.inactive}
          </h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Avg Duration
          </p>
          <h3 className="mt-3 text-3xl font-bold text-cyan-600">
            {stats.avgDuration} mins
          </h3>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Actions */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Weekly Schedule
              </h2>
              <p className="mt-2 text-slate-500">
                Add and manage the time slots patients can book.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={addSlot}
                className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                Add Time Slot
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </div>
        </section>

        {/* Slot cards */}
        <section className="space-y-5">
          {slots.length > 0 ? (
            slots.map((slot, index) => (
              <div
                key={index}
                className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Slot {index + 1}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Configure day, time range, and slot duration.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(index)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          slot.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {slot.isActive ? "Active" : "Inactive"}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeSlot(index)}
                        className="rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        Day
                      </label>
                      <select
                        value={slot.day}
                        onChange={(e) => handleChange(index, "day", e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                      >
                        {daysOfWeek.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          handleChange(index, "startTime", e.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          handleChange(index, "endTime", e.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        Slot Duration (mins)
                      </label>
                      <input
                        type="number"
                        min="5"
                        value={slot.slotDuration}
                        onChange={(e) =>
                          handleChange(index, "slotDuration", e.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-800">
                No schedule slots available
              </p>
              <p className="mt-2 text-slate-500">
                Add your first availability slot to begin managing bookings.
              </p>
              <button
                type="button"
                onClick={addSlot}
                className="mt-5 inline-flex rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                Add First Slot
              </button>
            </div>
          )}
        </section>
      </form>
    </div>
  );
}

export default AvailabilityPage;