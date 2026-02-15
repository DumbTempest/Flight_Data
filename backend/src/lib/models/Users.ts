import mongoose, { Schema, Document, Model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  refreshToken?: string;

  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, index: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  const secret = process.env.ACCESS_TOKEN_SECRET as string;

  if (!secret) {
    throw new Error("Access token secret env var missing");
  }

  return jwt.sign(
    {
      _id: this._id.toString(),
      email: this.email,
      name: this.name,
    },
    secret,
    { expiresIn: "15m" }
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  const secret = process.env.REFRESH_TOKEN_SECRET as string;

  if (!secret) {
    throw new Error("Refresh token secret env var missing");
  }

  return jwt.sign(
    { _id: this._id.toString() },
    secret,
    { expiresIn: "7d" }
  );
};

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default UserModel;
