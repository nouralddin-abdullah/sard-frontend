/**
 * Format view count with Arabic numerals and thousands suffix
 * @param {number} views - The view count
 * @returns {string} - Formatted view count in Arabic numerals
 * 
 * Examples:
 * 195 → "١٩٥"
 * 1956 → "١٫٩الف"
 * 15000 → "١٥الف"
 * 123456 → "١٢٣٫٥الف"
 */
export const formatViews = (views) => {
  if (!views || views < 1000) {
    return (views || 0).toLocaleString("ar-SA");
  }

  const thousands = views / 1000;
  
  // If it's a whole number (like 15000 = 15K)
  if (thousands % 1 === 0) {
    return `${thousands.toLocaleString("ar-SA")}الف`;
  }
  
  // Otherwise show one decimal place (like 1956 = 1.9K)
  return `${parseFloat(thousands.toFixed(1)).toLocaleString("ar-SA")}الف`;
};
