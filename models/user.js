import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: [true, 'Email already exists'],
      required: [true, 'Email is required'],
    },
    name: String,
    image: String, // <-- Add this line for Google profile image URL
    imageId: {
      type: Schema.Types.ObjectId,
      ref: 'uploads.files',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    todos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Todo',
      },
    ],
    refreshToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);


const User = models.User || model('User', UserSchema);
export default User;
