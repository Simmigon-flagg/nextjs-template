import { connectToDatabase } from '../../../../utils/database';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { _id } = await params;

  try {
    const { bucket } = await connectToDatabase();
    const files = await bucket.find({ _id: new ObjectId(_id) }).toArray();

    if (!files.length) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = files[0];

    // Sanitize filename for ASCII header compatibility
    const originalName = file.filename || 'file';
    const safeFilename = originalName.replace(/[^\x20-\x7E]/g, '_');

    // Determine content type
    let contentType = file.contentType;
    if (!contentType) {
      if (originalName.toLowerCase().endsWith('.pdf')) {
        contentType = 'application/pdf';
      } else if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(originalName)) {
        contentType = 'image/*';
      } else {
        contentType = 'application/octet-stream';
      }
    }

    const downloadStream = bucket.openDownloadStream(new ObjectId(_id));

    const readableStream = new ReadableStream({
      start(controller) {
        downloadStream.on('data', chunk => controller.enqueue(chunk));
        downloadStream.on('error', err => controller.error(err));
        downloadStream.on('end', () => controller.close());
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': contentType,
        // ASCII-safe name + UTF-8 version per RFC 5987
        'Content-Disposition': `inline; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(originalName)}`,
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
