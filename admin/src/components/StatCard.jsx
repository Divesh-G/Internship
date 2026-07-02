export default function StatCard({ title, value, sub, icon, trend, color = "primary" }) {
  const colors = {
    primary: { bg: "bg-red-50", icon: "bg-red-500", text: "text-red-600" },
    blue:    { bg: "bg-blue-50",  icon: "bg-blue-500",  text: "text-blue-600" },
    green:   { bg: "bg-green-50", icon: "bg-green-500", text: "text-green-600" },
    amber:   { bg: "bg-amber-50", icon: "bg-amber-500", text: "text-amber-600" },
    purple:  { bg: "bg-purple-50",icon: "bg-purple-500",text: "text-purple-600" },
    slate:   { bg: "bg-slate-50", icon: "bg-slate-500", text: "text-slate-600" },
  };
  const c = colors[color] || colors.primary;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 font-[Poppins]">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`${c.icon} w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg shrink-0`}>
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`text-xs font-bold ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
          <span className="text-xs text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
