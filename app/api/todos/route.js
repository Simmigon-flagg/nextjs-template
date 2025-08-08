

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { connectToDatabase } from "@/utils/database";
import User from "@/models/user";
import Todo from "@/models/todo";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { Readable } from "stream";

export async function POST(request) {
  let session, user_email, user;

  // Auth check
  try {
    session = await getServerSession(authOptions);
    user_email = session.user.email;
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // DB connection
  try {
    await connectToDatabase();
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error }, { status: 500 });
  }

  // Find user
  try {
    user = await User.findOne({ email: user_email }).select("_id todos");
    if (!user) {
      return NextResponse.json({ message: `User ${user_email} not found` }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ message: "User lookup failed", error }, { status: 500 });
  }

  // Parse formData instead of JSON
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "Invalid form data" }, { status: 400 });
  }

  const title = formData.get("title");
  const notes = formData.get("notes");
  const file = formData.get("file");

  if (!title || typeof title !== "string") {
    return NextResponse.json({ message: "Title is required" }, { status: 400 });
  }

  let fileData = null;

  // Upload file to GridFS if present
  if (file && typeof file !== "string") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const db = mongoose.connection.db;
      const bucket = new GridFSBucket(db, { bucketName: "uploads" });

      const uploadStream = bucket.openUploadStream(file.name, {
        contentType: file.type,
      });

      const readableStream = Readable.from(buffer);
      readableStream.pipe(uploadStream);

      await new Promise((resolve, reject) => {
        uploadStream.on("finish", () => {
          fileData = {
            fileId: uploadStream.id,
            filename: file.name,
          };
          resolve();
        });
        uploadStream.on("error", reject);
      });
    } catch (error) {
      return NextResponse.json({ message: "File upload failed" }, { status: 500 });
    }
  }

  // Create Todo
  try {
    const newTodo = new Todo({
      title,
      notes,
      completed: false,
      fav: false,
      file: fileData,
      userId: user._id,
    });

    const saved = await newTodo.save();

    user.todos.push(saved._id);
    await user.save();

    const todo = {
      _id: saved._id,
      title: saved.title,
      notes: saved.notes,
      completed: saved.completed,
      createdAt: saved.createdAt,
      file: saved.file,
    };

    return NextResponse.json({ message: "Todo created successfully", todo }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating Todo", error }, { status: 500 });
  }
}

export async function GET(request) {
  let session = null;
  let user_email = null;

  try {
    session = await getServerSession(authOptions);
    user_email = session.user.email;
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 5;
  const skip = (page - 1) * limit;

  const search = searchParams.get("search") || "";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const sortByRaw = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
  const sortBy = sortByRaw === "date" ? "createdAt" : sortByRaw;
  const completed = searchParams.get("completed");
  const fav = searchParams.get("fav");

  try {
    await connectToDatabase();
    const user = await User.findOne({ email: user_email }).select("_id");

    const query = { userId: user._id };

    // Search filter
    if (search.trim()) {
      query.title = { $regex: search.trim(), $options: "i" };
    }

    // Date filter with full day coverage
if (startDate || endDate) {
  query.createdAt = {};

  if (startDate) {
    const start = new Date(startDate);
    if (!isNaN(start)) query.createdAt.$gte = start;
  }

  if (endDate) {
    const end = new Date(endDate);
    if (!isNaN(end)) query.createdAt.$lte = end;
  }
}


    // Completed filter
    if (completed === "true" || completed === "false") {
      query.completed = completed === "true";
    }

    // Favorite filter
    if (fav === "true" || fav === "false") {
      query.fav = fav === "true";
    }

    const todos = await Todo.find(query)
      .select("title notes completed createdAt file fav")
      .sort({ [sortBy]: sortOrder })
      .collation(sortBy === "title" ? { locale: "en", strength: 2 } : undefined)
      .skip(skip)
      .limit(limit);

    const total = await Todo.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        message: "Todos fetched successfully",
        todos,
        pagination: { page, limit, total, totalPages },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Error fetching Todos", error }, { status: 500 });
  }
}


