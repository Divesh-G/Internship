import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/");
    } catch {
      setError("Invalid username or password.");
    }
  }

  return (
    <div>
      <div className="page-top-bar">
        <h1>Login</h1>
      </div>
      <div className="app-content form-page">
        <div className="form-card">
          <h1 style={{ textAlign: "center", marginBottom: 4 }}>
            Sajilo<span style={{ color: "var(--color-primary)" }}>Style</span>
          </h1>
          <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: 13, marginBottom: 20 }}>
            Welcome back! Login to continue shopping.
          </p>
          <form onSubmit={handleSubmit}>
            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="btn-block" type="submit">
              Login
            </button>
          </form>
          <p className="form-switch">
            New to SajiloStyle? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
