import { ExternalLink, Pencil, RefreshCw, Trash2, X, Check } from "lucide-react";
import { formatDate, formatFileSize, getFileUrl } from "../../features/patient/patientUtils";

const fileInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-700 hover:file:bg-cyan-100";

function ReportCard({
  report,
  replacingId,
  replacing,
  replacementFile,
  onStartEdit,
  onStartReplace,
  onCancelReplace,
  onReplacementFileChange,
  onConfirmReplace,
  onDelete,
}) {
  const isReplacing = replacingId === report._id;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-cyan-100 hover:shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Report info */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-800">
              {report.title}
            </h3>
            {report.reportType && (
              <span className="rounded-full border border-cyan-100 bg-white px-3 py-0.5 text-xs font-semibold text-cyan-700">
                {report.reportType}
              </span>
            )}
          </div>

          <div className="grid gap-x-6 gap-y-1 text-sm text-slate-600 md:grid-cols-2">
            <p>
              <span className="font-medium text-slate-700">File: </span>
              {report.originalFileName}
            </p>
            <p>
              <span className="font-medium text-slate-700">Size: </span>
              {formatFileSize(report.fileSize)}
            </p>
            <p>
              <span className="font-medium text-slate-700">Uploaded: </span>
              {formatDate(report.uploadedAt)}
            </p>
            {report.description && (
              <p className="md:col-span-2">
                <span className="font-medium text-slate-700">Description: </span>
                {report.description}
              </p>
            )}
          </div>

          {/* Open file link */}
          <div className="pt-1">
            <a
              href={getFileUrl(report.filePath)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open File
            </a>
          </div>

          {/* Inline replace file section */}
          {isReplacing && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-sm font-medium text-slate-700">
                Choose a new file to replace the current one:
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={onReplacementFileChange}
                className={fileInputClass}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onConfirmReplace(report._id)}
                  disabled={replacing}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Check className="h-3.5 w-3.5" />
                  {replacing ? "Replacing..." : "Confirm Replace"}
                </button>
                <button
                  type="button"
                  onClick={onCancelReplace}
                  disabled={replacing}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onStartEdit(report)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Details
          </button>
          <button
            type="button"
            onClick={() => onStartReplace(report._id)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Replace File
          </button>
          <button
            type="button"
            onClick={() => onDelete(report._id)}
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

export default ReportCard;
