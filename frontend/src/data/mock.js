// Sample/display data only — the backend has no models yet for banners, ratings,
// reviews, flash sales, coupons or payment gateways. Swap these for real API data
// as those features land server-side.

export const DISTRICTS = [
  "Achham", "Arghakhanchi", "Baglung", "Baitadi", "Bajhang", "Bajura", "Banke",
  "Bara", "Bardiya", "Bhaktapur", "Bhojpur", "Chitwan", "Dadeldhura", "Dailekh",
  "Dang", "Darchula", "Dhading", "Dhankuta", "Dhanusa", "Dolakha", "Dolpa",
  "Doti", "Gorkha", "Gulmi", "Humla", "Ilam", "Jajarkot", "Jhapa", "Jumla",
  "Kailali", "Kalikot", "Kanchanpur", "Kapilvastu", "Kaski", "Kathmandu",
  "Kavrepalanchok", "Khotang", "Lalitpur", "Lamjung", "Mahottari", "Makwanpur",
  "Manang", "Morang", "Mugu", "Mustang", "Myagdi", "Nawalpur", "Nuwakot",
  "Okhaldhunga", "Palpa", "Panchthar", "Parbat", "Parasi", "Parsa", "Pyuthan",
  "Ramechhap", "Rasuwa", "Rautahat", "Rolpa", "Rukum East", "Rukum West",
  "Rupandehi", "Salyan", "Sankhuwasabha", "Saptari", "Sarlahi", "Sindhuli",
  "Sindhupalchok", "Siraha", "Solukhumbu", "Sunsari", "Surkhet", "Syangja",
  "Tanahun", "Taplejung", "Terhathum", "Udayapur",
];

export const CATEGORY_META = {
  "mens-fashion": { label: "Men's Fashion", icon: "👔", match: ["men"] },
  "womens-fashion": { label: "Women's Fashion", icon: "👗", match: ["women"] },
  "traditional-wear": { label: "Traditional Wear", icon: "🥻", match: ["traditional", "daura", "kurta", "saree"] },
  footwear: { label: "Footwear", icon: "👟", match: ["foot", "shoe"] },
  accessories: { label: "Accessories", icon: "🕶️", match: ["accessor"] },
  "winter-collection": { label: "Winter Collection", icon: "🧥", match: ["winter"] },
};

export const CATEGORY_LIST = Object.entries(CATEGORY_META).map(([slug, v]) => ({ slug, ...v }));

// Broader than CATEGORY_META — matches actual product/category names (e.g. the
// seeded "T-Shirts" / "Jackets" / "Trousers" catalog), not just the 6 spec categories.
const PRODUCT_ICON_RULES = [
  { icon: "👕", match: ["t-shirt", "tee", "tshirt"] },
  { icon: "👔", match: ["shirt", "men"] },
  { icon: "🧥", match: ["jacket", "coat", "winter", "blazer"] },
  { icon: "👖", match: ["trouser", "pant", "chino", "jean", "denim"] },
  { icon: "👗", match: ["dress", "women", "gown"] },
  { icon: "🥻", match: ["traditional", "kurta", "saree", "daura", "dhoti"] },
  { icon: "🧶", match: ["sweater", "hoodie", "sweatshirt"] },
  { icon: "👟", match: ["foot", "shoe", "sneaker", "sandal"] },
  { icon: "🕶️", match: ["accessor", "sunglass", "watch", "belt"] },
  { icon: "🧢", match: ["cap", "hat"] },
];

export function iconForCategory(name = "") {
  const lower = name.toLowerCase();
  const fromRules = PRODUCT_ICON_RULES.find((c) => c.match.some((m) => lower.includes(m)));
  if (fromRules) return fromRules.icon;
  const fromCategoryList = CATEGORY_LIST.find((c) => c.match.some((m) => lower.includes(m)));
  return fromCategoryList?.icon ?? "🛍️";
}

const GRADIENTS = [
  "linear-gradient(135deg, #2c2c30, #1c1c1e)",
  "linear-gradient(135deg, #e22433, #b81b28)",
  "linear-gradient(135deg, #3a3a3f, #e22433)",
  "linear-gradient(135deg, #e2a92a, #b81b28)",
  "linear-gradient(135deg, #1c1c1e, #e22433)",
  "linear-gradient(135deg, #4a4a50, #2c2c30)",
];

function hashOf(text = "") {
  return String(text)
    .split("")
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

export function gradientFor(seed) {
  return GRADIENTS[hashOf(seed) % GRADIENTS.length];
}

export function ratingFor(seed) {
  // Deterministic 3.6–5.0 rating + a believable review count.
  const h = hashOf(seed);
  const rating = (3.6 + (h % 15) / 10).toFixed(1);
  const reviewCount = 12 + (h % 240);
  return { rating: Number(rating), reviewCount };
}

export function discountFor(seed) {
  const h = hashOf(String(seed) + "d");
  const pct = [0, 10, 15, 20, 25, 30, 40][h % 7];
  return pct;
}

export const BANNERS = [
  {
    id: 1,
    title: "Dashain Tihar Mahotsav",
    subtitle: "Up to 40% off on traditional wear",
    cta: "Shop Festival Collection",
    gradient: "linear-gradient(120deg, #b81b28, #e22433 60%, #e2a92a)",
    emoji: "🪔",
  },
  {
    id: 2,
    title: "Winter Drop 2026",
    subtitle: "Premium jackets & sweaters from Rs. 1,499",
    cta: "Explore Winter Collection",
    gradient: "linear-gradient(120deg, #1c1c1e, #2c2c30 60%, #4a4a50)",
    emoji: "🧥",
  },
  {
    id: 3,
    title: "Free Delivery in Kathmandu Valley",
    subtitle: "On orders above Rs. 2,000",
    cta: "Start Shopping",
    gradient: "linear-gradient(120deg, #e22433, #1c1c1e)",
    emoji: "🚚",
  },
];

export const REVIEW_SAMPLES = [
  { name: "Sujata K.", text: "Fabric quality is excellent and size guide was accurate. Delivered to Pokhara in 3 days." },
  { name: "Bibek R.", text: "Great fit, premium packaging. Will order again for Dashain." },
  { name: "Anjali S.", text: "Color matched the photos exactly. Customer support was responsive too." },
  { name: "Prakash T.", text: "Good value for the price. Stitching could be slightly better but overall happy." },
];

export function reviewsFor(seed) {
  const h = hashOf(seed);
  const count = 2 + (h % 3);
  return Array.from({ length: count }, (_, i) => {
    const sample = REVIEW_SAMPLES[(h + i) % REVIEW_SAMPLES.length];
    return { id: `${seed}-${i}`, ...sample, rating: 4 + ((h + i) % 2) };
  });
}

export const COUPONS = {
  NAYA10: 10,
  DASHAIN20: 20,
  SAJILO15: 15,
};

export const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", color: "#1c1c1e", icon: "💵" },
  { id: "esewa", label: "eSewa", color: "#60bb46", icon: "📱" },
  { id: "khalti", label: "Khalti", color: "#5c2d91", icon: "🟣" },
  { id: "imepay", label: "IME Pay", color: "#0a5ca8", icon: "🏦" },
];

export function getFlashSaleEnd() {
  const key = "sajilo_flash_sale_end";
  let stored = Number(localStorage.getItem(key));
  if (!stored || stored < Date.now()) {
    stored = Date.now() + 1000 * 60 * 60 * 8; // 8-hour rolling window
    localStorage.setItem(key, String(stored));
  }
  return stored;
}
