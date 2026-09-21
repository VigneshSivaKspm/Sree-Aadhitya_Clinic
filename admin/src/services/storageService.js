import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../config/firebase';
import { AppError } from '../utils/errors';

export const MAX_IMAGE_MB = 5;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export function validateImage(file) {
  if (!ALLOWED.includes(file.type)) return `“${file.name}” is not a supported image (use JPG, PNG, WebP, GIF or AVIF).`;
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `“${file.name}” is larger than ${MAX_IMAGE_MB} MB.`;
  return '';
}

const extension = (file) => (file.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
const uniqueName = (file) => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension(file)}`;

/**
 * Uploads to `folder/<unique-name>` (e.g. products, doctors/ayurveda, site/main).
 * Resolves { url, path }; `onProgress` receives 0–100.
 */
export function uploadImage(file, folder, onProgress) {
  const problem = validateImage(file);
  if (problem) return Promise.reject(new AppError(problem, 'invalid-image'));
  const path = `${folder}/${uniqueName(file)}`;
  const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type, cacheControl: 'public,max-age=31536000' });
  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => resolve({ url: await getDownloadURL(task.snapshot.ref), path }),
    );
  });
}

/** Deletes a Storage object from its download URL. Never throws for missing/foreign files. */
export async function deleteImageByUrl(url) {
  if (!url || !/^https:\/\/firebasestorage\.googleapis\.com|\.firebasestorage\.app|storage\.googleapis\.com/.test(url)) return;
  try {
    await deleteObject(ref(storage, url));
  } catch (err) {
    if (err?.code !== 'storage/object-not-found') console.warn('Could not delete image', err?.code);
  }
}

export const deleteImages = (urls = []) => Promise.all(urls.filter(Boolean).map(deleteImageByUrl));
