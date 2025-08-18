
import { Schema, model, models } from "mongoose";

const LogEventSchema = new Schema(
  {
    level: { type: String, enum: ["info", "warn", "error"], default: "info" },
    message: { type: String, required: true },
    meta: { type: Object }, // extra data, e.g. userId, todoId
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default models.LogEvent || model("LogEvent", LogEventSchema);
