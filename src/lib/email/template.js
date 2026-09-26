function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function buildEmailReportHtml(report) {
  const categoryRows = (report.topCategories ?? [])
    .map(
      (category) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${category.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${formatCurrency(category.amount)}</td>
      </tr>`
    )
    .join("");

  const txRow = (tx) => `
    <li style="margin-bottom:8px;">
      <strong>${tx.name}</strong> (${tx.category}) - ${formatCurrency(tx.amount)} on ${formatDate(tx.date)}
    </li>`;

  return `
  <div style="font-family:Arial,sans-serif;color:#0f172a;max-width:640px;margin:0 auto;padding:20px;">
    <div style="text-align:center;padding:16px;border-bottom:1px solid #e2e8f0;margin-bottom:20px;">
      <h1 style="margin:0;font-size:24px;">Cottage Coins</h1>
      <p style="margin:8px 0 0;color:#475569;">${report.periodLabel}</p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:18px;">
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;">
        <div style="font-size:12px;color:#64748b;">Total Income</div>
        <div style="font-size:16px;font-weight:700;color:#16a34a;">${formatCurrency(report.totalIncome)}</div>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;">
        <div style="font-size:12px;color:#64748b;">Total Expenses</div>
        <div style="font-size:16px;font-weight:700;color:#dc2626;">${formatCurrency(report.totalExpenses)}</div>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;">
        <div style="font-size:12px;color:#64748b;">Net Balance</div>
        <div style="font-size:16px;font-weight:700;">${formatCurrency(report.netBalance)}</div>
      </div>
    </div>

    <h2 style="font-size:16px;margin:0 0 8px;">Top Categories</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:18px;">
      <thead>
        <tr>
          <th style="text-align:left;border-bottom:1px solid #cbd5e1;padding-bottom:6px;">Category</th>
          <th style="text-align:right;border-bottom:1px solid #cbd5e1;padding-bottom:6px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${categoryRows || `<tr><td colspan="2" style="padding:10px 0;color:#64748b;">No spending data in this period.</td></tr>`}
      </tbody>
    </table>

    <h2 style="font-size:16px;margin:0 0 8px;">Top Income Transactions</h2>
    <ul style="padding-left:18px;margin:0 0 14px;">
      ${(report.topIncomeTransactions ?? []).map(txRow).join("") || `<li style="color:#64748b;">No income transactions.</li>`}
    </ul>

    <h2 style="font-size:16px;margin:0 0 8px;">Top Expense Transactions</h2>
    <ul style="padding-left:18px;margin:0;">
      ${(report.topExpenseTransactions ?? []).map(txRow).join("") || `<li style="color:#64748b;">No expense transactions.</li>`}
    </ul>

    <p style="margin-top:24px;color:#64748b;font-size:12px;text-align:center;">Sent by Cottage Coins</p>
  </div>
  `;
}
