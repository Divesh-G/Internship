import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { PAYMENT_METHODS } from "../data/mock";

const SMS_PREF_KEY = "sajilo_sms_updates";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [smsUpdates, setSmsUpdates] = useState(() => localStorage.getItem(SMS_PREF_KEY) !== "off");

  useEffect(() => {
    api
      .get("/orders/")
      .then((res) => setOrders(res.data.results ?? res.data))
      .catch(() => {});
  }, []);

  const addresses = [];
  const seen = new Set();
  for (const o of orders) {
    const key = `${o.shipping_address}|${o.shipping_city}`;
    if (!seen.has(key)) {
      seen.add(key);
      addresses.push(o);
    }
  }

  function toggleSms() {
    const next = !smsUpdates;
    setSmsUpdates(next);
    localStorage.setItem(SMS_PREF_KEY, next ? "on" : "off");
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const initials = (user?.username || "?").slice(0, 2).toUpperCase();

  return (
    <div>
      <div className="page-top-bar">
        <h1>Profile</h1>
      </div>
      <div className="app-content narrow">
        <div className="profile-header">
          <span className="profile-avatar">{initials}</span>
          <div>
            <h2>{user?.username}</h2>
            <p>{user?.email || "No email on file"}</p>
          </div>
        </div>

        <div className="menu-list">
          <button className="menu-item" onClick={() => navigate("/orders")}>
            <span className="menu-icon">📦</span>
            Order History
            <span className="chevron">›</span>
          </button>
          <button className="menu-item" onClick={() => navigate("/wishlist")}>
            <span className="menu-icon">❤️</span>
            Wishlist
            <span className="chevron">›</span>
          </button>
        </div>

        <h2 style={{ margin: "20px 0 10px" }}>Saved Addresses</h2>
        {addresses.length === 0 ? (
          <p className="order-meta">Addresses you ship orders to will appear here.</p>
        ) : (
          addresses.slice(0, 3).map((o, i) => (
            <div className="cart-item-card" key={o.id}>
              <span style={{ fontSize: 22 }}>📍</span>
              <div className="cart-item-info">
                <h3>{o.shipping_city}{i === 0 ? " (Default)" : ""}</h3>
                <p className="meta">
                  {o.shipping_address}, {o.shipping_postal_code}, {o.shipping_country}
                </p>
              </div>
            </div>
          ))
        )}

        <h2 style={{ margin: "20px 0 10px" }}>Payment Methods</h2>
        <div className="menu-list">
          {PAYMENT_METHODS.map((m) => (
            <div className="menu-item" key={m.id} style={{ cursor: "default" }}>
              <span className="menu-icon">{m.icon}</span>
              {m.label}
              <span className="chevron" style={{ fontSize: 11, color: "var(--color-success)" }}>
                Available
              </span>
            </div>
          ))}
        </div>

        <h2 style={{ margin: "20px 0 10px" }}>Settings</h2>
        <div className="menu-list">
          <div className="menu-item" style={{ cursor: "default" }}>
            <span className="menu-icon">🔔</span>
            Order updates via SMS
            <button className="chip" style={{ marginLeft: "auto" }} onClick={toggleSms}>
              {smsUpdates ? "On" : "Off"}
            </button>
          </div>
          <button className="menu-item" onClick={handleLogout} style={{ color: "var(--color-danger)" }}>
            <span className="menu-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
