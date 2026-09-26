import mongoose from "mongoose";

const emailReportSettingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/, "Please provide a valid email address"],
    },
    frequency: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const EmailReportSetting =
  mongoose.models.EmailReportSetting || mongoose.model("EmailReportSetting", emailReportSettingSchema);

export default EmailReportSetting;
