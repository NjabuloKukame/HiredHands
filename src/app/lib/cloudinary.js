// ========================================
// FILE: lib/cloudinary.js
// ========================================

import { v2 as cloudinary } from 'cloudinary';

// Configure once — safe to call multiple times (cloudinary is a singleton)
cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
  secure:      true,
});

// ── Folder helpers ────────────────────────────────────────────────────────────

/**
 * Returns the Cloudinary folder path for a given user + image type.
 *
 * Providers:
 *   hired-hands/providers/{userId}/avatar
 *   hired-hands/providers/{userId}/cover
 *   hired-hands/providers/{userId}/portfolio
 *
 * Customers:
 *   hired-hands/customers/{userId}/avatar
 */
export function getFolder(role, userId, imageType) {
  const roleSegment = role === 'PROVIDER' ? 'providers' : 'customers';
  return `hired-hands/${roleSegment}/${userId}/${imageType}`;
}

/**
 * Upload a file buffer to Cloudinary.
 *
 * @param {Buffer} buffer     - Raw file bytes
 * @param {string} folder     - Cloudinary folder path (from getFolder)
 * @param {string} [publicId] - Optional stable public ID (e.g. "avatar" for a single slot)
 *
 * @returns {{ url: string, publicId: string }}
 */
export async function uploadToCloudinary(buffer, folder, publicId = null) {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: 'image',
      // Overwrite if publicId is provided — ensures avatar/cover always replace themselves
      ...(publicId && { public_id: publicId, overwrite: true }),
      // Transformations applied at upload time
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },      // Serve as WebP/AVIF automatically
      ],
    };

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve({
        url:      result.secure_url,
        publicId: result.public_id,     // e.g. "hired-hands/providers/abc123/avatar/avatar"
      });
    });

    uploadStream.end(buffer);
  });
}

/**
 * Delete an image from Cloudinary by its public ID.
 * Fails silently with a warning if publicId is missing — never throws.
 *
 * @param {string} publicId
 * @returns {Promise<boolean>} true if deleted, false otherwise
 */
export async function deleteFromCloudinary(publicId) {
  if (!publicId) {
    console.warn('[cloudinary] deleteFromCloudinary called with no publicId — skipping');
    return false;
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    // result.result === 'ok' means deleted, 'not found' means already gone
    return result.result === 'ok';
  } catch (error) {
    console.error('[cloudinary] delete error:', error);
    return false;
  }
}

export default cloudinary;