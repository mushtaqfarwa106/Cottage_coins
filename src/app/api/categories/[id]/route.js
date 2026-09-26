import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
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
    const { name, description, color } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    await connectDB();

    const existing = await Category.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    if (existing.user.toString() !== userId.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check for name conflict with another category owned by the same user
    const conflict = await Category.findOne({ name: name.trim(), user: userId, _id: { $ne: id } });
    if (conflict) {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description?.trim() ?? "",
        color: color ?? "#64748b",
      },
      { new: true, runValidators: true }
    );

    const transactionCount = await Transaction.countDocuments({ category: id, user: userId });

    return NextResponse.json(
      { message: "Category updated", category: { ...category.toObject(), transactionCount } },
      { status: 200 }
    );
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("Categories PUT error:", error);
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

    const existing = await Category.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    if (existing.user.toString() !== userId.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const transactionCount = await Transaction.countDocuments({ category: id, user: userId });
    if (transactionCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: this category is used by ${transactionCount} transaction${transactionCount === 1 ? "" : "s"}` },
        { status: 409 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({ message: "Category deleted" }, { status: 200 });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("Categories DELETE error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
