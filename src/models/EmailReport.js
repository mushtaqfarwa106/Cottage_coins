import mongoose from "mongoose";

const topCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const transactionSummarySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, default: "" },
    date: { type: Date, required: true },
  },
  { _id: false }
);

const emailReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    period: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      required: true,
    },
    reportData: {
      totalIncome: { type: Number, default: 0 },
      totalExpenses: { type: Number, default: 0 },
      netBalance: { type: Number, default: 0 },
      topCategories: { type: [topCategorySchema], default: [] },
      topIncomeTransactions: { type: [transactionSummarySchema], default: [] },
      topExpenseTransactions: { type: [transactionSummarySchema], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

const EmailReport = mongoose.models.EmailReport || mongoose.model("EmailReport", emailReportSchema);

export default EmailReport;
