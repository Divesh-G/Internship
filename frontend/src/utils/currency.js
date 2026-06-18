const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 0,
});

export function formatNPR(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return formatter.format(0);
  return formatter.format(amount);
}
