import { Pencil, Trash2 } from "lucide-react";
import { formatDate } from "../../features/patient/patientUtils";

const STATUS_STYLES = {
  active: "bg-cyan-50 text-cyan-700 border-cyan-100",
  ongoing: "bg-amber-50 text-amber-700 border-amber-100",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

function MedicalHistoryCard({ record, onEdit, onDelete }) {
  const statusClass =
    STATUS_STYLES[record.status] || "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-cyan-100 hover:shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Info */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-800">
              {record.conditionName}
            </h3>
            <span
              className={`rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${statusClass}`}
            >
              {record.status}
            </span>
          </div>

          <div className="grid gap-x-6 gap-y-1 text-sm text-slate-600 md:grid-cols-2">
            <p>
              <span className="font-medium text-slate-700">Diagnosis Date: </span>
              {formatDate(record.diagnosisDate)}
            </p>
            <p>
              <span className="font-medium text-slate-700">Source: </span>
              {record.source || "-"}
            </p>
            <p>
              <span className="font-medium text-slate-700">Medications: </span>
              {record.medications || "-"}
            </p>
            <p>
              <span className="font-medium text-slate-700">Notes: </span>
              {record.notes || "-"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit(record)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(record._id)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default MedicalHistoryCard;
