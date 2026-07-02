import { useState } from "react";
import { useToast } from "../components/Toast";

const INPUT = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all bg-white";

function Section({ title, desc, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">{title}</h3>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const toast = useToast();
  const [store, setStore] = useState({
    name: "SajiloStyle", tagline: "Nepal's Premium Fashion Store",
    email: "hello@sajilostyle.com.np", phone: "+977-1-4XXXXXX",
    address: "Thamel, Kathmandu, Nepal",
    currency: "NPR", timezone: "Asia/Kathmandu",
    taxRate: "13", freeShippingThreshold: "1999",
  });

  const [social, setSocial] = useState({
    facebook: "https://facebook.com/sajilostyle",
    instagram: "https://instagram.com/sajilostyle",
    tiktok: "",
    linkedin: "",
  });

  const [payment, setPayment] = useState({
    cod: true, esewa: false, khalti: false, imepay: false,
  });

  function save(section) {
    toast(`${section} settings saved`, "success");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage store configuration</p>
      </div>

      <Section title="Store Information" desc="Basic details about your store">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Store Name">
              <input className={INPUT} value={store.name}
                onChange={(e) => setStore({ ...store, name: e.target.value })} />
            </Field>
            <Field label="Tagline">
              <input className={INPUT} value={store.tagline}
                onChange={(e) => setStore({ ...store, tagline: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact Email">
              <input className={INPUT} type="email" value={store.email}
                onChange={(e) => setStore({ ...store, email: e.target.value })} />
            </Field>
            <Field label="Contact Phone">
              <input className={INPUT} value={store.phone}
                onChange={(e) => setStore({ ...store, phone: e.target.value })} />
            </Field>
          </div>
          <Field label="Address">
            <input className={INPUT} value={store.address}
              onChange={(e) => setStore({ ...store, address: e.target.value })} />
          </Field>
          <div className="flex justify-end">
            <button onClick={() => save("Store")}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </Section>

      <Section title="Regional Settings" desc="Currency, timezone and tax">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Currency">
              <select className={INPUT} value={store.currency}
                onChange={(e) => setStore({ ...store, currency: e.target.value })}>
                <option value="NPR">NPR (Rs.)</option>
                <option value="USD">USD ($)</option>
              </select>
            </Field>
            <Field label="Timezone">
              <select className={INPUT} value={store.timezone}
                onChange={(e) => setStore({ ...store, timezone: e.target.value })}>
                <option value="Asia/Kathmandu">Asia/Kathmandu (+05:45)</option>
                <option value="UTC">UTC</option>
              </select>
            </Field>
            <Field label="Tax Rate (%)" hint="Applied at checkout">
              <input className={INPUT} type="number" step="0.1" value={store.taxRate}
                onChange={(e) => setStore({ ...store, taxRate: e.target.value })} />
            </Field>
          </div>
          <Field label="Free Shipping Threshold (Rs.)" hint="Orders above this amount get free shipping">
            <input className={INPUT} type="number" value={store.freeShippingThreshold}
              onChange={(e) => setStore({ ...store, freeShippingThreshold: e.target.value })} />
          </Field>
          <div className="flex justify-end">
            <button onClick={() => save("Regional")}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </Section>

      <Section title="Payment Methods" desc="Configure accepted payment gateways">
        <div className="space-y-3">
          {[
            { key: "cod",    label: "Cash on Delivery", icon: "💵", desc: "Always available" },
            { key: "esewa",  label: "eSewa",            icon: "🟢", desc: "Nepal's #1 digital wallet" },
            { key: "khalti", label: "Khalti",           icon: "🟣", desc: "Popular digital wallet" },
            { key: "imepay", label: "IME Pay",          icon: "🔵", desc: "Bank-linked wallet" },
          ].map((p) => (
            <div key={p.key} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{p.label}</p>
                  <p className="text-xs text-gray-400">{p.desc}</p>
                </div>
              </div>
              <button
                onClick={() => setPayment((prev) => ({ ...prev, [p.key]: !prev[p.key] }))}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${payment[p.key] ? "bg-red-600" : "bg-gray-200"}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${payment[p.key] ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <button onClick={() => save("Payment")}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </Section>

      <Section title="Social Media" desc="Links shown in the store footer">
        <div className="space-y-4">
          {[
            { key: "facebook",  label: "Facebook",  placeholder: "https://facebook.com/yourpage" },
            { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
            { key: "tiktok",    label: "TikTok",    placeholder: "https://tiktok.com/@yourhandle" },
            { key: "linkedin",  label: "LinkedIn",  placeholder: "https://linkedin.com/company/yourcompany" },
          ].map((s) => (
            <Field key={s.key} label={s.label}>
              <input className={INPUT} value={social[s.key]}
                onChange={(e) => setSocial({ ...social, [s.key]: e.target.value })}
                placeholder={s.placeholder} />
            </Field>
          ))}
          <div className="flex justify-end">
            <button onClick={() => save("Social media")}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </Section>

      <div className="border-2 border-red-200 rounded-2xl p-6 bg-red-50/50">
        <h3 className="font-bold text-red-700 mb-1">Danger Zone</h3>
        <p className="text-sm text-red-500 mb-4">Irreversible actions — proceed with caution.</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => toast("Feature not implemented in demo", "warning")}
            className="border border-red-300 text-red-600 hover:bg-red-100 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Clear All Orders
          </button>
          <button
            onClick={() => toast("Feature not implemented in demo", "warning")}
            className="border border-red-300 text-red-600 hover:bg-red-100 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Reset Inventory
          </button>
        </div>
      </div>
    </div>
  );
}
