export function formatCurrency(amount) {
  const value = Number(amount ?? 0);
  const formatted = new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `Rs ${formatted}`;
}
