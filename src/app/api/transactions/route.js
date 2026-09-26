import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
}

export async function GET(request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const payment = searchParams.get("payment");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const query = { user: userId };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (type && type !== "all") {
      query.type = type;
    }
    if (payment && payment !== "all") {
      query.paymentMethod = payment;
    }
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    await connectDB();

    const transactions = await Transaction.find(query)
      .populate("category", "name color description")
      .sort({ date: -1 });

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("Transactions GET error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, amount, date, type, paymentMethod, category, description } = await request.json();

    if (!name || amount === undefined || amount === null || !date || !type || !paymentMethod || !category) {
      return NextResponse.json(
        { error: "Name, amount, date, type, paymentMethod, and category are required" },
        { status: 400 }
      );
    }

    if (parseFloat(amount) < 0) {
      return NextResponse.json({ error: "Amount must be 0 or greater" }, { status: 400 });
    }

    await connectDB();

    const transaction = await Transaction.create({
      name: name.trim(),
      amount: parseFloat(amount),
      date: new Date(date),
      type,
      paymentMethod,
      category,
      description: description?.trim() ?? "",
      user: userId,
    });

    await transaction.populate("category", "name color description");

    return NextResponse.json(
      { message: "Transaction created", transaction },
      { status: 201 }
    );
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("Transactions POST error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
