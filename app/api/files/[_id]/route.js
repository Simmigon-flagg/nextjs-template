import { connectToDatabase } from "@/utils/database";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { _id } = params;

  try {
    const { bucket } = await connectToDatabase();
    const files = await bucket.find({ _id: new ObjectId(_id) }).toArray();

    if (!files.length) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = files[0];

    // Force proper MIME type
    let contentType = file.contentType;
    if (!contentType) {
      if (file.filename?.toLowerCase().endsWith(".pdf")) {
        contentType = "application/pdf";
      } else if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.filename)) {
        contentType = "image/*";
      } else {
        contentType = "application/octet-stream";
      }
    }

    const downloadStream = bucket.openDownloadStream(new ObjectId(_id));

    const readableStream = new ReadableStream({
      start(controller) {
        downloadStream.on("data", (chunk) => controller.enqueue(chunk));
        downloadStream.on("error", (err) => controller.error(err));
        downloadStream.on("end", () => controller.close());
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${file.filename}"`,
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
