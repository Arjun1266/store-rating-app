import React, { useState } from 'react';

const StarRating = ({ value, onChange, readOnly = false }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hovered || value) ? 'filled' : ''}`}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          style={{ cursor: readOnly ? 'default' : 'pointer' }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
