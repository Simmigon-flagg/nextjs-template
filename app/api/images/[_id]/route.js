import { connectToDatabase } from "../../../../utils/database";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
    try {
        const { bucket } = await connectToDatabase();
        const { _id } = await params;

        if (!ObjectId.isValid(_id)) {
            return NextResponse.json({ error: "Invalid image ID" }, { status: 400 });
        }

        const objectId = new ObjectId(_id);
        const downloadStream = bucket.openDownloadStream(objectId);

        const stream = new ReadableStream({
            start(controller) {
                downloadStream.on("data", (chunk) => controller.enqueue(chunk));
                downloadStream.on("end", () => controller.close());
                downloadStream.on("error", (err) => controller.error(err));
            }
        });

        return new NextResponse(stream, {
            headers: {
                "Content-Type": "image/*",
                "Cache-Control": "public, max-age=31536000, immutable"
            }
        });

    } catch (error) {
        console.error("Error in GET /api/images:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
