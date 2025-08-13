import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { connectToDatabase } from "@/utils/database";

import {
  findUserByEmail,
  uploadFileToGridFS,
  createTodoForUser,
  addTodoToUser,
  getTodosByUser,
} from "@/services/api/todo";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await findUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ message: `User ${session.user.email} not found` }, { status: 404 });
    }

    const formData = await request.formData();
    const title = formData.get("title");
    const notes = formData.get("notes");
    const file = formData.get("file");

    if (!title || typeof title !== "string") {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    let fileData = null;
    if (file) {
      try {
        fileData = await uploadFileToGridFS(file);
      } catch {
        return NextResponse.json({ message: "File upload failed" }, { status: 500 });
      }
    }

    const savedTodo = await createTodoForUser(user._id, { title, notes, fileData });
    await addTodoToUser(user, savedTodo._id);

    return NextResponse.json(
      {
        message: "Todo created successfully",
        todo: {
          _id: savedTodo._id,
          title: savedTodo.title,
          notes: savedTodo.notes,
          completed: savedTodo.completed,
          file: savedTodo.file,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error creating Todo", error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await findUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ message: `User ${session.user.email} not found` }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 5;
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const completed = searchParams.get("completed");
    const fav = searchParams.get("fav");

    const { todos, total, totalPages } = await getTodosByUser(
      user._id,
      { search, startDate, endDate, completed, fav },
      { page, limit },
      { sortBy, sortOrder }
    );

    return NextResponse.json(
      {
        message: "Todos fetched successfully",
        todos,
        pagination: { page, limit, total, totalPages },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching Todos", error: error.message }, { status: 500 });
  }
}
