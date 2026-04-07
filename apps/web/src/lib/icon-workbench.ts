import type {
  IconVariant,
  PlatformKey,
  PlatformPreset
} from "../../../../packages/contracts/src";
import { PLATFORM_PRESETS } from "../../../../packages/contracts/src";
import imageCompression from "browser-image-compression";
const HISTORY_STORAGE_KEY = "isize:web:history";

export const CROP_VIEWPORT_SIZE = 320;
export const DEFAULT_PLATFORM_KEYS: PlatformKey[] = ["web", "ios", "android"];

export interface UploadedImage {
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  src: string;
}

export interface CropState {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface PreviewMetrics {
  drawWidth: number;
  drawHeight: number;
  drawX: number;
  drawY: number;
  maxOffsetX: number;
  maxOffsetY: number;
}

export interface GeneratedIcon {
  id: string;
  platformKey: PlatformKey;
  platformLabel: string;
  variant: IconVariant;
  blob: Blob;
  previewUrl: string;
  archivePath: string;
}

export interface HistoryRecord {
  id: string;
  createdAt: string;
  fileName: string;
  sourceWidth: number;
  sourceHeight: number;
  previewDataUrl: string;
  selectedPlatforms: PlatformKey[];
  generatedCount: number;
  crop: CropState;
}

export const INITIAL_CROP_STATE: CropState = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0
};

export { PLATFORM_PRESETS };
export type { PlatformKey, PlatformPreset, IconVariant };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}

export function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片解码失败"));
    image.src = src;
  });
}

export async function readImageFile(file: File): Promise<UploadedImage> {
  const src = await readAsDataUrl(file);
  const image = await loadImageElement(src);

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    width: image.naturalWidth,
    height: image.naturalHeight,
    src
  };
}

export function getPreviewMetrics(
  sourceWidth: number,
  sourceHeight: number,
  crop: CropState,
  viewportSize = CROP_VIEWPORT_SIZE
): PreviewMetrics {
  const baseScale = viewportSize / Math.min(sourceWidth, sourceHeight);
  const totalScale = baseScale * crop.zoom;
  
  const drawWidth = sourceWidth * totalScale;
  const drawHeight = sourceHeight * totalScale;
  
  // Offset is in source pixels relative to center
  const scaledOffsetX = crop.offsetX * totalScale;
  const scaledOffsetY = crop.offsetY * totalScale;

  const maxScaledOffsetX = Math.max(0, (drawWidth - viewportSize) / 2);
  const maxScaledOffsetY = Math.max(0, (drawHeight - viewportSize) / 2);
  
  const finalOffsetX = clamp(scaledOffsetX, -maxScaledOffsetX, maxScaledOffsetX);
  const finalOffsetY = clamp(scaledOffsetY, -maxScaledOffsetY, maxScaledOffsetY);

  return {
    drawWidth,
    drawHeight,
    drawX: (viewportSize - drawWidth) / 2 + finalOffsetX,
    drawY: (viewportSize - drawHeight) / 2 + finalOffsetY,
    maxOffsetX: maxScaledOffsetX / totalScale,
    maxOffsetY: maxScaledOffsetY / totalScale
  };
}

export function clampCropState(
  crop: CropState,
  sourceWidth: number,
  sourceHeight: number,
  viewportSize = CROP_VIEWPORT_SIZE
) {
  const metrics = getPreviewMetrics(sourceWidth, sourceHeight, crop, viewportSize);

  return {
    zoom: crop.zoom,
    offsetX: clamp(crop.offsetX, -metrics.maxOffsetX, metrics.maxOffsetX),
    offsetY: clamp(crop.offsetY, -metrics.maxOffsetY, metrics.maxOffsetY)
  };
}


function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("导出图片失败"));
    }, "image/png");
  });
}

export async function renderVariantBlob(
  image: HTMLImageElement,
  crop: CropState,
  outputSize: number,
  viewportSize = CROP_VIEWPORT_SIZE
) {
  const canvas = document.createElement("canvas");
  const metrics = getPreviewMetrics(
    image.naturalWidth,
    image.naturalHeight,
    crop,
    viewportSize
  );
  const scaleRatio = outputSize / viewportSize;

  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("当前浏览器不支持 Canvas 2D");
  }

  context.clearRect(0, 0, outputSize, outputSize);
  context.drawImage(
    image,
    metrics.drawX * scaleRatio,
    metrics.drawY * scaleRatio,
    metrics.drawWidth * scaleRatio,
    metrics.drawHeight * scaleRatio
  );

  return canvasToBlob(canvas);
}

export async function createPreviewDataUrl(
  image: HTMLImageElement,
  crop: CropState,
  outputSize = 160
) {
  const canvas = document.createElement("canvas");
  const metrics = getPreviewMetrics(
    image.naturalWidth,
    image.naturalHeight,
    crop,
    CROP_VIEWPORT_SIZE
  );
  const scaleRatio = outputSize / CROP_VIEWPORT_SIZE;

  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("当前浏览器不支持 Canvas 2D");
  }

  context.drawImage(
    image,
    metrics.drawX * scaleRatio,
    metrics.drawY * scaleRatio,
    metrics.drawWidth * scaleRatio,
    metrics.drawHeight * scaleRatio
  );

  return canvas.toDataURL("image/png");
}

export async function compressImage(blob: Blob, quality = 0.8) {
  if (quality >= 1) return blob;
  
  try {
    return await imageCompression(blob as File, {
      maxSizeMB: 1,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
      initialQuality: quality
    });
  } catch (error) {
    console.error("Compression failed:", error);
    return blob;
  }
}

export async function generateIco(pngBlobs: Blob[]) {
  const buffers = await Promise.all(pngBlobs.map(b => b.arrayBuffer()));
  
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalEntriesSize = dirEntrySize * buffers.length;
  const totalDataSize = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const totalSize = headerSize + totalEntriesSize + totalDataSize;
  
  const outBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(outBuffer);
  const u8 = new Uint8Array(outBuffer);
  
  // 1. Header
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type (1 = ICO)
  view.setUint16(4, buffers.length, true); // image count
  
  // 2. Directory Entries
  let offset = headerSize + totalEntriesSize;
  for (let i = 0; i < buffers.length; i++) {
    const buf = buffers[i];
    const dirOffset = headerSize + (i * dirEntrySize);
    
    // We need the width/height to write into directory. Let's assume standard sizes and read from PNG header...
    // Actually, PNG header IHDR contains width/height at bytes 16 and 20.
    const pView = new DataView(buf);
    const width = pView.getUint32(16, false);
    const height = pView.getUint32(20, false);
    
    view.setUint8(dirOffset + 0, width >= 256 ? 0 : width);
    view.setUint8(dirOffset + 1, height >= 256 ? 0 : height);
    view.setUint8(dirOffset + 2, 0); // color count
    view.setUint8(dirOffset + 3, 0); // reserved
    view.setUint16(dirOffset + 4, 1, true); // color planes
    view.setUint16(dirOffset + 6, 32, true); // bpp
    view.setUint32(dirOffset + 8, buf.byteLength, true); // data size
    view.setUint32(dirOffset + 12, offset, true); // data offset
    
    // Copy data
    u8.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  
  return new Blob([outBuffer], { type: "image/x-icon" });
}

export async function generateIconsFromSelection(
  image: HTMLImageElement,
  crop: CropState,
  presets: PlatformPreset[],
  options: { enableCompression?: boolean; compressionQuality?: number; includeIco?: boolean } = {}
) {
  const generated: GeneratedIcon[] = [];
  const { enableCompression = false, compressionQuality = 1, includeIco = false } = options;

  for (const preset of presets) {
    const icoVariants: Blob[] = [];
    
    for (const variant of preset.variants) {
      const outputSize = Math.max(variant.width, variant.height);
      let blob = await renderVariantBlob(image, crop, outputSize);

      if (enableCompression && compressionQuality < 1) {
        blob = await compressImage(blob, compressionQuality);
      }

      generated.push({
        id: `${preset.key}-${variant.id}`,
        platformKey: preset.key,
        platformLabel: preset.label,
        variant,
        blob,
        previewUrl: URL.createObjectURL(blob),
        archivePath: `${preset.key}/${variant.fileName}`
      });

      if (preset.key === "web" && [16, 32, 48].includes(outputSize)) {
        icoVariants.push(blob);
      }
    }

    if (preset.key === "web" && includeIco && icoVariants.length > 0) {
      const icoBlob = await generateIco(icoVariants);
      generated.push({
        id: `web-favicon-ico`,
        platformKey: "web",
        platformLabel: "WEB / PWA",
        variant: {
          id: "favicon-ico",
          width: 48,
          height: 48,
          fileName: "favicon.ico",
          purpose: "favicon",
          recommendedExecutor: "client"
        },
        blob: icoBlob,
        previewUrl: URL.createObjectURL(icoBlob),
        archivePath: "web/favicon.ico"
      });
    }
  }

  return generated;
}

export function revokeGeneratedIcons(icons: GeneratedIcon[]) {
  for (const icon of icons) {
    URL.revokeObjectURL(icon.previewUrl);
  }
}

export function readHistoryRecords() {
  try {
    const rawValue = window.localStorage.getItem(HISTORY_STORAGE_KEY);

    if (!rawValue) {
      return [] as HistoryRecord[];
    }

    const parsed = JSON.parse(rawValue) as HistoryRecord[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as HistoryRecord[];
  }
}

export function saveHistoryRecord(record: HistoryRecord) {
  const nextHistory = [record, ...readHistoryRecords()].slice(0, 6);

  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));

  return nextHistory;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function createDownloadName(platformKey: PlatformKey, fileName: string) {
  return `${platformKey}-${fileName.replaceAll("/", "-")}`;
}

export function createArchiveName() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}`;
  const time = `${String(now.getHours()).padStart(2, "0")}${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  return `isize-export-${date}-${time}.zip`;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}
