/**
 * A reusable card wrapper for profile sections.
 * Renders a white rounded card with a title and children content.
 */
function ProfileSectionCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {title && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
}

export default ProfileSectionCard;
