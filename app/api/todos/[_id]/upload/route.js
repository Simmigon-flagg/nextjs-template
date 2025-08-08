// app/api/todos/[id]/upload/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { connectToDatabase } from "@/utils/database";
import Todo from "@/models/todo";
import { Readable } from "stream";

export async function POST(req, { params }) {
  await connectToDatabase();
  const { _id } = await params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    console.error("Invalid todo ID");
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    console.error("No file uploaded or file is string");
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const db = mongoose.connection.db;
  const bucket = new GridFSBucket(db, { bucketName: "uploads" });

  const uploadStream = bucket.openUploadStream(file.name, {
    contentType: file.type,
  });

  const readableStream = Readable.from(buffer);
  readableStream.pipe(uploadStream);

return await new Promise((resolve, reject) => {
  uploadStream.on("finish", async () => {
    try {
      const updatedTodo = await Todo.findByIdAndUpdate(
        _id,
        {
          file: {
            fileId: uploadStream.id,
            filename: file.name,
          },
        },
        { new: true } // return updated doc
      );

      resolve(
        NextResponse.json({
          message: "Upload successful",
          fileId: uploadStream.id,
          todo: updatedTodo, // useful for UI to re-render
        })
      );
    } catch (err) {
      reject(
        NextResponse.json({ error: "Database update failed" }, { status: 500 })
      );
    }
  });

  uploadStream.on("error", (err) => {
    reject(
      NextResponse.json({ error: "Upload failed" }, { status: 500 })
    );
  });
});

}
