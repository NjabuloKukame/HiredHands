// ========================================
// FILE: app/api/upload/route.js
// ========================================
//
// Query params:
//   ?type=avatar     → replaces avatar (stable public ID, overwrites)
//   ?type=cover      → replaces cover image (stable public ID, overwrites)
//   ?type=portfolio  → adds a new portfolio image (unique public ID per upload)
//
// All three require auth. Providers can use all three types.
// Customers can only use "avatar".
//
// Returns: { url, publicId }
// ========================================

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getFolder, uploadToCloudinary } from '@/app/lib/cloudinary';

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Max file size: 8 MB
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

function getUserFromToken(request) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    // 1. Auth
    const decoded = getUserFromToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role } = decoded;

    // 2. Parse upload type from query param (?type=avatar|cover|portfolio)
    const { searchParams } = new URL(request.url);
    const imageType = searchParams.get('type') || 'avatar';

    const validTypes = role === 'PROVIDER'
      ? ['avatar', 'cover', 'portfolio']
      : ['avatar'];

    if (!validTypes.includes(imageType)) {
      return NextResponse.json(
        { error: `Invalid image type "${imageType}" for role ${role}.` },
        { status: 400 }
      );
    }

    // 3. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // 4. Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF.' },
        { status: 400 }
      );
    }

    // 5. Validate file size
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 8 MB.' },
        { status: 400 }
      );
    }

    // 6. Build folder path: e.g. hired-hands/providers/abc123/portfolio
    const folder = getFolder(role, userId, imageType);

    // 7. Build public ID:
    //    - avatar and cover: stable ID so they overwrite the old file automatically
    //    - portfolio: unique ID per upload (timestamp) so multiple images accumulate
    let publicId = null;
    if (imageType === 'avatar' || imageType === 'cover') {
      publicId = imageType; // Cloudinary will store as {folder}/avatar or {folder}/cover
    }
    // portfolio: leave publicId null → Cloudinary generates a unique ID

    // 8. Upload
    const { url, publicId: uploadedPublicId } = await uploadToCloudinary(buffer, folder, publicId);

    return NextResponse.json({ url, publicId: uploadedPublicId }, { status: 200 });

  } catch (error) {
    console.error('[upload] POST error:', error);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}