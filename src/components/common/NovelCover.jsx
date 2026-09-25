import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { coverSources } from "../../utils/cover-image";

/**
 * A novel cover, the same way everywhere: a fixed 2:3 frame (no layout shift, nothing stretched), the right file for
 * the slot from the stored sizes (srcset + sizes), lazy unless it is the page's main image, and a styled placeholder
 * with the title when there is no cover or it fails to load.
 *
 * Size the frame with `className` (a width such as "w-32"; the height follows from 2:3). `sizes` tells the browser how
 * wide the frame is so it downloads the smallest file that is sharp enough.
 */
const NovelCover = ({
  src,
  title = "",
  sizes = "160px",
  priority = false,
  className = "",
  rounded = "rounded-lg",
  imgClassName = "",
  alt,
  children,
}) => {
  const { t } = useTranslation();
  const sources = coverSources(src);

  return (
    <div
      className={`@container relative isolate aspect-[2/3] overflow-hidden bg-[#3a3a3a] ${rounded} ${className}`}
    >
      {sources ? (
        // Keyed by URL so a new cover starts from a clean loading/error state (carousels reuse the element).
        <CoverImage
          key={sources.src}
          sources={sources}
          sizes={sizes}
          priority={priority}
          alt={alt ?? (title ? t("cover.alt", { title }) : t("cover.altUntitled"))}
          title={title}
          imgClassName={imgClassName}
        />
      ) : (
        <CoverPlaceholder title={title} />
      )}
      {children}
    </div>
  );
};

const CoverImage = ({ sources, sizes, priority, alt, title, imgClassName }) => {
  const [status, setStatus] = useState("loading");
  const imgRef = useRef(null);

  // An image served from cache can finish before React attaches onLoad.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) setStatus(img.naturalWidth > 0 ? "loaded" : "failed");
  }, []);

  if (status === "failed") return <CoverPlaceholder title={title} />;

  return (
    <img
      ref={imgRef}
      src={sources.src}
      srcSet={sources.srcSet}
      sizes={sources.srcSet ? sizes : undefined}
      width={320}
      height={480}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      draggable={false}
      onLoad={() => setStatus("loaded")}
      onError={() => setStatus("failed")}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
        status === "loaded" ? "opacity-100" : "opacity-0"
      } ${imgClassName}`}
    />
  );
};

/** Shown for a novel without a cover, or while a broken cover link is waiting to be fixed. */
export const CoverPlaceholder = ({ title }) => {
  const { t } = useTranslation();
  return (
    <div
      role="img"
      aria-label={title ? t("cover.alt", { title }) : t("cover.altUntitled")}
      className="absolute inset-0 flex flex-col items-center justify-between bg-gradient-to-b from-[#0f3460] via-[#16213e] to-[#1a1a2e] p-[8cqw] text-center"
    >
      <span className="h-px w-1/3 bg-white/20" aria-hidden="true" />
      <span
        dir="auto"
        className="noto-sans-arabic-extrabold line-clamp-4 break-words text-white/90 leading-snug text-[length:clamp(9px,12cqw,30px)]"
      >
        {title}
      </span>
      <span className="noto-sans-arabic-extrabold text-white/45 text-[length:clamp(8px,9cqw,20px)]" aria-hidden="true">
        {t("cover.brand")}
      </span>
    </div>
  );
};

export default NovelCover;
