import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Transaction from "@/models/Transaction";

void Category;

const JWT_SECRET = process.env.JWT_SECRET;
const GITHUB_MODELS_ENDPOINT = "https://models.github.ai/inference";
const GITHUB_MODELS_MODEL = "openai/gpt-4o-mini";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
}

function startOfMonth(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function endOfMonth(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
}

function formatMonthLabel(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function monthStartAtOffset(now, monthsBackFromCurrent) {
  return startOfMonth(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBackFromCurrent, 1)),
  );
}

function extractJsonObject(text) {
  if (!text || typeof text !== "string") return null;
  let s = text.trim();
  const fence = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  s = s.slice(start, end + 1);
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function isValidTrend(t) {
  return t === "up" || t === "down" || t === "stable";
}

function isValidInsightType(t) {
  return t === "warning" || t === "positive" || t === "neutral";
}

function validateAndNormalizePayload(raw) {
  if (!raw || typeof raw !== "object")
    return { error: "Invalid response shape" };
  const { summary, forecast, budgetRecommendations, insights } = raw;
  if (typeof summary !== "string" || !summary.trim()) {
    return { error: "Missing or invalid summary" };
  }
  if (!Array.isArray(forecast)) return { error: "forecast must be an array" };
  if (!Array.isArray(budgetRecommendations))
    return { error: "budgetRecommendations must be an array" };
  if (!Array.isArray(insights)) return { error: "insights must be an array" };
  for (const row of forecast) {
    if (!row || typeof row.category !== "string")
      return { error: "Invalid forecast row" };
    const amt = Number(row.estimatedAmount);
    if (!Number.isFinite(amt) || amt < 0)
      return { error: "Invalid estimatedAmount in forecast" };
    if (!isValidTrend(row.trend)) return { error: "Invalid trend in forecast" };
  }
  for (const row of budgetRecommendations) {
    if (!row || typeof row.category !== "string")
      return { error: "Invalid budget row" };
    const cur = Number(row.currentAvg);
    const sug = Number(row.suggestedBudget);
    if (!Number.isFinite(cur) || cur < 0)
      return { error: "Invalid currentAvg" };
    if (!Number.isFinite(sug) || sug < 0)
      return { error: "Invalid suggestedBudget" };
    if (typeof row.reason !== "string")
      return { error: "Invalid reason in budget" };
  }
  for (const row of insights) {
    if (
      !row ||
      typeof row.title !== "string" ||
      typeof row.description !== "string"
    ) {
      return { error: "Invalid insight row" };
    }
    if (!isValidInsightType(row.type)) return { error: "Invalid insight type" };
  }
  return {
    data: {
      summary: summary.trim(),
      forecast: forecast.map((r) => ({
        category: String(r.category).trim(),
        estimatedAmount: Number(r.estimatedAmount),
        trend: r.trend,
      })),
      budgetRecommendations: budgetRecommendations.map((r) => ({
        category: String(r.category).trim(),
        currentAvg: Number(r.currentAvg),
        suggestedBudget: Number(r.suggestedBudget),
        reason: String(r.reason).trim(),
      })),
      insights: insights.map((r) => ({
        title: String(r.title).trim(),
        description: String(r.description).trim(),
        type: r.type,
      })),
    },
  };
}

function mergeCategoryColors(items, colorByName) {
  return items.map((row) => {
    const key = String(row.category || "").toLowerCase();
    const color = colorByName.get(key) || "#64748b";
    return { ...row, color };
  });
}

function buildPrompt(summary) {
  return `You are a financial analyst for a personal finance app called Cottage Coins.

Below is JSON summarizing the user's last 6 months of transactions (monthly income/expense totals and category-wise expense totals). Category names are authoritative — use exactly these names in your output where you reference a category.

INPUT_DATA:
${JSON.stringify(summary, null, 2)}

Respond with JSON ONLY (no markdown, no code fences, no text before or after the JSON). Use this exact structure and key names:

{
  "forecast": [
    { "category": "<string>", "estimatedAmount": <number>, "trend": "up" | "down" | "stable" }
  ],
  "budgetRecommendations": [
    { "category": "<string>", "currentAvg": <number>, "suggestedBudget": <number>, "reason": "<string>" }
  ],
  "insights": [
    { "title": "<string>", "description": "<string>", "type": "warning" | "positive" | "neutral" }
  ],
  "summary": "<2-3 sentence string describing overall financial health>"
}

Requirements:
1. forecast: next month's estimated EXPENSE per category (numeric amounts, realistic). Include the most relevant spending categories from the data; you may omit categories with negligible spend. trend compares implied trajectory vs recent months.
2. budgetRecommendations: currentAvg = average monthly spend for that category over the 6-month window; suggestedBudget = recommended monthly cap; reason = one short sentence.
3. insights: 3-6 items about patterns (growth, stability, anomalies), typed appropriately.
4. All amounts are plain numbers (no currency symbols).
5. Use only double quotes in JSON.`;
}

export async function POST() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const githubToken = process.env.GH_MODELS_TOKEN;
    if (!githubToken || !String(githubToken).trim()) {
      return NextResponse.json(
        {
          error:
            "AI forecast is not configured. Set GH_MODELS_TOKEN on the server.",
        },
        { status: 503 },
      );
    }

    const now = new Date();
    const trendStart = monthStartAtOffset(now, 5);
    const trendEnd = endOfMonth(now);
    const userObjectId = new mongoose.Types.ObjectId(String(userId));
    const matchTrendRange = {
      user: userObjectId,
      date: { $gte: trendStart,$lte: trendEnd },
    };

    await connectDB();

    const [trendAgg, categoryAgg, categories] = await Promise.all([
      Transaction.aggregate([
        { $match: matchTrendRange },
        {
          $group: {
            _id: { $dateTrunc: { date: "$date", unit: "month" } },
            income: {
              $sum: { $cond: [{$eq: ["$type", "income"] }, "$amount", 0] },
            },
            expense: {
              $sum: { $cond: [{$eq: ["$type", "expense"] }, "$amount", 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Transaction.aggregate([
        { $match: { ...matchTrendRange, type: "expense" } },
        {
          $group: {
            _id: "$category",
            totalSpent: { $sum: "$amount" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "cat",
          },
        },
        { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            name: { $ifNull: ["$cat.name", "Unknown"] },
            color: { $ifNull: ["$cat.color", "#64748b"] },
            totalSpent: 1,
          },
        },
        { $sort: { totalSpent: -1 } },         {$limit: 25 },
      ]),
      Category.find({ user: userObjectId }).select("name color").lean(),
    ]);

    const trendByKey = new Map();
    for (const row of trendAgg) {
      const key = new Date(row._id).getTime();
      trendByKey.set(key, {
        income: row.income ?? 0,
        expense: row.expense ?? 0,
      });
    }

    const monthlySummary = [];
    for (let i = 5; i >= 0; i -= 1) {
      const monthStart = monthStartAtOffset(now, i);
      const key = monthStart.getTime();
      const bucket = trendByKey.get(key) ?? { income: 0, expense: 0 };
      monthlySummary.push({
        month: formatMonthLabel(monthStart),
        totalIncome: bucket.income,
        totalExpense: bucket.expense,
      });
    }

    const categorySpending = categoryAgg.map((row) => ({
      category: row.name,
      color: row.color,
      totalSpentSixMonths: row.totalSpent ?? 0,
      monthlyAverage: (row.totalSpent ?? 0) / 6,
    }));

    const colorByName = new Map();
    for (const c of categories) {
      if (c?.name)
        colorByName.set(String(c.name).toLowerCase(), c.color || "#64748b");
    }
    for (const row of categorySpending) {
      const k = String(row.category).toLowerCase();
      if (!colorByName.has(k)) colorByName.set(k, row.color || "#64748b");
    }

    const summary = {
      window: { from: trendStart.toISOString(), to: trendEnd.toISOString() },
      monthlySummary,
      categorySpending,
    };

    const client = new OpenAI({
      baseURL: GITHUB_MODELS_ENDPOINT,
      apiKey: githubToken,
    });
    const prompt = buildPrompt(summary);

    let text;
    try {
      const result = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a financial analyst for a personal finance app. Respond with JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 1.0,
        top_p: 1.0,
        max_tokens: 1000,
        model: GITHUB_MODELS_MODEL,
      });

      if (!result?.choices?.[0]?.message?.content) {
        console.error("Full GitHub response object:", JSON.stringify(result, null, 2));
        throw new Error("Invalid response structure from model provider");
      }

      text = result.choices[0].message.content;
    } catch (err) {
      console.error("AI forecast generateContent error detail:", err?.response?.data || err?.message || err);
      return NextResponse.json(
        { error: "Failed to generate forecast from AI. Check server console for API token details." },
        { status: 502 },
      );
    }

    const parsed = extractJsonObject(text);
    if (!parsed) {
      return NextResponse.json(
        { error: "Could not parse AI response as JSON. Try generating again." },
        { status: 502 },
      );
    }

    const validated = validateAndNormalizePayload(parsed);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 502 });
    }

    const { data } = validated;
    const forecast = mergeCategoryColors(data.forecast, colorByName);
    const budgetRecommendations = mergeCategoryColors(
      data.budgetRecommendations,
      colorByName,
    );

    return NextResponse.json(
      {
        summary: data.summary,
        forecast,
        budgetRecommendations,
        insights: data.insights,
      },
      { status: 200 },
    );
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }
    console.error("AI forecast POST error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}