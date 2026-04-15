/**
 * A reusable status badge (pill) with consistent styling.
 * 
 * @param {Object} props
 * @param {string} props.status - The status text (e.g., 'active', 'resolved')
 * @param {Object} props.variantMap - Mapping of status values to color classes
 * @param {string} [props.className] - Additional class names
 */
function StatusBadge({ status, variantMap, className = "" }) {
  const variant = variantMap[status.toLowerCase()] || "bg-slate-100 text-slate-600 border-slate-200";
  
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${variant} ${className}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
