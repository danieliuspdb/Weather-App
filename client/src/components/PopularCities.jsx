import React from 'react';

const PopularCities = ({ cities, onSelect }) => {
  return (
    <div className="popular-cities">
      <h3>Most Viewed Cities</h3>
      <ul>
        {cities.map((city, index) => (
          <li key={index} onClick={() => onSelect(city)}>
            {city.name} 
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PopularCities;