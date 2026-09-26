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

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const categories = await Category.find({ user: userId }).sort({ name: 1 });

    // Attach transaction count to each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const transactionCount = await Transaction.countDocuments({ category: cat._id, user: userId });
        return { ...cat.toObject(), transactionCount };
      })
    );

    return NextResponse.json({ categories: categoriesWithCount }, { status: 200 });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("Categories GET error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, description, color } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    await connectDB();

    const existing = await Category.findOne({ name: name.trim(), user: userId });
    if (existing) {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() ?? "",
      color: color ?? "#64748b",
      user: userId,
    });

    return NextResponse.json(
      { message: "Category created", category: { ...category.toObject(), transactionCount: 0 } },
      { status: 201 }
    );
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("Categories POST error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
