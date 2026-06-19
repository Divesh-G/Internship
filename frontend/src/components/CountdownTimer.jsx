import { useEffect, useState } from "react";

function split(msLeft) {
  const total = Math.max(0, Math.floor(msLeft / 1000));
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer({ endsAt }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { h, m, s } = split(endsAt - now);

  return (
    <div className="countdown">
      <span className="countdown-box">{pad(h)}</span>
      <span>:</span>
      <span className="countdown-box">{pad(m)}</span>
      <span>:</span>
      <span className="countdown-box">{pad(s)}</span>
    </div>
  );
}
