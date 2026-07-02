import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BANNERS } from "../data/mock";

export default function BannerSlider() {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % BANNERS.length), 4800);
    return () => clearInterval(id);
  }, []);

  function prev() {
    setActive((i) => (i - 1 + BANNERS.length) % BANNERS.length);
  }

  function next() {
    setActive((i) => (i + 1) % BANNERS.length);
  }

  return (
    <div className="banner-slider">
      <div className="banner-track" style={{ transform: `translateX(-${active * 100}%)` }}>
        {BANNERS.map((b) => (
          <div key={b.id} className="banner-slide" style={{ background: b.gradient }}>
            <span className="banner-emoji">{b.emoji}</span>
            <div className="banner-copy">
              <h2>{b.title}</h2>
              <p>{b.subtitle}</p>
              <button className="banner-cta" onClick={() => navigate("/products")}>
                {b.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="banner-arrow banner-arrow-left"
        onClick={prev}
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        className="banner-arrow banner-arrow-right"
        onClick={next}
        aria-label="Next slide"
      >
        ›
      </button>

      <div className="banner-dots">
        {BANNERS.map((b, i) => (
          <button
            key={b.id}
            className={`banner-dot${i === active ? " active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
