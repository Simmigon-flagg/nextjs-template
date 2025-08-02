import { Schema, model, models } from 'mongoose';

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
            ref: "uploads.files", // GridFS
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
        refreshToken: String, // <-- add this
    },
    { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;
