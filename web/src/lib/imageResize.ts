// Client-side image → small square data URL. Used for store logos so
// they can live inline in the household doc (no Cloud Storage). Mirrors
// the resize-before-store approach RecipeTracker uses for photo import.
//
// Output: a `size`×`size` data URL, the source image "contained"
// (never cropped) on a transparent canvas and centered — so a wide
// wordmark logo keeps its aspect ratio inside the disc. WebP when the
// browser can encode it (smaller), PNG otherwise.

const DEFAULT_SIZE = 96;
const MAX_INPUT_BYTES = 8 * 1024 * 1024; // 8 MB guard on the picked file

export type StoreLogoResult = {
  dataUrl: string;
  bytes: number;
};

export async function fileToStoreLogo(
  file: File,
  size: number = DEFAULT_SIZE,
): Promise<StoreLogoResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (PNG, JPG, SVG, or WebP).");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("That image is too large — pick one under 8 MB.");
  }

  const source = await loadImage(file);
  const { width, height } = naturalSize(source);
  if (!width || !height) {
    throw new Error("Couldn't read that image.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image processing isn't available in this browser.");

  // Contain: scale to fit, center, no crop.
  const scale = Math.min(size / width, size / height);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const x = Math.round((size - w) / 2);
  const y = Math.round((size - h) / 2);

  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source as CanvasImageSource, x, y, w, h);

  if (typeof (source as ImageBitmap).close === "function") {
    (source as ImageBitmap).close();
  }

  let dataUrl = canvas.toDataURL("image/webp", 0.85);
  if (!dataUrl.startsWith("data:image/webp")) {
    // Browser declined WebP — fall back to PNG (keeps transparency).
    dataUrl = canvas.toDataURL("image/png");
  }
  return { dataUrl, bytes: dataUrl.length };
}

function naturalSize(
  source: ImageBitmap | HTMLImageElement,
): { width: number; height: number } {
  if (source instanceof HTMLImageElement) {
    return {
      width: source.naturalWidth || source.width,
      height: source.naturalHeight || source.height,
    };
  }
  return { width: source.width, height: source.height };
}

async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap is fastest + handles most formats, but doesn't
  // decode SVG in every browser — fall back to an <img> for those.
  if (file.type !== "image/svg+xml" && "createImageBitmap" in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to the <img> path
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Couldn't load that image."));
      img.src = url;
    });
  } finally {
    // Revoke on the next tick so the decode has the URL it needs.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
