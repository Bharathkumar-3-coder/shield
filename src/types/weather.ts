export interface WeatherData {
  temperature: number;
  weatherDesc: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

export interface Coordinates {
  lat: number;
  lon: number;
}