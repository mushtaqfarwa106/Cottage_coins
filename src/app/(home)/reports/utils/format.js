export function formatCurrency(amount) {
  const value = Number(amount ?? 0);
  const formatted = new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
  return `Rs ${formatted}`;
}
