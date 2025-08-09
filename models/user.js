import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: [true, "Email already exists"],
      required: [true, "Email is required"],
    },
    name: String,
    imageId: {
      type: Schema.Types.ObjectId,
      ref: "uploads.files",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    todos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Todo",
      },
    ],
    refreshToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);



UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = models.User || model("User", UserSchema);
export default User;
