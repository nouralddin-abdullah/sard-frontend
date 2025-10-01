import React from 'react';
import ReviewStar from './ReviewStar';

/**
 * StarRating component - renders stars based on rating value
 * Examples:
 * - rating 4.5 out of 5: 4 full stars + 1 half star
 * - rating 3.5 out of 5: 3 full stars + 1 half star + 1 empty star
 * - rating 2 out of 5: 2 full stars + 3 empty stars
 */
const StarRating = ({ rating = 0, maxStars = 5, className = "" }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex gap-1">
      {/* Render full stars */}
      {[...Array(fullStars)].map((_, index) => (
        <ReviewStar key={`full-${index}`} filled className={className} />
      ))}
      
      {/* Render half star if needed */}
      {hasHalfStar && (
        <ReviewStar key="half" half className={className} />
      )}
      
      {/* Render empty stars */}
      {[...Array(emptyStars)].map((_, index) => (
        <ReviewStar key={`empty-${index}`} filled={false} className={className} />
      ))}
    </div>
  );
};

export default StarRating;
