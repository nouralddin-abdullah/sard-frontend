import React from "react";
import { translateGenre } from "../../utils/translate-genre";

/**
 * GenreBadge component - displays a genre name in Arabic with consistent styling
 * @param {Object} props
 * @param {Object} props.genre - Genre object with id, name, and slug
 * @param {string} props.size - Size variant: 'xs', 'sm', 'md', 'lg'
 * @param {string} props.className - Additional CSS classes
 */
const GenreBadge = ({ genre, size = "sm", className = "" }) => {
  if (!genre || !genre.name) return null;

  const translatedName = translateGenre(genre.name);

  const sizeClasses = {
    xs: "text-[10px] px-2 py-0.5",
    sm: "text-xs px-2.5 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.sm;

  return (
    <span
      className={`${sizeClass} rounded-full noto-sans-arabic-medium bg-[#4A9EFF]/10 text-[#4A9EFF] border border-[#4A9EFF]/20 inline-block ${className}`}
    >
      {translatedName}
    </span>
  );
};

export default GenreBadge;
