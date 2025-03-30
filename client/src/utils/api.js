export const fetchCities = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/cities');
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    throw error;
  }
};

export const fetchWeather = async (cityCode) => {
  try {
    const response = await fetch(`http://localhost:5000/api/weather/${cityCode}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    throw error;
  }
};

export const logCitySelection = async (city) => {
  try {
    await fetch('http://localhost:5000/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        city: city.name, 
        timestamp: new Date().toISOString() 
      }),
    });
  } catch (error) {
    console.error('Failed to log city selection:', error);
  }
};