import { getServerSession } from "next-auth";
import { connectToDatabase } from "../../../../../utils/database";
import { NextResponse } from "next/server";
// import { Readable } from "stream";
import { authOptions } from "../../../../../utils/authOptions";
import { uploadImageToGridFS, getImageFileUrl, updateUserImageIdByEmail } from "../../../../../services/api/image"; // <-- use service


export async function PUT(request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const { bucket } = await connectToDatabase();
    const data = await request.formData();
    const image = data.get("image");

    let imageId = null;
    if (image) {
      imageId = await uploadImageToGridFS(bucket, image);
    }

    const updatedUser = await updateUserImageIdByEmail(email, imageId);
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const imagefileUrl = imageId ? await getImageFileUrl(bucket, imageId) : null;

    return NextResponse.json({
      message: "Updated User",
      user: updatedUser,
      imagefileUrl,
      status: 201,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// export async function GET() {
//   const session = await getServerSession(authOptions);
//   const user_email = session?.user?.email;

//   try {
//     const { bucket } = await connectToDatabase();
//     const data = await User.findOne({ email: user_email });

//     if (!data) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     const { _id, name, email, imageId } = data;
//     const imagefileUrl = imageId ? await getImageFileUrl(bucket, imageId) : null; // <-- service handles URL

//     return NextResponse.json({ _id, name, email, imagefileUrl });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error });
//   }
// }
