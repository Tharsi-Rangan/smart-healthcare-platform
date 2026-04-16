import { Camera, User } from "lucide-react";
import { getInitials, getImageUrl } from "../../features/patient/patientUtils";

function PatientAvatarCard({ name, phone, profileImage, uploadingAvatar, onAvatarUpload }) {
  const resolvedImage = getImageUrl(profileImage);

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        {/* Avatar circle */}
        <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-sky-50 bg-slate-50 shadow-inner">
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
              <span className="text-3xl font-extrabold text-sky-600">
                {getInitials(name)}
              </span>
            ) : (
              <User className="h-12 w-12 text-slate-300" />
            )}
          </div>
        </div>

        {/* Name and phone */}
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          {name || "Patient Profile"}
        </h2>
        <p className="mt-2 text-base font-medium text-slate-500">
          {phone || "Add phone for easy contact"}
        </p>

        {/* Avatar upload */}
        <div className="mt-8 w-full">
          <label
            className={`inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95 ${
              uploadingAvatar ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            <Camera className="h-5 w-5 text-sky-600" />
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
