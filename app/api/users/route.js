import User from "../../../models/user";
import { connectToDatabase } from "../../../utils/database";
import { NextResponse } from "next/server";

// betterpassword
export async function POST(request) {
    try {
        await connectToDatabase(); // Connect to the DB

        const { email } = await request.json();
     
        const userExists = await User.findOne({ email }).select("_id");
       
        return NextResponse.json({ userExists });
    } catch (error) {
        
        return NextResponse.json({ error });
    }

}