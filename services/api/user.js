import User from "../../models/user";
import { connectToDatabase } from "../../utils/database";

export async function updateUserByEmail(email, data) {
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) return null;

    Object.assign(user, data);
    await user.save();
    return user;
}

export async function getUserProfile(email) {
    const { bucket } = await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) return null;

    let imagefileUrl = null;
    if (user.imageId) {
        const image = await bucket.find({ _id: user.imageId }).toArray();
        if (image.length > 0) {
            imagefileUrl = `/api/images/${image[0]._id.toString()}`;
        }
    }

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        imagefileUrl,
        children: user.children
    };
}
export async function checkUserExists(email) {
  await connectToDatabase();
  return User.findOne({ email }).select("_id");
}