import { Camera, User } from "lucide-react";
import { getInitials, getImageUrl } from "../../features/patient/patientUtils";

function PatientAvatarCard({ name, phone, profileImage, uploadingAvatar, onAvatarUpload }) {
  const resolvedImage = getImageUrl(profileImage);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        {/* Avatar circle */}
        <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-100 bg-slate-100">
          {resolvedImage ? (
            <img
              src={resolvedImage}
              alt={name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ display: resolvedImage ? "none" : "flex" }}
          >
            {name ? (
              <span className="text-2xl font-bold text-cyan-700">
                {getInitials(name)}
              </span>
            ) : (
              <User className="h-10 w-10 text-slate-400" />
            )}
          </div>
        </div>

        {/* Name and phone */}
        <h2 className="mt-4 text-xl font-semibold text-slate-800">
          {name || "Patient"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {phone || "No phone number added"}
        </p>

        {/* Avatar upload */}
        <div className="mt-5 w-full">
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 ${
              uploadingAvatar ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            <Camera className="h-4 w-4 text-slate-500" />
            {uploadingAvatar ? "Uploading..." : "Change Photo"}
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={onAvatarUpload}
              className="hidden"
              disabled={uploadingAvatar}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default PatientAvatarCard;
