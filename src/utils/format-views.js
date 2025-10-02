/**
 * Format view count with Arabic thousands suffix
 * @param {number} views - The view count
 * @returns {string} - Formatted view count
 * 
 * Examples:
 * 195 → "195"
 * 1956 → "1.9الف"
 * 15000 → "15الف"
 * 123456 → "123.5الف"
 */
export const formatViews = (views) => {
  if (!views || views < 1000) {
    return views?.toString() || "0";
  }

  const thousands = views / 1000;
  
  // If it's a whole number (like 15000 = 15K)
  if (thousands % 1 === 0) {
    return `${thousands}الف`;
  }
  
  // Otherwise show one decimal place (like 1956 = 1.9K)
  return `${thousands.toFixed(1)}الف`;
};
