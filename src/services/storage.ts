import { supabase } from '../lib/supabase';

/**
 * Storage service for handling file uploads
 * Handles cases where storage is not enabled gracefully
 */

const STORAGE_BUCKET = 'equipment-images';

interface UploadResult {
  url: string | null;
  path: string | null;
  error: Error | null;
}

/**
 * Check if Supabase Storage is available
 */
export async function isStorageAvailable(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    return !error && data !== null;
  } catch (error) {
    console.warn('Storage API not available:', error);
    return false;
  }
}

/**
 * Upload a file to Supabase Storage with fallback
 * @param file - File to upload
 * @param path - Storage path
 * @returns Upload result with URL or error
 */
export async function uploadFile(file: File, path: string): Promise<UploadResult> {
  // Check if storage is available
  const storageAvailable = await isStorageAvailable();
  
  if (!storageAvailable) {
    // Fallback: Return a data URL (base64) for demo purposes
    console.warn('Storage not available. Using local data URL fallback.');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          url: reader.result as string,
          path: `local:${path}`,
          error: null,
        });
      };
      reader.onerror = () => {
        resolve({
          url: null,
          path: null,
          error: new Error('Failed to read file'),
        });
      };
      reader.readAsDataURL(file);
    });
  }

  try {
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      error: null,
    };
  } catch (error) {
    console.error('Storage upload error:', error);
    return {
      url: null,
      path: null,
      error: error as Error,
    };
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(path: string): Promise<boolean> {
  // Skip for local data URLs
  if (path.startsWith('local:') || path.startsWith('data:')) {
    return true;
  }

  const storageAvailable = await isStorageAvailable();
  if (!storageAvailable) {
    return true; // No-op if storage not available
  }

  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    return !error;
  } catch (error) {
    console.error('Storage delete error:', error);
    return false;
  }
}

/**
 * Get public URL for a file
 */
export async function getPublicUrl(path: string): Promise<string | null> {
  // Return as-is for data URLs
  if (path.startsWith('data:') || path.startsWith('http')) {
    return path;
  }

  const storageAvailable = await isStorageAvailable();
  if (!storageAvailable) {
    return path; // Return path as-is
  }

  try {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);

    return data.publicUrl;
  } catch (error) {
    console.error('Storage URL error:', error);
    return null;
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  basePath: string
): Promise<UploadResult[]> {
  const uploads = files.map((file, index) => {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${index}-${file.name}`;
    const path = `${basePath}/${fileName}`;
    return uploadFile(file, path);
  });

  return Promise.all(uploads);
}
