const COLORS = {
  pending: "#b45309",
  paid: "#1d4ed8",
  shipped: "#7c3aed",
  delivered: "#15803d",
  cancelled: "#be123c",
};

export default function StatusBadge({ status }) {
  const color = COLORS[status] || "#444";
  return (
    <span className="status-badge" style={{ color, borderColor: color, background: `${color}1a` }}>
      {status}
    </span>
  );
}
