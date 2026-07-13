import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { BANNERS as FALLBACK_BANNERS } from "../data/mock";

export default function BannerSlider() {
  const [banners, setBanners] = useState([]);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/banners/")
      .then((res) => {
        const data = res.data.results ?? res.data;
        setBanners(data.length > 0 ? data : FALLBACK_BANNERS);
      })
      .catch(() => setBanners(FALLBACK_BANNERS));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % banners.length), 4800);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) return null;

  function prev() {
    setActive((i) => (i - 1 + banners.length) % banners.length);
  }

  function next() {
    setActive((i) => (i + 1) % banners.length);
  }

  return (
    <div className="banner-slider">
      <div className="banner-track" style={{ transform: `translateX(-${active * 100}%)` }}>
        {banners.map((b) => (
          <div
            key={b.id}
            className="banner-slide"
            style={b.image ? {
              backgroundImage: `url(${b.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            } : { background: b.gradient }}
          >
            {b.emoji && <span className="banner-emoji">{b.emoji}</span>}
            <div className="banner-copy">
              <h2>{b.title}</h2>
              {b.subtitle && <p>{b.subtitle}</p>}
              <button className="banner-cta" onClick={() => navigate("/products")}>
                {b.cta || "Shop Now"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button className="banner-arrow banner-arrow-left" onClick={prev} aria-label="Previous slide">‹</button>
          <button className="banner-arrow banner-arrow-right" onClick={next} aria-label="Next slide">›</button>
          <div className="banner-dots">
            {banners.map((b, i) => (
              <button
                key={b.id}
                className={`banner-dot${i === active ? " active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
