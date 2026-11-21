import manifest from "@/content/generated/images.json";

/** Every image the pipeline built. Adding one to scripts/images.config.mjs adds it here. */
export type ImageId = keyof typeof manifest;

export interface ImageRecord {
  /** Path without width and extension, e.g. /img/notes.841d3222de */
  base: string;
  /** Intrinsic size after cropping, in pixels. */
  width: number;
  height: number;
  /** Widths that exist on disk, ascending. */
  widths: number[];
}

export type ImageFormat = "avif" | "webp";

export function image(id: ImageId): ImageRecord {
  return manifest[id];
}

export function imageUrl(id: ImageId, width: number, format: ImageFormat): string {
  return `${manifest[id].base}-${width}.${format}`;
}

export function srcSet(id: ImageId, format: ImageFormat): string {
  return manifest[id].widths.map((width) => `${imageUrl(id, width, format)} ${width}w`).join(", ");
}

/** The built width closest to (and not below) the one asked for; the largest if none is big enough. */
export function nearestWidth(id: ImageId, wanted: number): number {
  const { widths } = manifest[id];
  return widths.find((width) => width >= wanted) ?? widths[widths.length - 1];
}

export const imageIds = Object.keys(manifest) as ImageId[];
