import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login/", form);
      localStorage.setItem("admin_token", res.data.access);
      localStorage.setItem("admin_refresh", res.data.refresh);
      navigate("/");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          background: #07080f;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: "Inter", system-ui, sans-serif;
        }

        /* Subtle dot-grid background */
        .login-page::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        /* Ambient floating orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          opacity: 0;
          animation: orbFadeIn 2s ease forwards;
        }
        .orb-1 {
          width: 560px; height: 560px;
          background: radial-gradient(circle, #4f46e5 0%, transparent 70%);
          top: -160px; left: -160px;
          opacity: 0;
          animation: orbFadeIn 2s 0.2s ease forwards, orb1Float 14s 2s ease-in-out infinite;
        }
        .orb-2 {
          width: 480px; height: 480px;
          background: radial-gradient(circle, #7c3aed 0%, transparent 70%);
          bottom: -120px; right: -100px;
          animation: orbFadeIn 2s 0.5s ease forwards, orb2Float 18s 2s ease-in-out infinite;
        }
        .orb-3 {
          width: 320px; height: 320px;
          background: radial-gradient(circle, #1e40af 0%, transparent 70%);
          top: 40%; left: 55%;
          animation: orbFadeIn 2s 0.8s ease forwards, orb3Float 22s 2s ease-in-out infinite;
        }

        @keyframes orbFadeIn {
          to { opacity: 0.18; }
        }
        @keyframes orb1Float {
          0%, 100% { transform: translate(0, 0); }
          40%       { transform: translate(40px, 30px); }
          70%       { transform: translate(-20px, 50px); }
        }
        @keyframes orb2Float {
          0%, 100% { transform: translate(0, 0); }
          35%       { transform: translate(-50px, -30px); }
          65%       { transform: translate(30px, -60px); }
        }
        @keyframes orb3Float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-40px, 30px) scale(1.1); }
        }

        /* Card entrance */
        .login-card {
          animation: cardUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes cardUp {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Logo */
        .login-logo-wrap {
          animation: logoIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes logoIn {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Staggered form rows */
        .login-row-1 { animation: rowIn 0.5s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .login-row-2 { animation: rowIn 0.5s 0.25s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .login-row-3 { animation: rowIn 0.5s 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Input styles */
        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.2); }
        .login-input:focus {
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.05);
        }

        /* Button */
        .login-btn {
          width: 100%;
          background: #fff;
          color: #07080f;
          font-weight: 700;
          font-size: 14px;
          padding: 13px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          font-family: inherit;
          letter-spacing: 0.01em;
        }
        .login-btn:hover:not(:disabled) {
          background: #f1f1f1;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* Spinner inside button */
        .btn-spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(0,0,0,0.15);
          border-top-color: #07080f;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Feature pills at bottom */
        .feature-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 99px;
          padding: 4px 10px;
        }
      `}</style>

      <div className="login-page">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div style={{ width: "100%", maxWidth: 400, padding: "0 24px", position: "relative", zIndex: 10 }}>

          {/* Logo */}
          <div className="login-logo-wrap" style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 44, height: 44, borderRadius: 14,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              marginBottom: 14,
            }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>S</span>
            </div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: "-0.01em" }}>
              Sajilo<span style={{ color: "rgba(255,255,255,0.45)" }}>Admin</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 4 }}>
              Sign in to your workspace
            </div>
          </div>

          {/* Card */}
          <div className="login-card" style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 20,
            padding: 32,
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}>
            <form onSubmit={handleSubmit}>

              <div className="login-row-1" style={{ marginBottom: 16 }}>
                <label style={{
                  display: "block", fontSize: 10, fontWeight: 700,
                  color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
                  letterSpacing: "0.1em", marginBottom: 8,
                }}>
                  Username
                </label>
                <input
                  type="text"
                  placeholder="admin"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  onFocus={() => setFocused("user")}
                  onBlur={() => setFocused("")}
                  required
                  className="login-input"
                />
              </div>

              <div className="login-row-2" style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block", fontSize: 10, fontWeight: 700,
                  color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
                  letterSpacing: "0.1em", marginBottom: 8,
                }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused("pass")}
                  onBlur={() => setFocused("")}
                  required
                  className="login-input"
                />
              </div>

              {error && (
                <div style={{
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                  display: "flex", alignItems: "center", gap: 8,
                  animation: "rowIn 0.3s ease both",
                }}>
                  <span style={{ fontSize: 13 }}>⚠</span>
                  <span style={{ color: "rgba(252,165,165,0.9)", fontSize: 13 }}>{error}</span>
                </div>
              )}

              <div className="login-row-3">
                <button type="submit" disabled={loading} className="login-btn">
                  {loading ? (
                    <><span className="btn-spinner" />Signing in…</>
                  ) : (
                    "Sign in →"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
            {["📦 Orders", "👗 Products", "📊 Analytics"].map((t) => (
              <span key={t} className="feature-pill">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
