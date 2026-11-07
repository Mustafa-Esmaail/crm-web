import { describe, expect, it } from 'vitest';

import { acceptFor, checkFile, formatFileSize, isImage } from './media';

describe('checkFile', () => {
  it('accepts images for photos and floor plans, and PDFs for brochures', () => {
    expect(checkFile('photo', { name: 'front.JPG', size: 1000 })).toBeNull();
    expect(checkFile('floor_plan', { name: 'plan.webp', size: 1000 })).toBeNull();
    expect(checkFile('brochure', { name: 'brochure.pdf', size: 1000 })).toBeNull();
  });

  it('rejects the wrong type before uploading', () => {
    expect(checkFile('photo', { name: 'brochure.pdf', size: 1000 })).toBe('type');
    expect(checkFile('brochure', { name: 'photo.png', size: 1000 })).toBe('type');
    expect(checkFile('photo', { name: 'no-extension', size: 1000 })).toBe('type');
  });

  it('rejects files over 10 MB', () => {
    expect(checkFile('photo', { name: 'big.jpg', size: 10 * 1024 * 1024 + 1 })).toBe('size');
  });
});

describe('media helpers', () => {
  it('builds the picker filter from the allowed extensions', () => {
    expect(acceptFor('brochure')).toBe('.pdf');
    expect(acceptFor('photo')).toBe('.jpg,.jpeg,.png,.webp');
  });

  it('tells images from documents by MIME type', () => {
    expect(isImage({ mime: 'image/webp' })).toBe(true);
    expect(isImage({ mime: 'application/pdf' })).toBe(false);
  });

  it('formats sizes in KB or MB', () => {
    expect(formatFileSize(380 * 1024)).toBe('380 KB');
    expect(formatFileSize(2.4 * 1024 * 1024)).toBe('2.4 MB');
    expect(formatFileSize(10)).toBe('1 KB');
  });
});
