export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Validates a data: URI image (type + decoded size). Returns null if OK, else an error message. */
export function validateDataUriImage(url: string): string | null {
  if (url.startsWith("http://") || url.startsWith("https://")) return null; // seeded/remote
  const match = /^data:([^;]+);base64,(.*)$/.exec(url);
  if (!match) return "Unsupported image format";
  const [, mime, b64] = match;
  if (!ACCEPTED_IMAGE_TYPES.includes(mime)) {
    return "Images must be JPEG, PNG or WebP";
  }
  const bytes = Math.floor((b64.length * 3) / 4);
  if (bytes > MAX_IMAGE_BYTES) return "Each image must be 2MB or smaller";
  return null;
}
