// route: /api/todos/search
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email }).select("_id");

  const query = { userId: user._id };
  if (search.trim()) {
    query.title = { $regex: search.trim(), $options: "i" };
  }

  const todos = await Todo.find(query).select("_id title completed createdAt fav");

  return NextResponse.json({ todos }, { status: 200 });
}
