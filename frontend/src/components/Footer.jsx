import { Link } from "react-router-dom";

const COMPANY = [
  { label: "About Us", to: "/" },
  { label: "Careers", to: "/" },
  { label: "Contact Us", to: "/" },
  { label: "Blog", to: "/" },
];

const CUSTOMER = [
  { label: "FAQs", to: "/" },
  { label: "Track Order", to: "/orders" },
  { label: "Returns & Refunds", to: "/" },
  { label: "Shipping Info", to: "/" },
  { label: "Help & Support", to: "/" },
];

const POLICIES = [
  { label: "Privacy Policy", to: "/" },
  { label: "Terms & Conditions", to: "/" },
  { label: "Refund Policy", to: "/" },
  { label: "Cookie Policy", to: "/" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="footer-logo">
              Sajilo<span>Style</span>
            </div>
            <p>
              Nepal's premium fashion destination. Discover the latest trends in men's, women's, and traditional wear —
              delivered right to your door.
            </p>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul className="footer-links">
              {COMPANY.map((l) => (
                <li key={l.label}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customer Service</h4>
            <ul className="footer-links">
              {CUSTOMER.map((l) => (
                <li key={l.label}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Policies</h4>
            <ul className="footer-links">
              {POLICIES.map((l) => (
                <li key={l.label}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SajiloStyle. All rights reserved.</p>
          <div className="footer-pay-icons">
            <span className="pay-pill">eSewa</span>
            <span className="pay-pill">Khalti</span>
            <span className="pay-pill">IME Pay</span>
            <span className="pay-pill">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
