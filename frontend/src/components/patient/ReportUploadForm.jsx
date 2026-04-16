import { Upload } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600";

const fileInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-700 hover:file:bg-cyan-100";

function ReportUploadForm({ form, uploading, onChange, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50">
          <Upload className="h-5 w-5 text-cyan-700" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">
          Upload New Report
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Report Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="e.g. Blood Test Report"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Report Type
          </label>
          <input
            type="text"
            name="reportType"
            value={form.reportType}
            onChange={onChange}
            placeholder="Lab Report / Scan / X-Ray"
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          rows="3"
          placeholder="Add a short description for this report"
          className={inputClass}
        />
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Upload File <span className="text-red-400">*</span>
        </label>
        <input
          id="reportFileInput"
          type="file"
          name="reportFile"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onChange}
          className={fileInputClass}
          required
        />
        <p className="mt-1.5 text-xs text-slate-400">
          Accepted formats: PDF, JPG, JPEG, PNG
        </p>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Report"}
        </button>
      </div>
    </form>
  );
}

export default ReportUploadForm;
