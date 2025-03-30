import React, { useState, useEffect } from 'react';
import { fetchCities, fetchWeather, logCitySelection } from './utils/api';
import CityDropdown from './components/CityDropdown';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import PopularCities from './components/PopularCities';
import useLocalStorage from './hooks/useLocalStorage';
import './styles/main.scss';

const App = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [availableCities, setAvailableCities] = useState([]);
  const [viewedCities, setViewedCities] = useLocalStorage('viewedCities', []);
  const [loading, setLoading] = useState({ cities: false, weather: false });
  const [error, setError] = useState({ cities: null, weather: null });

  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(prev => ({ ...prev, cities: true }));
        setError(prev => ({ ...prev, cities: null }));
        const cities = await fetchCities();
        setAvailableCities(cities);
      } catch (err) {
        setError(prev => ({ ...prev, cities: err.message || 'Failed to load cities' }));
        console.error('Cities load error:', err);
      } finally {
        setLoading(prev => ({ ...prev, cities: false }));
      }
    };
    loadCities();
  }, []);

  const processWeatherData = (apiData) => {
    if (!apiData) throw new Error('No data received');
    
    if (typeof apiData === 'object' && !Array.isArray(apiData)) {
      return apiData;
    }
    
    throw new Error('Unsupported data format');
  };

  useEffect(() => {
    if (selectedCity) {
      const loadWeatherData = async () => {
        try {
          setLoading(prev => ({ ...prev, weather: true }));
          setError(prev => ({ ...prev, weather: null }));
          
          const rawData = await fetchWeather(selectedCity.code);
          const processedData = processWeatherData(rawData);
          
          setForecastData(processedData);
          
          const firstDate = Object.keys(processedData)[0];
          if (firstDate) {
            const firstHour = Object.keys(processedData[firstDate])[0];
            if (firstHour) {
              setCurrentWeather({
                airTemperature: processedData[firstDate][firstHour].temperature,
                conditionCode: processedData[firstDate][firstHour].condition,
                windSpeed: processedData[firstDate][firstHour].windSpeed,
                relativeHumidity: processedData[firstDate][firstHour].humidity || 0
              });
            }
          }

          setViewedCities(prevViewedCities => {
            const existingCityIndex = prevViewedCities.findIndex(city => city.code === selectedCity.code);
            
            let updatedViewedCities;
            if (existingCityIndex >= 0) {
              updatedViewedCities = [...prevViewedCities];
              updatedViewedCities[existingCityIndex] = {
                ...updatedViewedCities[existingCityIndex],
                views: (updatedViewedCities[existingCityIndex].views || 0) + 1,
                lastViewed: new Date().toISOString()
              };
            } else {
              updatedViewedCities = [
                ...prevViewedCities,
                {
                  ...selectedCity,
                  views: 1,
                  lastViewed: new Date().toISOString()
                }
              ];
            }
            
            return updatedViewedCities.sort((a, b) => b.views - a.views);
          });

          await logCitySelection(selectedCity);
        } catch (err) {
          setError(prev => ({ ...prev, weather: err.message || 'Failed to load weather data' }));
          console.error('Weather load error:', {
            error: err,
            city: selectedCity,
            time: new Date().toISOString()
          });
        } finally {
          setLoading(prev => ({ ...prev, weather: false }));
        }
      };

      loadWeatherData();
    }
  }, [selectedCity]);

  const getTopThreeCities = () => {
    return viewedCities.slice(0, 3);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Weather Forecast</h1>
      </header>
      
      <main>
        <div className="search-section">
          <CityDropdown 
            cities={availableCities}
            onSelect={setSelectedCity}
            loading={loading.cities}
            error={error.cities}
          />
          
          {viewedCities.length > 0 && (
            <PopularCities 
              cities={getTopThreeCities()} 
              onSelect={setSelectedCity} 
            />
          )}
        </div>

        {loading.weather && (
          <div className="loading">Loading weather data...</div>
        )}

        {error.weather && (
          <div className="error">
            <p>{error.weather}</p>
            <button 
              onClick={() => setSelectedCity({ ...selectedCity })}
              className="retry-btn"
            >
              Retry
            </button>
          </div>
        )}

        {selectedCity && !loading.weather && !error.weather && (
          <>
            {currentWeather && (
              <CurrentWeather 
                weather={currentWeather} 
                cityName={selectedCity.name} 
              />
            )}
            
            {forecastData && (
                <HourlyForecast 
                forecastData={forecastData} 
                cityName={selectedCity.name}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;