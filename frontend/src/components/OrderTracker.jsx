const STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "paid", label: "Paid" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderTracker({ status }) {
  if (status === "cancelled") {
    return (
      <div className="order-tracker order-tracker-cancelled">
        <span className="order-tracker-cancelled-icon">✕</span>
        <span>This order has been cancelled.</span>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="order-tracker">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <div className="order-tracker-step" key={step.key}>
            <div className="order-tracker-line-wrap">
              {i > 0 && <span className={`order-tracker-line${i <= currentIndex ? " done" : ""}`} />}
              <span className={`order-tracker-dot${done ? " done" : ""}`}>{done ? "✓" : ""}</span>
            </div>
            <span className={`order-tracker-label${done ? " done" : ""}`}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
