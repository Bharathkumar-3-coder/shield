import { useState, useEffect, useCallback } from 'react';
import { Cloud, Volume2 } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { getCoordinates, getWeatherData } from './services/weatherService';
import type { WeatherData } from './types/weather';
import { numberToTelugu } from './utils/teluguNumbers';
import { getAgricultureSuggestions } from './utils/weatherSuggestions';

const weatherDescriptionsTelugu: { [key: string]: string } = {
  "clear sky": "పారదర్శక ఆకాశం",
  "few clouds": "కొన్ని మేఘాలు",
  "scattered clouds": "చిన్న చిన్న మేఘాలు",
  "broken clouds": "పగిలిన మేఘాలు",
  "shower rain": "తీవ్ర వర్షం",
  "rain": "వర్షం",
  "thunderstorm": "ఇరుపులు మేఘాలు",
  "snow": "మంచు",
  "mist": "మబ్బు"
};

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [agricultureTips, setAgricultureTips] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition({
    clearTranscriptOnListen: true
  });

   useEffect(() => {
    if (transcript) {
      stopListening();
      handleLocationSubmit(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.speechSynthesis.cancel(); // Stop voice when tab is inactive
        setIsSpeaking(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleLocationSubmit = useCallback(async (location: string) => {
    try {
      setError(null);
      setAgricultureTips(null); // Reset previous tips
      const coordinates = await getCoordinates(location);
      const data = await getWeatherData(coordinates, location);
      if (!data) {
        throw new Error('Weather data not found');
      }
      setWeatherData(data);

      const suggestions = getAgricultureSuggestions(data) || "రైతులకు ప్రత్యేక సూచనలు లేవు.";
      console.log("Agriculture Tips Retrieved:", suggestions); // Debugging Log
      setAgricultureTips(suggestions);

      speakWeatherInfo(data, suggestions);
    } catch (err) {
      setError('స్థలం కనబడలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.');
      console.error('Error fetching weather data:', err);
      speakErrorMessage(); // Speak error message
    }
  }, []);

  const startListening = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      setError('మీ బ్రౌజర్ వాయిస్ ఇన్పుట్‌ను సపోర్ట్ చేయదు.');
      return;
    }
    setIsListening(true);
    resetTranscript();
    SpeechRecognition.startListening({ language: 'te-IN', continuous: false });
  }, [resetTranscript, browserSupportsSpeechRecognition]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    SpeechRecognition.stopListening();
  }, []);

  const speakWeatherInfo = useCallback((data: WeatherData, tips: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous speech before starting new one
    } else {
      setError('మీ బ్రౌజర్ వాయిస్ అవుట్‌పుట్‌ను సపోర్ట్ చేయదు.');
      return;
    }

    try {
      // Only include the city name if weather data is available
      const locationText = data.location ? `${data.location} వాతావరణ వివరాలు.` : '';

      const tempInTelugu = numberToTelugu(Math.round(data.temperature));
      const humidityInTelugu = numberToTelugu(Math.round(data.humidity));
      const windSpeedInTelugu = numberToTelugu(Math.round(data.windSpeed));
      const weatherDescriptionInTelugu =
        weatherDescriptionsTelugu[data.weatherDesc.toLowerCase()] || data.weatherDesc;

      const text = `
        ${locationText}
        ఉష్ణోగ్రత ${tempInTelugu} డిగ్రీల సెల్సియస్.
        వాతావరణం ${weatherDescriptionInTelugu}.
        తేమ ${humidityInTelugu} శాతం.
        గాలి వేగం ${windSpeedInTelugu} కిలోమీటర్లు పర్ గంట.

        రైతు సోదరులకు సూచనలు:
        ${tips}
      `;

      console.log("Speaking Text:", text); // Debugging Log

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'te-IN';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Error in speech synthesis:', err);
      setError('వాయిస్ అవుట్‌పుట్‌లో సమస్య. దయచేసి మళ్లీ ప్రయత్నించండి.');
    }
  }, []);

  const speakErrorMessage = useCallback(() => {
    if ('speechSynthesis' in window) {
      const errorMessage = new SpeechSynthesisUtterance('స్థలం కనబడలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.');
      errorMessage.lang = 'te-IN';
      window.speechSynthesis.speak(errorMessage);
    }
  }, []);

  return (
    <div className="min-h-screen bg-cover bg-center p-4" style={{ backgroundImage: `url('https://t4.ftcdn.net/jpg/09/47/19/71/360_F_947197189_OmyKmvXf25RlHFODviXKNL1zddUMFIaN.jpg')` }}>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-8">
          <Cloud className="w-16 h-16 text-sky-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">రైతుల వాతావరణ సమాచారం</h1>
          <p className="text-gray-600 mt-2">మీ ప్రాంతం పేరు చెప్పండి</p>
        </div>
        <div className="flex justify-center mb-6">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex items-center justify-center w-16 h-16 rounded-full ${isListening ? 'bg-red-500' : 'bg-sky-500'} text-white hover:opacity-90 transition-opacity`}
          >
            <span className="text-2xl font-bold">S</span>
          </button>
        </div>
        {transcript && (
          <div className="text-center mb-4 text-gray-700">
            మీరు చెప్పింది: {transcript}
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 mb-4">
            {error}
          </div>
        )}
        {weatherData && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">{weatherData.location} వాతావరణం</h2>
            <p>🌡️ ఉష్ణోగ్రత: {Math.round(weatherData.temperature)}°C</p>
            <p>🌤️ వాతావరణం: {weatherDescriptionsTelugu[weatherData.weatherDesc.toLowerCase()] || weatherData.weatherDesc}</p>
            <p>💧 తేమ: {weatherData.humidity}%</p>
            <p>💨 గాలి వేగం: {weatherData.windSpeed} km/h</p>
            
            {agricultureTips && (
              <div className="mt-4 p-2 bg-green-100 rounded-lg">
                <h3 className="text-lg font-semibold">🌾 రైతుల సూచనలు:</h3>
                <p>{agricultureTips}</p>
              </div>
            )}

            <button 
              onClick={() => speakWeatherInfo(weatherData, agricultureTips || "రైతులకు సూచనలు లేవు.")}
              className="mt-4 bg-green-500 text-white py-2 px-4 rounded-full flex items-center justify-center hover:bg-green-600 transition"
            >
              <Volume2 className="mr-2" /> మళ్లీ వినండి
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
