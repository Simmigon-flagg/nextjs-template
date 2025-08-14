import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const FileSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, 'File URL is required'],
    },
    filename: {
      type: String,
      required: [true, 'Filename is required'],
    },
    mimetype: {
      type: String,
      required: [true, 'File MIME type is required'], // e.g., "application/pdf"
    },
    size: {
      type: Number,
      required: [true, 'File size is required'], // size in bytes
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const File = models.File || model('File', FileSchema);
export default File;
