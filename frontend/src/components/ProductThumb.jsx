const PALETTE = ["#0f766e", "#7c3aed", "#b45309", "#be123c", "#1d4ed8", "#15803d"];

function colorFor(text) {
  const code = (text || "").split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return PALETTE[code % PALETTE.length];
}

export default function ProductThumb({ name, size = "full" }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`product-thumb product-thumb-${size}`} style={{ background: colorFor(name) }}>
      {initials}
    </div>
  );
}
