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
} from "../../../services/api/todo";

export async function POST(request) {
  // Auth
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const user = await findUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json(
      { message: `User ${session.user.email} not found` },
      { status: 404 }
    );
  }

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
  try {
    fileData = await uploadFileToGridFS(file);
  } catch {
    return NextResponse.json({ message: "File upload failed" }, { status: 500 });
  }

  try {
    const savedTodo = await createTodoForUser(user._id, {
      title,
      notes,
      fileData,
    });
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
    return NextResponse.json({ message: "Error creating Todo", error }, { status: 500 });
  }
}

export async function GET(request) {
  // Auth
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const user = await findUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json(
      { message: `User ${session.user.email} not found` },
      { status: 404 }
    );
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

  try {
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
    return NextResponse.json({ message: "Error fetching Todos", error }, { status: 500 });
  }
}
