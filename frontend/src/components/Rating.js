import React from 'react';
import PropTypes from 'prop-types';

const Rating = ({ value, text, color }) => {
  return (
    <div className='flex items-center space-x-1'>
      <div className='flex space-x-1'>
        <span>
          <i
            style={{ color }}
            className={
              value >= 1
                ? 'fas fa-star text-yellow-400'
                : value >= 0.5
                ? 'fas fa-star-half-alt text-yellow-400'
                : 'far fa-star text-gray-300'
            }
          ></i>
        </span>
        <span>
          <i
            style={{ color }}
            className={
              value >= 2
                ? 'fas fa-star text-yellow-400'
                : value >= 1.5
                ? 'fas fa-star-half-alt text-yellow-400'
                : 'far fa-star text-gray-300'
            }
          ></i>
        </span>
        <span>
          <i
            style={{ color }}
            className={
              value >= 3
                ? 'fas fa-star text-yellow-400'
                : value >= 2.5
                ? 'fas fa-star-half-alt text-yellow-400'
                : 'far fa-star text-gray-300'
            }
          ></i>
        </span>
        <span>
          <i
            style={{ color }}
            className={
              value >= 4
                ? 'fas fa-star text-yellow-400'
                : value >= 3.5
                ? 'fas fa-star-half-alt text-yellow-400'
                : 'far fa-star text-gray-300'
            }
          ></i>
        </span>
        <span>
          <i
            style={{ color }}
            className={
              value >= 5
                ? 'fas fa-star text-yellow-400'
                : value >= 4.5
                ? 'fas fa-star-half-alt text-yellow-400'
                : 'far fa-star text-gray-300'
            }
          ></i>
        </span>
      </div>

      {text && <span className='text-sm text-gray-600 ml-2'>{text}</span>}
    </div>
  );
};

Rating.defaultProps = {
  color: '#d4af37',
};
Rating.propTypes = {
  value: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  color: PropTypes.string,
};

export default Rating;
