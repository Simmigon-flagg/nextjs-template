import { connectToDatabase } from "../../../utils/database";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// In src/app/api/todos/[_id]/route.js
import User from "../../../models/user";
import Todo from "../../../models/todo";

import { authOptions } from "../../../utils/authOptions";

export async function POST(request) {
  let session = null;
  let user_email = null
  let user = null;
  let data = null;

  try {
    session = await getServerSession(authOptions);

    user_email = session.user.email;
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }


  try {
    await connectToDatabase(); // Connect to the DB

  } catch (error) {

    return NextResponse.json({ message: "Server Error", error }, { status: 500 });
  }

  try {

    user = await User.findOne({ email: user_email }).select("_id todos");
  } catch (error) {

    return NextResponse.json({ message: `User ${user_email} not found` }, { status: 404 });
  }


  try {
    data = await request.json();
    if (!data?.title || typeof data.title !== 'string') {
      return NextResponse.json({ message: `Invaild data` }, { status: 400 });
    }

  } catch (error) {

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }

  try {

    // Create the new todo document
    const newTodo = new Todo({
      ...data,
      userId: user._id
    });

    // Save the new todo document
    const parse = await newTodo.save();

    const todo = {
      _id: parse._id,
      title: parse.title,
      notes: parse.notes,
      completed: parse.completed,
      createdAt: parse.createdAt
    }

    // Push todo._id into user's todos array
    user.todos.push(newTodo._id);

    // Save updated user document
    await user.save();

    // Return a success response
    return NextResponse.json({ message: `Todo created successfully`, todo }, { status: 201 });

  } catch (error) {

    return NextResponse.json({ message: "Error creating Todo" }, { status: 500 });
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
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1; // default to desc
  const sortBy = sortByRaw === "date" ? "createdAt" : sortByRaw;
  // Additional filters
  const completed = searchParams.get("completed");
  const fav = searchParams.get("fav");

  try {
    await connectToDatabase();
    const user = await User.findOne({ email: user_email }).select("_id");

    const query = { userId: user._id };

    if (search.trim()) {
      query.title = { $regex: search.trim(), $options: "i" };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (completed !== null) {
      if (completed === "true" || completed === "false") {
        query.completed = completed === "true";
      }
    }

    if (fav !== null) {
      if (fav === "true" || fav === "false") {
        query.fav = fav === "true";
      }
    }

    const todos = await Todo.find(query)
      .select("_id title completed createdAt notes fav")
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
    return NextResponse.json(
      { message: "Error fetching Todos", error },
      { status: 500 }
    );
  }
}

