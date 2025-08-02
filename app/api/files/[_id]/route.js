import { connectToDatabase } from "../../../../utils/database";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { _id } = await params;
  try {
    const { bucket } = await connectToDatabase();


    const file = await bucket.find({ _id: new ObjectId(_id) }).toArray();
    if (!file.length) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileStream = bucket.openDownloadStream(new ObjectId(_id));

    return new NextResponse(fileStream, {
      headers: {
        "Content-Type": file[0].contentType,
        "Content-Disposition": `inline; filename="${file[0].filename}"`,
      },
    });

  } catch (error) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
