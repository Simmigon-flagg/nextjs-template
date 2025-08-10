import { NextResponse } from "next/server";
import { checkUserExists } from "../../../services/api/user";

export async function POST(request) {
   
    try {
        const { email } = await request.json();

        const userExists = await checkUserExists(email);

        if (userExists) {
            return NextResponse.json({ userExists }, { status: 200 });
        } else {
            return NextResponse.json({ userExists: null }, { status: 200 });
        }

    } catch (error) {
        return NextResponse.json({ error });
    }
}
