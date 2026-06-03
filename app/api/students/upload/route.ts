import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        message:
          'Cloudinary server configuration is missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash('sha1')
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const uploadData = new FormData();
  uploadData.append('file', file as Blob);
  uploadData.append('api_key', apiKey);
  uploadData.append('timestamp', String(timestamp));
  uploadData.append('signature', signature);

  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: uploadData,
    }
  );

  const result = await cloudinaryResponse.json();

  if (!cloudinaryResponse.ok) {
    return NextResponse.json(
      { message: result.error?.message || 'Cloudinary upload failed.' },
      { status: cloudinaryResponse.status }
    );
  }

  return NextResponse.json({ photoUrl: result.secure_url }, { status: 200 });
}
