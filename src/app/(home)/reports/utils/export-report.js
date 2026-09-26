import { jsPDF } from "jspdf";

function escapeCsvField(value) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function formatMoney(n) {
  const value = Number(n ?? 0);
  const formatted = new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `Rs ${formatted}`;
}

/**
 * Small canvas chart: grouped bars for income (green) vs expense (red) per period.
 * Low resolution + JPEG keeps PDF small.
 */
function buildTrendChartDataUrl(monthlyTrend, jpegQuality = 0.72) {
  const data = monthlyTrend ?? [];
  const W = 480;
  const H = 200;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#e5e5e5";
  ctx.lineWidth = 1;
  ctx.font = "10px sans-serif";
  ctx.fillStyle = "#404040";

  if (!data.length) {
    ctx.fillText("No period data for this range.", 24, H / 2);
    return canvas.toDataURL("image/jpeg", jpegQuality);
  }

  const padL = 44;
  const padR = 12;
  const padT = 16;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  let maxVal = 1;
  for (const d of data) {
    maxVal = Math.max(maxVal, d.income ?? 0, d.expense ?? 0);
  }
  const n = data.length;
  const groupW = chartW / Math.max(n, 1);
  const barW = Math.max(4, Math.min(18, (groupW - 6) / 2));

  ctx.beginPath();
  ctx.moveTo(padL, padT);
  ctx.lineTo(padL, padT + chartH);
  ctx.lineTo(padL + chartW, padT + chartH);
  ctx.stroke();

  ctx.fillStyle = "#737373";
  ctx.font = "9px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(formatMoney(maxVal), padL - 4, padT + 10);
  ctx.textAlign = "right";
  ctx.fillText("0", padL - 4, padT + chartH);

  data.forEach((d, i) => {
    const gx = padL + i * groupW + (groupW - barW * 2 - 4) / 2;
    const hi = ((d.income ?? 0) / maxVal) * chartH;
    const he = ((d.expense ?? 0) / maxVal) * chartH;
    ctx.fillStyle = "#16a34a";
    ctx.fillRect(gx, padT + chartH - hi, barW, hi);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(gx + barW + 4, padT + chartH - he, barW, he);

    const label = String(d.month ?? "").slice(0, 10);
    ctx.fillStyle = "#525252";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "center";
    ctx.save();
    const cx = gx + barW + 2;
    const cy = padT + chartH + 10;
    ctx.translate(cx, cy);
    ctx.rotate(-0.35);
    ctx.fillText(label, 0, 0);
    ctx.restore();
  });

  ctx.textAlign = "left";
  ctx.font = "9px sans-serif";
  ctx.fillStyle = "#16a34a";
  ctx.fillRect(W - 120, 8, 8, 8);
  ctx.fillStyle = "#404040";
  ctx.fillText("Income", W - 108, 15);
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(W - 120, 22, 8, 8);
  ctx.fillStyle = "#404040";
  ctx.fillText("Expense", W - 108, 29);

  return canvas.toDataURL("image/jpeg", jpegQuality);
}

/**
 * @param {object} report - API report payload
 */
export function downloadReportCsv(report) {
  if (!report) return;

  const lines = [];
  lines.push("Cottage Coins — Financial Report");
  lines.push("");
  lines.push(`Total Income,${formatMoney(report.totalIncome)}`);
  lines.push(`Total Expenses,${formatMoney(report.totalExpenses)}`);
  lines.push(`Net Balance,${formatMoney(report.netBalance)}`);
  lines.push(`Transaction Count,${report.transactionCount}`);
  lines.push("");
  lines.push("Trend");
  lines.push("Period,Income,Expense");
  for (const row of report.monthlyTrend || []) {
    lines.push(
      [escapeCsvField(row.month), escapeCsvField(formatMoney(row.income)), escapeCsvField(formatMoney(row.expense))].join(",")
    );
  }
  lines.push("");
  lines.push("Category Breakdown");
  lines.push("Name,Color,Amount,Type");
  for (const row of report.categoryBreakdown || []) {
    lines.push(
      [escapeCsvField(row.name), escapeCsvField(row.color), escapeCsvField(formatMoney(row.totalAmount)), row.type].join(",")
    );
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cottage-coins-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Compact PDF: summary text, one JPEG trend chart, one category table (vector text).
 * @param {object} report
 * @param {string} periodLabel
 */
export function downloadReportPdf(report, periodLabel) {
  if (!report) return;

  const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
  const margin = 40;
  const pageW = pdf.internal.pageSize.getWidth();
  const maxW = pageW - margin * 2;
  let y = margin;

  pdf.setFontSize(16);
  pdf.setTextColor(23, 23, 23);
  pdf.text("Cottage Coins — Report", margin, y);
  y += 22;

  pdf.setFontSize(10);
  pdf.setTextColor(82, 82, 82);
  const lines = pdf.splitTextToSize(String(periodLabel || ""), maxW);
  pdf.text(lines, margin, y);
  y += lines.length * 12 + 8;

  pdf.setTextColor(23, 23, 23);
  pdf.setFontSize(11);
  pdf.text(`Total income: ${formatMoney(report.totalIncome)}`, margin, y);
  y += 14;
  pdf.text(`Total expenses: ${formatMoney(report.totalExpenses)}`, margin, y);
  y += 14;
  pdf.text(`Net balance: ${formatMoney(report.netBalance)}`, margin, y);
  y += 14;
  pdf.text(`Transactions: ${report.transactionCount ?? 0}`, margin, y);
  y += 22;

  pdf.setFontSize(12);
  pdf.text("Income vs expense by period", margin, y);
  y += 16;

  const chartDataUrl = buildTrendChartDataUrl(report.monthlyTrend);
  if (chartDataUrl) {
    const imgW = pageW - margin * 2;
    const imgH = 120;
    pdf.addImage(chartDataUrl, "JPEG", margin, y, imgW, imgH);
    y += imgH + 20;
  }

  pdf.setFontSize(12);
  pdf.text("Category breakdown", margin, y);
  y += 16;

  pdf.setFontSize(9);
  const colCat = margin;
  const colType = margin + 160;
  const colAmt = margin + 230;
  const colPct = margin + 310;
  pdf.setTextColor(64, 64, 64);
  pdf.text("Category", colCat, y);
  pdf.text("Type", colType, y);
  pdf.text("Amount", colAmt, y);
  pdf.text("% of type", colPct, y);
  y += 12;
  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin, y, pageW - margin, y);
  y += 10;

  const rows = report.categoryBreakdown ?? [];
  const totalExp = rows
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + (r.totalAmount ?? 0), 0);
  const totalInc = rows
    .filter((r) => r.type === "income")
    .reduce((s, r) => s + (r.totalAmount ?? 0), 0);

  pdf.setTextColor(23, 23, 23);
  for (const row of rows) {
    if (y > pdf.internal.pageSize.getHeight() - 50) {
      pdf.addPage();
      y = margin;
    }
    const denom = row.type === "expense" ? totalExp : totalInc;
    const pct = denom > 0 ? ((row.totalAmount ?? 0) / denom) * 100 : 0;
    const name = String(row.name ?? "").slice(0, 28);
    pdf.text(name, colCat, y);
    pdf.text(String(row.type ?? ""), colType, y);
    pdf.text(formatMoney(row.totalAmount), colAmt, y);
    pdf.text(`${pct.toFixed(1)}%`, colPct, y);
    y += 14;
  }

  if (!rows.length) {
    pdf.setTextColor(115, 115, 115);
    pdf.text("No category totals in this period.", margin, y);
  }

  pdf.save(`cottage-coins-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
