import React from 'react';
import { formatTemperature, formatDate, getWeatherIcon } from '../utils/helpers';

const Forecast = ({ forecast }) => {
  if (!forecast) return <div>Loading forecast...</div>;

  return (
    <div className="forecast">
      <h2>5-Day Forecast</h2>
      <div className="forecast-days">
        {forecast
          .filter((_, index) => index % 24 === 0)
          .slice(0, 5)
          .map((day, index) => (
            <div key={index} className="forecast-day">
              <div className="day">{formatDate(day.forecastTimeUtc)}</div>
              <div className="weather-icon">{getWeatherIcon(day.conditionCode)}</div>
              <div className="temp">{formatTemperature(day.airTemperature)}</div>
              <div className="condition">{day.conditionCode}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Forecast;