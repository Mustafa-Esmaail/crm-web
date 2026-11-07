import { UNIT_MEDIA_MAX_BYTES } from '../constants';
import type { MediaKind, UnitMedia } from '../types';

/** UploadUnitMediaRequest: photos and floor plans are images, a brochure is a PDF. */
export const MEDIA_EXTENSIONS: Record<MediaKind, readonly string[]> = {
  photo: ['jpg', 'jpeg', 'png', 'webp'],
  floor_plan: ['jpg', 'jpeg', 'png', 'webp'],
  brochure: ['pdf'],
};

/** For the file picker's `accept`, so the dialog only offers files the API takes. */
export function acceptFor(kind: MediaKind): string {
  return MEDIA_EXTENSIONS[kind].map((extension) => `.${extension}`).join(',');
}

export type FileProblem = 'type' | 'size' | null;

/** Checked before uploading so a wrong file fails at once instead of after a 10 MB upload. */
export function checkFile(kind: MediaKind, file: Pick<File, 'name' | 'size'>): FileProblem {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!MEDIA_EXTENSIONS[kind].includes(extension)) return 'type';
  if (file.size > UNIT_MEDIA_MAX_BYTES) return 'size';
  return null;
}

export function isImage(media: Pick<UnitMedia, 'mime'>): boolean {
  return media.mime.startsWith('image/');
}

/** "2.4 MB", "380 KB" */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
