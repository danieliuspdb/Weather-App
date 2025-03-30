export const formatTemperature = (temp) => {
  return Math.round(temp);
};

export const formatWindSpeed = (speed) => {
  if (speed === null || speed === undefined) return 'N/A';
  return `${speed.toFixed(1)} m/s`;
};

export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  } catch {
    return 'Invalid date';
  }
};

export const getWeatherIcon = (conditionCode) => {
  if (!conditionCode) return '🌈';
  
  const icons = {
    'clear': '☀️',
    'partly-cloudy': '⛅',
    'cloudy-with-sunny-intervals': '🌤️',
    'cloudy': '☁️',
    'light-rain': '🌦️',
    'rain': '🌧️',
    'heavy-rain': '⛈️',
    'thunder': '⚡',
    'isolated-thunderstorms': '🌩️',
    'thunderstorms': '⛈️',
    'light-sleet': '🌨️',
    'sleet': '🌨️',
    'freezing-rain': '🌧️❄️',
    'hail': '🌨️',
    'light-snow': '❄️',
    'snow': '❄️☃️',
    'heavy-snow': '☃️❄️',
    'fog': '🌫️',
  };
  
  return icons[conditionCode] || '🌈';
};

export const formatHumidity = (humidity) => {
  if (humidity === null || humidity === undefined) return 'N/A';
  return `${Math.round(humidity)}%`;
};