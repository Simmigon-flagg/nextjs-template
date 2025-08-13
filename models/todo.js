import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const FileSchema = new Schema({
  fileId: { type: Schema.Types.ObjectId },
  filename: { type: String },
}, { _id: false });

const TodoSchema = new Schema({
  title: { type: String, required: true },
  fav: { type: Boolean, default: false },
  notes: { type: String },
  completed: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  file: { type: FileSchema, default: {} },
}, { timestamps: true });


TodoSchema.index({ userId: 1, completed: 1 });

const Todo = models.Todo || model("Todo", TodoSchema);
export default Todo;
