import React, { useState, useEffect } from 'react';
import { fetchCities } from '../utils/api';

const CityDropdown = ({ onSelect, popularCities }) => {
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true);
        const data = await fetchCities();
        setCities(data);
      } catch (err) {
        setError('Failed to load cities');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCities();
  }, []);

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="city-dropdown">
      <input
        type="text"
        placeholder="Search city..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onClick={() => setIsOpen(true)}
      />
      {isOpen && (
        <ul className="dropdown-list">
          {filteredCities.map(city => (
            <li key={city.code} onClick={() => {
              onSelect(city);
              setIsOpen(false);
            }}>
              {city.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CityDropdown;