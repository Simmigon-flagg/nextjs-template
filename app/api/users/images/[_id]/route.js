import { getServerSession } from "next-auth";
import User from "../../../../../models/user";
import { connectToDatabase } from "../../../../../utils/database";
import { NextResponse } from "next/server";
import { Readable } from "stream";

export async function PUT(request, { params }) {
  const session = await getServerSession();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const { bucket } = await connectToDatabase(); // Use connectToDatabase to establish the connection
    const data = await request.formData();
    const image = data.get("image");
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let imageId = user.imageId; // Keep existing imageId if no new image is provided

    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());

      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      // ✅ Upload image to GridFS
      const uploadStream = bucket.openUploadStream(image.name, {
        contentType: image.type,
      });

      stream.pipe(uploadStream);

      // ✅ Wait for image upload to complete
      imageId = await new Promise((resolve, reject) => {
        uploadStream.on("finish", () => resolve(uploadStream.id));
        uploadStream.on("error", (err) => reject(err));
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { imageId },
      { new: true } // Returns the updated document
    );

    let imagefileUrl = null;
    if (updatedUser.imageId) {
      const image = await bucket.find({ _id: updatedUser.imageId }).toArray();
      if (image && image.length > 0) {
        imagefileUrl = `/api/images/${image[0]._id.toString()}`; // URL to access the image
      }
    }

    await updatedUser.save();
   
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




export async function GET(request, { params }) {
  const session = await getServerSession();
  const user_email = await session?.user?.email;

  try {
    const { bucket } = await connectToDatabase();  // Use connectToDatabase to establish the connection
    const { _id } = await params;
    const data = await User.findOne({ email: user_email });

    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { name, email, imageId, children } = data;
    let imagefileUrl = null;
    if (imageId) {
      const image = await bucket.find({ _id: imageId }).toArray();
      if (image && image.length > 0) {
        imagefileUrl = `/api/images/${image[0]._id.toString()}`;  // URL to access the image
      }
    }
    const user = {
      _id,
      name,
      email,
      imagefileUrl,
      children
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error });
  }
}
