import { gradientFor, iconForCategory } from "../data/mock";

const SIZE_CLASS = {
  card: "product-thumb-card",
  gallery: "product-thumb-gallery",
  mini: "product-thumb-mini",
  banner: "product-thumb-banner",
};

export default function ProductThumb({ name, category = "", size = "card", style }) {
  return (
    <div
      className={`product-thumb ${SIZE_CLASS[size] || SIZE_CLASS.card}`}
      style={{ background: gradientFor(name), ...style }}
    >
      <span className="product-thumb-icon">{iconForCategory(`${category} ${name}`)}</span>
    </div>
  );
}
