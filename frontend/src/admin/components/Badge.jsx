const VARIANTS = {
  pending:    "bg-amber-100 text-amber-700 border-amber-200",
  paid:       "bg-blue-100 text-blue-700 border-blue-200",
  shipped:    "bg-purple-100 text-purple-700 border-purple-200",
  delivered:  "bg-green-100 text-green-700 border-green-200",
  cancelled:  "bg-red-100 text-red-700 border-red-200",
  returned:   "bg-gray-100 text-gray-600 border-gray-200",
  processing: "bg-indigo-100 text-indigo-700 border-indigo-200",
  active:     "bg-green-100 text-green-700 border-green-200",
  inactive:   "bg-gray-100 text-gray-600 border-gray-200",
  low:        "bg-amber-100 text-amber-700 border-amber-200",
  out:        "bg-red-100 text-red-700 border-red-200",
  default:    "bg-gray-100 text-gray-600 border-gray-200",
};

export default function Badge({ status, label }) {
  const key = (status || "default").toLowerCase().replace(/\s/g, "_");
  const cls = VARIANTS[key] || VARIANTS.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls} capitalize`}>
      {label || status}
    </span>
  );
}
