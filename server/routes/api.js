const axios = require('axios');
const express = require('express');
const router = express.Router();

const fetchFromAPI = async (url) => {
  const MAX_RETRIES = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'User-Agent': 'WeatherApp/1.0'
        }
      });
      return response.data;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  throw lastError;
};

router.get('/cities', async (req, res) => {
  try {
    const cities = await fetchFromAPI('https://api.meteo.lt/v1/places');
    res.json(cities);
  } catch (error) {
    console.error('Meteo.lt API failed:', {
      message: error.message,
      code: error.code,
      url: error.config?.url
    });
    
    res.status(502).json({
      error: 'Weather service unavailable',
      details: {
        status: error.response?.status || 'No response',
        attemptedRetries: MAX_RETRIES,
        lastAttempt: new Date().toISOString()
      },
      suggestion: 'Try again in a few minutes'
    });
  }
});

router.get('/weather/:cityCode', async (req, res) => {
  try {
    const { cityCode } = req.params;
    const weatherData = await fetchFromAPI(
      `https://api.meteo.lt/v1/places/${cityCode}/forecasts/long-term`
    );

    const sortedForecasts = weatherData.forecastTimestamps.sort((a, b) => 
      new Date(a.forecastTimeUtc) - new Date(b.forecastTimeUtc)
    );

    const hourlyForecasts = {};
    const hoursToKeep = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

    sortedForecasts.forEach(forecast => {
      const [date, time] = forecast.forecastTimeUtc.split(' ');
      let [hour, minutes] = time.split(':').map(Number);
      
      hour = (hour + 3 + 24) % 24;
    
      const adjustedHour = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      if (!hoursToKeep.includes(adjustedHour)) return;
    
      let targetDate = date;
      if (time.startsWith('21:') && adjustedHour === '00:00') {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        targetDate = nextDate.toISOString().split('T')[0];
      }
      
      if (!hourlyForecasts[targetDate]) {
        hourlyForecasts[targetDate] = {};
      }
            
      hourlyForecasts[targetDate][adjustedHour] = {
        temperature: forecast.airTemperature,
        windSpeed: forecast.windSpeed,
        cloudCover: forecast.cloudCover,
        condition: forecast.conditionCode
      };
    });
    

    res.json(hourlyForecasts);
  } catch (error) {
    console.error('Weather API failed:', {
      cityCode: req.params.cityCode,
      error: error.message,
      status: error.response?.status
    });

    if (error.response?.status === 404) {
      res.status(404).json({ error: 'City not found in weather service' });
    } else {
      res.status(502).json({
        error: 'Failed to fetch weather data',
        details: error.message,
        attemptedRetries: MAX_RETRIES
      });
    }
  }
});

router.post('/logs', async (req, res) => {
  try {
    const { city, timestamp } = req.body;
    console.log(`City selected: ${city} at ${timestamp}`);
    res.status(200).json({ message: 'Logged successfully' });
  } catch (error) {
    console.error('Logging error:', error);
    res.status(500).json({ error: 'Failed to log selection' });
  }
});

router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Meteo.lt Proxy'
  });
});

module.exports = router;