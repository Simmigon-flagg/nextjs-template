import { getServerSession } from "next-auth";
import User from "../../../../models/user";
import { connectToDatabase } from "../../../../utils/database";  // Import connectToDatabase function
import { NextResponse } from "next/server";


export async function PUT(request, { params }) {
    const session = await getServerSession();
    const email = session?.user?.email;

    if (!email) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    try {
        const { bucket } = await connectToDatabase(); // Use connectToDatabase to establish the connection
        const { _id } = await params;
        const data = await request.json();
       

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { ...data },
            { new: true } // Returns the updated document
        );


        await updatedUser.save();

        return NextResponse.json({
            message: "Updated User",
            user: updatedUser,
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
