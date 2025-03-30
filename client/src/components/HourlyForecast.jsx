import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatTemperature, formatWindSpeed } from '../utils/helpers';

const CLOUD_COVER_EMOJIS = {
  0: '☀️',    // Clear
  1: '🌤️',    // Mostly sunny
  2: '⛅',     // Partly cloudy
  3: '🌥️',    // Mostly cloudy
  4: '☁️',     // Overcast
  default: '🌫️' // Unknown
};

const getCloudCoverEmoji = (coverage) => {
  const coverageLevel = Math.min(4, Math.floor(coverage / 25));
  return CLOUD_COVER_EMOJIS[coverageLevel] || CLOUD_COVER_EMOJIS.default;
};

const HourlyForecast = ({ forecastData, cityName }) => {
  useEffect(() => {
    if (forecastData) {
      console.log('Full forecast data:', forecastData);
      
      const firstDate = Object.keys(forecastData)[0];
      if (firstDate) {
        console.log(`Hours for ${firstDate}:`, Object.keys(forecastData[firstDate]));
      }
    }
  }, [forecastData]);

  if (!forecastData) return <div className="loading">Loading forecast...</div>;

  const dates = Object.keys(forecastData).sort();
  
  const displayHours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
  
  const actualHours = dates.length > 0 ? Object.keys(forecastData[dates[0]] || {}).sort() : [];
  
  console.log('Display hours:', displayHours);
  console.log('Actual hours in data:', actualHours);
  
  const timeShift = 3;
  
  const getHourData = (date, displayHour) => {
    if (!forecastData[date]) return null;
    
    if (forecastData[date][displayHour]) {
      return forecastData[date][displayHour];
    }
    
    const [hours, minutes] = displayHour.split(':');
    const shiftedHours = (parseInt(hours) - timeShift) % 24;
    const shiftedHour = `${shiftedHours.toString().padStart(2, '0')}:${minutes}`;
    
    if (forecastData[date][shiftedHour]) {
      console.log(`Found shifted match: ${displayHour} → ${shiftedHour}`);
      return forecastData[date][shiftedHour];
    }
    
    return null;
  };
  
  const formatDisplayTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}${minutes !== '00' ? `:${minutes}` : ''} ${ampm}`;
  };

  return (
    <div className="hourly-forecast">
      <div className="location-header">
        <h2>Hourly Forecast for {cityName}</h2>
      </div>

      <div className="forecast-grid">
        <div className="grid-row header">
          <div className="grid-cell time-label">Time →</div>
          {displayHours.map(hour => (
            <div key={hour} className="grid-cell hour-header">
              {formatDisplayTime(hour)}
            </div>
          ))}
        </div>

        {dates.slice(0, 5).map(date => (
          <div key={date} className="grid-row">
            <div className="grid-cell date-label">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            
            {displayHours.map(displayHour => {
              const hourData = getHourData(date, displayHour);
              
              return hourData ? (
                <div key={`${date}-${displayHour}`} className="grid-cell">
                  <div className="weather-detail temperature">
                    {formatTemperature(hourData.temperature)}°C
                  </div>
                  <div className="weather-detail wind">
                    {formatWindSpeed(hourData.windSpeed)}
                  </div>
                  <div className="weather-detail clouds">
                    {getCloudCoverEmoji(hourData.cloudCover)} 
                    <span className="cloud-percent">
                      {hourData.cloudCover}%
                    </span>
                  </div>
                </div>
              ) : (
                <div key={`${date}-${displayHour}`} className="grid-cell empty">
                  -
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

HourlyForecast.propTypes = {
  forecastData: PropTypes.object.isRequired,
  cityName: PropTypes.string.isRequired
};

export default HourlyForecast;