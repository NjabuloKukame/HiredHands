// ========================================
// FILE: app/api/upload/delete/route.js
// ========================================
//
// Deletes an image from Cloudinary by its publicId.
// Call this BEFORE removing the record from your DB,
// or alongside it — the DB cleanup is the caller's responsibility.
//
// Body: { publicId: string }
//
// Returns: { message: string }
// ========================================

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { deleteFromCloudinary } from '@/app/lib/cloudinary';

function getUserFromToken(request) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function DELETE(request) {
  try {
    // 1. Auth
    const decoded = getUserFromToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse body
    const { publicId } = await request.json();

    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json({ error: 'publicId is required.' }, { status: 400 });
    }

    // 3. Security check — make sure the publicId belongs to this user.
    //    Our folder convention is: hired-hands/{role}/{userId}/...
    //    So we can verify the userId segment matches the token.
    const { userId, role } = decoded;
    const roleSegment = role === 'PROVIDER' ? 'providers' : 'customers';
    const expectedPrefix = `hired-hands/${roleSegment}/${userId}/`;

    if (!publicId.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this image.' },
        { status: 403 }
      );
    }

    // 4. Delete from Cloudinary
    const deleted = await deleteFromCloudinary(publicId);

    if (!deleted) {
      // Not found on Cloudinary — treat as success (already gone)
      return NextResponse.json({ message: 'Image not found on Cloudinary — already deleted.' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Image deleted successfully.' }, { status: 200 });

  } catch (error) {
    console.error('[upload/delete] DELETE error:', error);
    return NextResponse.json({ error: 'Delete failed. Please try again.' }, { status: 500 });
  }
}