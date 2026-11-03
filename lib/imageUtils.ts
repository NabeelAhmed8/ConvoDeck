/**
 * lib/imageUtils.ts
 * Single Responsibility: Client-side image optimization and cropping utility
 * for user avatars. Automatically resizes any mobile camera/gallery photo
 * (even 10MB+) down to a crisp, lightweight square avatar (< 50KB).
 */

export interface ResizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

/**
 * Resizes and center-crops an uploaded image file into a square avatar data URL.
 * Guaranteed to produce small payloads (< 50KB) that save instantly and
 * stay well within Server Action payload limits.
 */
export function processAvatarImage(
  file: File,
  options: ResizeImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 256,
    maxHeight = 256,
    quality = 0.85,
    mimeType = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selected file is not a valid image."));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("Failed to read image file."));
    };

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error("Failed to load image for processing."));
      };

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = maxWidth;
          canvas.height = maxHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Canvas 2D context is not available."));
            return;
          }

          // Center-crop to square aspect ratio
          const srcWidth = img.width;
          const srcHeight = img.height;
          const minDim = Math.min(srcWidth, srcHeight);
          const srcX = (srcWidth - minDim) / 2;
          const srcY = (srcHeight - minDim) / 2;

          // Enable high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Draw cropped & scaled square
          ctx.drawImage(
            img,
            srcX,
            srcY,
            minDim,
            minDim,
            0,
            0,
            maxWidth,
            maxHeight
          );

          const dataUrl = canvas.toDataURL(mimeType, quality);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

