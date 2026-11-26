import type { Artwork, Design, Selection, Side } from "./CartState";
import { printBounds } from "./ProductMockup";

export const fonts = { "Sans serif": "Inter, Arial, sans-serif", Serif: "Georgia, serif", Monospace: "monospace" };
export const blankDesign = (): Design => ({ front: [], back: [] });
export const sides: Side[] = ["front", "back"];

export function artworkHeight(layer: Artwork) {
  return layer.width / (layer.kind === "image" ? layer.ratio : 3.2);
}

export function constrain(layer: Artwork): Artwork {
  const radians = layer.angle * Math.PI / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  const height = artworkHeight(layer);
  const widthRotated = cos * layer.width + sin * height;
  const heightRotated = sin * layer.width + cos * height;
  const scale = Math.min(1, (printBounds.width - 2) / widthRotated, (printBounds.height - 2) / heightRotated);
  const halfWidth = widthRotated * scale / 2;
  const halfHeight = heightRotated * scale / 2;
  return { ...layer, width: layer.width * scale,
    x: Math.max(printBounds.left + halfWidth, Math.min(layer.x, printBounds.left + printBounds.width - halfWidth)),
    y: Math.max(printBounds.top + halfHeight, Math.min(layer.y, printBounds.top + printBounds.height - halfHeight)),
  };
}

export function designPlacement(design: Design, fallback: Selection["placement"]): Selection["placement"] {
  if (design.front.length && design.back.length) return "Front & back";
  if (design.front.length) return "Front";
  if (design.back.length) return "Back";
  return fallback;
}

export async function readArtwork(file: File): Promise<number> {
  const supported = ["image/png", "image/jpeg", "image/webp"];
  if (!supported.includes(file.type) || file.size > 10 * 1024 * 1024 || file.size === 0) {
    throw new Error("Choose a PNG, JPEG or WebP image up to 10 MB.");
  }
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const starts = (...bytes: number[]) => bytes.every((byte, index) => header[index] === byte);
  const valid = file.type === "image/png" ? starts(137, 80, 78, 71, 13, 10, 26, 10)
    : file.type === "image/jpeg" ? starts(255, 216, 255)
    : starts(82, 73, 70, 70) && String.fromCharCode(...header.slice(8, 12)) === "WEBP";
  if (!valid) throw new Error("The file contents do not match the selected image format.");
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); }
  catch { throw new Error("This image could not be opened. Try another PNG, JPEG or WebP."); }
  const ratio = bitmap.width / bitmap.height;
  bitmap.close();
  return ratio;
}