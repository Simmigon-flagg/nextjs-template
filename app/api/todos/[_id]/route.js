import { connectToDatabase } from '../../../../utils/database';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import User from '../../../../models/user';
import Todo from '../../../../models/todo';
import { logEvent } from '../../../../utils/logger';

// ----------------------
// Helper: get user ID from session
// ----------------------
async function getUserIdFromSession(session) {
  if (!session?.user?.email) return null;
  const user = await User.findOne({ email: session.user.email }).select('_id');
  return user?._id || null;
}

// ----------------------
// PUT - Update Todo
// ----------------------
export async function PUT(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    await logEvent({ level: 'error', message: 'Unauthorized PUT attempt', meta: { error: error.message } });
    return NextResponse.json({ message: 'Unauthorized', error }, { status: 401 });
  }

  const { _id } = await params;
  const userId = await getUserIdFromSession(session);

  if (!userId) {
    await logEvent({ level: 'error', message: 'User not found in PUT', meta: { _id } });
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    await logEvent({ level: 'warn', message: 'Invalid request body', meta: { _id }, userId });
    return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
  }

  if (!data.title) {
    await logEvent({ level: 'warn', message: 'Missing title field', meta: { _id }, userId });
    return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const updated = await Todo.findByIdAndUpdate(_id, data, { new: true });

    if (!updated) {
      await logEvent({ level: 'warn', message: 'Todo not found', meta: { _id }, userId });
      return NextResponse.json({ message: `Todo with id ${_id} not found` }, { status: 404 });
    }

    await logEvent({ level: 'info', message: 'Todo updated successfully', meta: { _id, data }, userId });
    return NextResponse.json({ message: 'Todo updated successfully', updated }, { status: 200 });
  } catch (error) {
    await logEvent({ level: 'error', message: 'Error updating Todo', meta: { _id, error: error.message }, userId });
    return NextResponse.json({ message: 'Error updating Todo' }, { status: 500 });
  }
}

// ----------------------
// GET - Fetch Todo
// ----------------------
export async function GET(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch {
    await logEvent({ level: 'warn', message: 'Unauthorized GET attempt' });
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { _id } = params;
  const userId = await getUserIdFromSession(session);

  if (!_id) return NextResponse.json({ message: 'Missing todo ID' }, { status: 400 });
  if (!userId) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  try {
    await connectToDatabase();
    const todo = await Todo.findById(_id);

    if (!todo) {
      await logEvent({ level: 'warn', message: 'Todo not found', meta: { _id }, userId });
      return NextResponse.json({ message: `Todo with id ${_id} not found` }, { status: 404 });
    }

    await logEvent({ level: 'info', message: 'Fetched todo successfully', meta: { _id }, userId });
    return NextResponse.json({ message: 'Todo fetched successfully', todo }, { status: 200 });
  } catch (error) {
    await logEvent({ level: 'error', message: 'Error fetching todo', meta: { _id, error: error.message }, userId });
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

// ----------------------
// DELETE - Delete Todo
// ----------------------
export async function DELETE(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch {
    await logEvent({ level: 'warn', message: 'Unauthorized DELETE attempt' });
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { _id } = params;
  const userId = await getUserIdFromSession(session);

  if (!_id) return NextResponse.json({ message: 'Missing todo ID' }, { status: 400 });
  if (!userId) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  try {
    await connectToDatabase();

    const deletedTodo = await Todo.findByIdAndDelete(_id);
    if (!deletedTodo) {
      await logEvent({ level: 'warn', message: 'Todo not found', meta: { _id }, userId });
      return NextResponse.json({ message: 'Todo not found' }, { status: 404 });
    }

    await logEvent({ level: 'info', message: 'Todo deleted successfully', meta: { _id }, userId });
    return NextResponse.json({ message: 'Todo deleted successfully' }, { status: 200 });
  } catch (error) {
    await logEvent({ level: 'error', message: 'Error deleting Todo', meta: { _id, error: error.message }, userId });
    return NextResponse.json({ message: 'Error deleting Todo' }, { status: 500 });
  }
}

// ----------------------
// PATCH - Partial Update
// ----------------------
export async function PATCH(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    await logEvent({ level: 'warn', message: 'Unauthorized PATCH attempt', meta: { error: error.message } });
    return NextResponse.json({ message: 'Unauthorized', error }, { status: 401 });
  }

  const { _id } = params;
  const userId = await getUserIdFromSession(session);

  if (!userId) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  let data;
  try {
    data = await request.json();
  } catch {
    await logEvent({ level: 'warn', message: 'Invalid request body', meta: { _id }, userId });
    return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const updated = await Todo.findByIdAndUpdate(_id, data, { new: true });
    if (!updated) {
      await logEvent({ level: 'warn', message: 'Todo not found', meta: { _id }, userId });
      return NextResponse.json({ message: `Todo with id ${_id} not found` }, { status: 404 });
    }

    await logEvent({ level: 'info', message: 'Todo patched successfully', meta: { _id, data }, userId });
    return NextResponse.json({ message: 'Todo updated successfully', updated }, { status: 200 });
  } catch (error) {
    await logEvent({ level: 'error', message: 'Error patching Todo', meta: { _id, error: error.message }, userId });
    return NextResponse.json({ message: 'Error updating Todo' }, { status: 500 });
  }
}
