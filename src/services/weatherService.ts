import axios from 'axios';
import { WeatherData, Coordinates } from '../types/weather';

const OPENWEATHER_API_KEY = '38cc8d3d41822b67221d8af0317217a6';
const OPENCAGE_API_KEY = '010548a0d2c14d66913b0a0b90936b87';

export async function getCoordinates(location: string): Promise<Coordinates> {
  const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${OPENCAGE_API_KEY}&countrycode=in`);
  
  if (response.data.results.length === 0) {
    throw new Error('Location not found');
  }

  const { lat, lng: lon } = response.data.results[0].geometry;
  return { lat, lon };
}

export async function getWeatherData({ lat, lon }: Coordinates, location: string): Promise<WeatherData> {
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=te`
  );

  return {
    temperature: response.data.main.temp,
    weatherDesc: response.data.weather[0].description,
    humidity: response.data.main.humidity,
    windSpeed: response.data.wind.speed,
    location
  };
}