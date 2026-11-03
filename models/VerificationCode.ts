import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVerificationCodeDocument extends Document {
  email: string;
  code: string;
  type: "signup" | "login" | "reset_password";
  payload?: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCodeDocument>(
  {
    email: {
      type: String,
      required: [true, "Email or identifier is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, "Verification code is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["signup", "login", "reset_password"],
      required: true,
    },
    payload: {
      type: String,
      default: "",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const VerificationCode: Model<IVerificationCodeDocument> =
  mongoose.models.VerificationCode ||
  mongoose.model<IVerificationCodeDocument>(
    "VerificationCode",
    VerificationCodeSchema
  );

export default VerificationCode;
