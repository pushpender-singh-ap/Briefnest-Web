/** A run of bytes in a file. Both positions are included. */
export interface Span {
  start: number;
  end: number;
}

/**
 * Reads a Range header for a file of `size` bytes.
 *
 * One range is understood: "bytes=0-1", "bytes=500-" or "bytes=-500". Any other form (several ranges, another
 * unit, a malformed value) is "ignored": HTTP lets a server disregard a Range header, and the caller then sends
 * the whole file. "unsatisfiable" means the header is well formed but asks for bytes the file doesn't have.
 */
export function parseRange(header: string, size: number): Span | "ignored" | "unsatisfiable" {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(header.trim());
  if (!match || (match[1] === "" && match[2] === "")) return "ignored";

  // "bytes=-500": the last 500 bytes, or the whole file if it is shorter than that.
  if (match[1] === "") {
    const suffix = Number(match[2]);
    return suffix === 0 || size === 0 ? "unsatisfiable" : { start: Math.max(size - suffix, 0), end: size - 1 };
  }

  const start = Number(match[1]);
  const end = match[2] === "" ? size - 1 : Number(match[2]);
  // A range that ends before it starts is malformed, not out of reach.
  if (match[2] !== "" && end < start) return "ignored";
  if (start >= size) return "unsatisfiable";
  return { start, end: Math.min(end, size - 1) };
}
