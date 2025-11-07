/**
 * Date formatting utilities for frontend applications
 * Handles ISO datetime strings like: 2025-08-03T17:12:14.7334858
 */

// Helper function to ensure UTC date strings are properly formatted
const ensureUTC = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return dateString;
  return dateString.endsWith('Z') ? dateString : dateString + 'Z';
};

// Basic formatting functions
export const formatDate = (dateString) => {
  const date = new Date(ensureUTC(dateString));
  return date.toLocaleDateString();
};

export const formatTime = (dateString) => {
  const date = new Date(ensureUTC(dateString));
  return date.toLocaleTimeString();
};

export const formatDateTime = (dateString) => {
  const date = new Date(ensureUTC(dateString));
  return date.toLocaleString();
};

// Specific format functions
export const formatDateShort = (dateString) => {
  const date = new Date(ensureUTC(dateString));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateLong = (dateString) => {
  const date = new Date(ensureUTC(dateString));
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime12Hour = (dateString) => {
  const date = new Date(ensureUTC(dateString));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatTime24Hour = (dateString) => {
  const date = new Date(ensureUTC(dateString));
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// Relative time functions
export const getTimeAgo = (dateString) => {
  // Handle undefined or null dates
  if (!dateString) return "غير محدد";
  
  // Backend stores dates as UTC without 'Z' suffix, so we need to append it
  const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
  const date = new Date(utcDateString);
  
  // Check if date is invalid
  if (isNaN(date.getTime())) return "غير محدد";
  
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDateShort(utcDateString);
};

export const isToday = (dateString) => {
  const date = new Date(ensureUTC(dateString));
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isYesterday = (dateString) => {
  const date = new Date(ensureUTC(dateString));
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

// Custom format functions
export const formatCustom = (dateString, options = {}) => {
  const date = new Date(ensureUTC(dateString));
  return date.toLocaleDateString("en-US", options);
};

export const formatDateOnly = (dateString) => {
  const date = new Date(ensureUTC(dateString));
  return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
};

export const formatForInput = (dateString) => {
  const date = new Date(ensureUTC(dateString));
  return date.toISOString().slice(0, 16); // Returns YYYY-MM-DDTHH:mm for datetime-local input
};

// Smart formatting based on context
export const formatSmart = (dateString) => {
  if (!dateString) return "N/A";
  
  if (isToday(dateString)) {
    return `Today at ${formatTime12Hour(dateString)}`;
  }
  if (isYesterday(dateString)) {
    return `Yesterday at ${formatTime12Hour(dateString)}`;
  }

  const date = new Date(ensureUTC(dateString));
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return formatDateShort(dateString);
};

// Utility functions
export const isValidDate = (dateString) => {
  const date = new Date(ensureUTC(dateString));
  return !isNaN(date.getTime());
};

export const safeFormat = (dateString, formatter = formatDateTime) => {
  if (!dateString) return "N/A";
  if (!isValidDate(dateString)) return "Invalid Date";
  return formatter(dateString);
};

// Get time since date in Arabic (for joined date)
export const getTimeSinceArabic = (dateString) => {
  if (!dateString) return "غير محدد";
  
  const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
  const date = new Date(utcDateString);
  
  if (isNaN(date.getTime())) return "غير محدد";
  
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffYears >= 1) {
    return `منذ ${diffYears} ${diffYears === 1 ? 'سنة' : diffYears === 2 ? 'سنتين' : 'سنوات'}`;
  }
  if (diffMonths >= 1) {
    return `منذ ${diffMonths} ${diffMonths === 1 ? 'شهر' : diffMonths === 2 ? 'شهرين' : 'شهور'}`;
  }
  if (diffDays >= 1) {
    return `منذ ${diffDays} ${diffDays === 1 ? 'يوم' : diffDays === 2 ? 'يومين' : 'أيام'}`;
  }
  
  return "منذ اليوم";
};

// Example usage:
/*
const exampleDate = '2025-08-03T17:12:14.7334858';

console.log(formatDate(exampleDate));         // 8/3/2025
console.log(formatTime(exampleDate));         // 5:12:14 PM
console.log(formatDateTime(exampleDate));     // 8/3/2025, 5:12:14 PM
console.log(formatDateShort(exampleDate));    // Aug 3, 2025
console.log(formatDateLong(exampleDate));     // Sunday, August 3, 2025
console.log(formatTime12Hour(exampleDate));   // 5:12 PM
console.log(formatTime24Hour(exampleDate));   // 17:12
console.log(getTimeAgo(exampleDate));         // Will show relative time
console.log(formatSmart(exampleDate));        // Context-aware formatting
console.log(getTimeSinceArabic(exampleDate)); // منذ X سنوات/شهور/أيام
*/
