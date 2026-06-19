import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState("");

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      const data = err?.response?.data;
      setError(data ? JSON.stringify(data) : "Registration failed.");
    }
  }

  return (
    <div>
      <div className="page-top-bar">
        <h1>Create Account</h1>
      </div>
      <div className="app-content form-page">
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <label>
              Username
              <input value={form.username} onChange={update("username")} required />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={update("email")} required />
            </label>
            <div className="form-row">
              <label>
                First name
                <input value={form.first_name} onChange={update("first_name")} />
              </label>
              <label>
                Last name
                <input value={form.last_name} onChange={update("last_name")} />
              </label>
            </div>
            <label>
              Password
              <input type="password" value={form.password} onChange={update("password")} required />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="btn-block" type="submit">
              Create account
            </button>
          </form>
          <p className="form-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
