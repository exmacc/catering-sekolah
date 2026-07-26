/** Compress image file to data URL (JPEG), max side & size for DB storage */
export async function fileToDataUrl(
  file: File,
  opts: { maxSide?: number; maxBytes?: number; quality?: number } = {}
): Promise<string> {
  const maxSide = opts.maxSide ?? 800;
  const maxBytes = opts.maxBytes ?? 450_000;
  let quality = opts.quality ?? 0.82;

  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar');
  }
  if (file.size > 4 * 1024 * 1024) {
    throw new Error('Ukuran file maks 4MB sebelum kompresi');
  }

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Browser tidak mendukung canvas');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  while (dataUrl.length > maxBytes && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  if (dataUrl.length > maxBytes) {
    throw new Error('Gambar masih terlalu besar. Pakai foto lebih kecil.');
  }

  return dataUrl;
}
