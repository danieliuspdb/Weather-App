import React from 'react';
import { formatTemperature, formatWindSpeed, getWeatherIcon } from '../utils/helpers';

const CurrentWeather = ({ weather, cityName }) => {
  if (!weather) return <div className="loading">Loading current weather...</div>;

  return (
    <div className="current-weather">
      <div className="location-header">
        <h2>Current Weather in {cityName}</h2>
      </div>
      
      <div className="weather-card">
        <div className="temp">
          {formatTemperature(weather.airTemperature)}
          <span className="weather-icon">{getWeatherIcon(weather.conditionCode)}</span>
        </div>
        <div className="details">
          <div>Wind: {formatWindSpeed(weather.windSpeed)}</div>
          <div>Humidity: {weather.relativeHumidity}%</div>
          <div>Condition: {weather.conditionCode}</div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;