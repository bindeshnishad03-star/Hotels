import React from 'react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  showScore?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  maxStars = 5, 
  showScore = false 
}) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2; // round to nearest 0.5

  for (let i = 1; i <= maxStars; i++) {
    if (i <= roundedRating) {
      stars.push(<i key={i} className="bi bi-star-fill star-icon filled"></i>);
    } else if (i - 0.5 === roundedRating) {
      stars.push(<i key={i} className="bi bi-star-half star-icon filled"></i>);
    } else {
      stars.push(<i key={i} className="bi bi-star star-icon empty"></i>);
    }
  }

  return (
    <div className="star-rating-container">
      <div className="stars-wrapper">{stars}</div>
      {showScore && <span className="rating-score-badge">{rating.toFixed(1)}</span>}
    </div>
  );
};
