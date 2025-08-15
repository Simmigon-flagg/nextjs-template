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
    image: String, // Google profile image URL
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

// ✅ Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if password is new/changed

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = models.User || model('User', UserSchema);
export default User;
