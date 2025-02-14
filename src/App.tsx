import { useState, useEffect, useCallback } from 'react';
import { Cloud, Volume2 } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { getCoordinates, getWeatherData } from './services/weatherService';
import type { WeatherData } from './types/weather';
import { numberToTelugu } from './utils/teluguNumbers';
import { getAgricultureSuggestions } from './utils/weatherSuggestions'

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
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition({
    clearTranscriptOnListen: true
  });

  useEffect(() => {
    if (transcript) {
      handleLocationSubmit(transcript);
    }
  }, [transcript]);

  const handleLocationSubmit = useCallback(async (location: string) => {
    try {
      setError(null);
      const coordinates = await getCoordinates(location);
      const data = await getWeatherData(coordinates, location);
      setWeatherData(data);
      speakWeatherInfo(data);
    } catch (err) {
      setError('స్థలం కనుగొనబడలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.');
      console.error('Error fetching weather data:', err);
    }
  }, []);

  const startListening = useCallback(() => {
    try {
      if (!browserSupportsSpeechRecognition) {
        setError('మీ బ్రౌజర్ వాయిస్ ఇన్పుట్‌ను సపోర్ట్ చేయదు.');
        return;
      }
      setIsListening(true);
      resetTranscript();
      SpeechRecognition.startListening({ 
        language: 'te-IN',
        continuous: false
      });
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('వాయిస్ ఇన్పుట్ ప్రారంభించడంలో సమస్య. దయచేసి మళ్లీ ప్రయత్నించండి.');
    }
  }, [resetTranscript, browserSupportsSpeechRecognition]);

  const stopListening = useCallback(() => {
    try {
      setIsListening(false);
      SpeechRecognition.stopListening();
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
  }, []);

  const speakWeatherInfo = useCallback((data: WeatherData) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      const suggestions = getAgricultureSuggestions(data);
      const tempInTelugu = numberToTelugu(Math.round(data.temperature));
      const humidityInTelugu = numberToTelugu(Math.round(data.humidity));
      const windSpeedInTelugu = numberToTelugu(Math.round(data.windSpeed));
      const weatherDescriptionInTelugu = weatherDescriptionsTelugu[data.weatherDesc.toLowerCase()] || data.weatherDesc;

      const text = `
        ${data.location} వాతావరణ వివరాలు.
        ఉష్ణోగ్రత ${tempInTelugu} డిగ్రీల సెల్సియస్.
        వాతావరణం ${weatherDescriptionInTelugu}.
        తేమ ${humidityInTelugu} శాతం.
        గాలి వేగం ${windSpeedInTelugu} కిలోమీటర్లు పర్ గంట.

        రైతు సోదరులకు సూచనలు:
        ${suggestions}
      `;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'te-IN';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
      if ('speechSynthesis' in window) {
        window.speechSynthesis.speak(utterance);
      } else {
        setError('మీ బ్రౌజర్ వాయిస్ అవుట్‌పుట్‌ను సపోర్ట్ చేయదు.');
      }
    } catch (err) {
      console.error('Error in speech synthesis:', err);
      setError('వాయిస్ అవుట్‌పుట్‌లో సమస్య. దయచేసి మళ్లీ ప్రయత్నించండి.');
    }
  }, [isSpeaking]);

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
    className={`flex items-center justify-center w-16 h-16 rounded-full ${
      isListening ? 'bg-red-500' : 'bg-sky-500'
    } text-white hover:opacity-90 transition-opacity`}
  >
    <div className="mic-logo"></div>

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
            <div className="space-y-2">
              <p>🌡️ ఉష్ణోగ్రత: {Math.round(weatherData.temperature)}°C</p>
              <p>🌤️ వాతావరణం: {weatherDescriptionsTelugu[weatherData.weatherDesc.toLowerCase()] || weatherData.weatherDesc}</p>
              <p>💧 తేమ: {weatherData.humidity}%</p>
              <p>💨 గాలి వేగం: {weatherData.windSpeed} km/h</p>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">వ్యవసాయ సూచనలు:</h3>
              <div className="text-green-700 whitespace-pre-line">
                {getAgricultureSuggestions(weatherData)}
              </div>
            </div>

            <button
              onClick={() => weatherData && speakWeatherInfo(weatherData)}
              className={`mt-4 flex items-center gap-2 px-4 py-2 ${
                isSpeaking ? 'bg-red-500' : 'bg-green-500'
              } text-white rounded hover:opacity-90 transition-colors`}
            >
              <Volume2 className="w-5 h-5" />
              {isSpeaking ? 'ఆపండి' : 'మళ్ళీ వినండి'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
