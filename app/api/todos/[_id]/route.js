import { connectToDatabase } from "../../../../utils/database";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import User from "../../../../models/user";
import Todo from "../../../../models/todo";

export async function PUT(request, { params }) {
  let session = null;

  try {
    session = await getServerSession();

  } catch (error) {
    return NextResponse.json({ message: "Unauthorized", error }, { status: 401 });
  }
  const user_email = session?.user?.email;

  let user = null;
  const { _id } = await params; // ✅ no await here

  let data;
  try {
    data = await request.json(); // ✅ safely attempt to parse JSON
  } catch (err) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }


  if (!data.title) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }


  try {
    await connectToDatabase();
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error }, { status: 500 });
  }

  try {
    user = await User.findOne({ email: user_email }).select("todos");

    if (!user) {
      return NextResponse.json({ message: `Todos not found` }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Database error" }, { status: 500 });
  }


  try {

    // ✅ perform update

    const updated = await Todo.findByIdAndUpdate(_id, data, { new: true });

    // const updated = await Todo.findByIdAndUpdate(_id, data, { new: true });
    console.log(updated)
    if (!updated) {
      return NextResponse.json({ message: `Todo with id ${_id} not found` }, { status: 404 });
    }

    return NextResponse.json({ message: `Todo updated successfully`, updated }, { status: 200 });
  } catch (error) {

    return NextResponse.json({ message: "Error updating Todo" }, { status: 500 });
  }
}

export async function GET(request, { params } = {}) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { _id } = await params;
  const user_email = session.user.email;

  if (!_id) {
    return NextResponse.json({ message: "Missing todo ID" }, { status: 400 });
  }


  try {
    await connectToDatabase(); // Connect to the DB

  } catch (error) {

    return NextResponse.json({ message: "Server Error", error }, { status: 500 });
  }
  try {

    const user = await User.findOne({ email: user_email }).select("_id");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const todo = await Todo.findById(_id);
    if (!todo) {
      return NextResponse.json({ message: `Todo with id ${_id} not found` }, { status: 404 });
    }

    return NextResponse.json({ message: "Todo fetched successfully", todo }, { status: 200 });
  } catch (error) {

    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user_email = session.user.email;
  const { _id } = await params;
  if (!_id) {
    return NextResponse.json({ message: "Missing todo ID" }, { status: 400 });
  }

  try {
    await connectToDatabase();
  } catch (error) {
    return NextResponse.json({ message: "Database Error" }, { status: 500 });

  }
let user = null;

  try {

     user = await User.findOne({ email: user_email }).select("todos");
    if (!user) {
      return NextResponse.json({ message: `User not found` }, { status: 404 });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error deleting Todo" }, { status: 500 });
  }
  try {



    // Delete the Todo
    const deletedTodo = await Todo.findByIdAndDelete(_id);



    // Remove the ID from user's todos array
    user.todos = user.todos.filter(todoId => todoId.toString() !== _id);
    const deleted = await user.save();

    return NextResponse.json({ message: `Todo deleted successfully`, deleted }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error deleting Todo" }, { status: 500 });
  }



  
}
