export default function RatingStars({ rating = 0, reviewCount }) {
  const full = Math.round(rating);
  return (
    <span className="rating-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? "star filled" : "star"}>
          ★
        </span>
      ))}
      <span className="rating-value">{rating}</span>
      {reviewCount != null && <span className="rating-count">({reviewCount})</span>}
    </span>
  );
}
