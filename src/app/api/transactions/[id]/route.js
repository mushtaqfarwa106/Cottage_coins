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

export async function PUT(request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const { name, amount, date, type, paymentMethod, category, description } = await request.json();

    if (!name || amount === undefined || amount === null || !date || !type || !paymentMethod || !category) {
      return NextResponse.json(
        { error: "Name, amount, date, type, paymentMethod, and category are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Transaction.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    if (existing.user.toString() !== userId.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        amount: parseFloat(amount),
        date: new Date(date),
        type,
        paymentMethod,
        category,
        description: description?.trim() ?? "",
      },
      { new: true, runValidators: true }
    ).populate("category", "name color description");

    return NextResponse.json({ message: "Transaction updated", transaction }, { status: 200 });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("Transactions PUT error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const existing = await Transaction.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    if (existing.user.toString() !== userId.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Transaction.findByIdAndDelete(id);

    return NextResponse.json({ message: "Transaction deleted" }, { status: 200 });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("Transactions DELETE error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
