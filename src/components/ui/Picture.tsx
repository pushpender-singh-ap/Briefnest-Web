import { preload } from "react-dom";
import { image, imageUrl, nearestWidth, srcSet, type ImageId } from "@/lib/images";
import { cn } from "@/lib/cn";

interface PictureProps {
  /** An id from scripts/images.config.mjs. */
  id: ImageId;
  /** Describe what the image shows. Pass "" only for decoration. */
  alt: string;
  /** How wide the image is laid out at each breakpoint, e.g. "(min-width: 1024px) 560px, 92vw". */
  sizes: string;
  /** A different image below 640 px: a narrower render or a tighter crop of the same view. */
  small?: { id: ImageId; sizes?: string };
  /** The page's largest above-the-fold image: load eagerly, at high priority, and preload the AVIF. */
  priority?: boolean;
  /** Above the fold but small (a logo): load without waiting for layout, at normal priority. */
  eager?: boolean;
  className?: string;
  imgClassName?: string;
}

const SMALL = "(max-width: 639px)";

/**
 * Responsive image built on the pre-generated files in public/img.
 *
 * The site is a static export, so there is no on-demand optimizer. Instead scripts/build-images.mjs writes
 * AVIF and WebP at several widths, and this component turns them into a <picture> with exact srcsets, reserved
 * dimensions (no layout shift), lazy loading and async decoding. Server component: it ships no JavaScript.
 */
export function Picture({ id, alt, sizes, small, priority = false, eager = false, className, imgClassName }: PictureProps) {
  const record = image(id);
  const smallRecord = small ? image(small.id) : undefined;

  if (priority) {
    // One preload per art-directed variant, so a phone never fetches the desktop image.
    if (small) {
      preload(imageUrl(small.id, nearestWidth(small.id, 640), "avif"), {
        as: "image",
        type: "image/avif",
        imageSrcSet: srcSet(small.id, "avif"),
        imageSizes: small.sizes ?? sizes,
        media: SMALL,
        fetchPriority: "high",
      });
    }
    preload(imageUrl(id, nearestWidth(id, 1280), "avif"), {
      as: "image",
      type: "image/avif",
      imageSrcSet: srcSet(id, "avif"),
      imageSizes: sizes,
      media: small ? "(min-width: 640px)" : undefined,
      fetchPriority: "high",
    });
  }

  return (
    <picture className={className}>
      {small && smallRecord && (
        <>
          <source
            media={SMALL}
            type="image/avif"
            srcSet={srcSet(small.id, "avif")}
            sizes={small.sizes ?? sizes}
            width={smallRecord.width}
            height={smallRecord.height}
          />
          <source
            media={SMALL}
            type="image/webp"
            srcSet={srcSet(small.id, "webp")}
            sizes={small.sizes ?? sizes}
            width={smallRecord.width}
            height={smallRecord.height}
          />
        </>
      )}
      <source type="image/avif" srcSet={srcSet(id, "avif")} sizes={sizes} width={record.width} height={record.height} />
      <source type="image/webp" srcSet={srcSet(id, "webp")} sizes={sizes} width={record.width} height={record.height} />
      {/* The optimized sources are above; this <img> is the layout box and the last-resort fallback. */}
      <img
        src={imageUrl(id, nearestWidth(id, 1280), "webp")}
        alt={alt}
        width={record.width}
        height={record.height}
        loading={priority || eager ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
        className={cn("block h-auto w-full", imgClassName)}
      />
    </picture>
  );
}
