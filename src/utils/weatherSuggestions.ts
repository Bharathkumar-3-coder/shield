interface WeatherCondition {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherDesc: string;
}

export function getAgricultureSuggestions(weather: WeatherCondition): string {
  let suggestions: string[] = [];

  // Temperature based suggestions
  if (weather.temperature > 35) {
    suggestions.push('• అధిక ఉష్ణోగ్రత: పంటలకు నీటి తడి ఎక్కువగా ఇవ్వండి. ఉదయం, సాయంత్రం వేళల్లో నీరు పెట్టండి.');
    suggestions.push('• మధ్యాహ్నం వేళ పంటలపై నీటిని చల్లి తేమను కాపాడండి.');
  } else if (weather.temperature < 15) {
    suggestions.push('• తక్కువ ఉష్ణోగ్రత: రాత్రి వేళ పంటలను కప్పి ఉంచండి. ఉదయం పొగమంచు నుండి రక్షించండి.');
    suggestions.push('• చలి నుండి రక్షించడానికి పొలం చుట్టూ పొగ పెట్టండి.');
  }

  // Humidity based suggestions
  if (weather.humidity > 80) {
    suggestions.push('• అధిక తేమ: తెగుళ్ళ నివారణకు శ్రద్ధ వహించండి. గాలి ఆడేలా చూడండి.');
    suggestions.push('• బూజు పట్టకుండా జాగ్రత్తలు తీసుకోండి. తెగుళ్ళ మందులు చల్లండి.');
  } else if (weather.humidity < 30) {
    suggestions.push('• తక్కువ తేమ: నీటి తడి తరచుగా ఇవ్వండి. మల్చింగ్ వాడండి.');
    suggestions.push('• నేల తేమ కాపాడటానికి గడ్డి వేయండి.');
  }

  // Wind speed based suggestions
  if (weather.windSpeed > 20) {
    suggestions.push('• అధిక గాలులు: పంటలకు ఆధారాలు ఏర్పాటు చేయండి. స్ప్రేయింగ్ వాయిదా వేయండి.');
    suggestions.push('• పంటలు విరిగిపోకుండా దగ్గరగా కట్టివేయండి.');
  }

  // Weather description based suggestions
  if (weather.weatherDesc.includes('వర్షం') || weather.weatherDesc.includes('జల్లు')) {
    suggestions.push('• వర్షం: నీరు నిలవ కుండా కాలువలు శుభ్రం చేయండి.');
    suggestions.push('• పురుగు మందులు వేసి ఉంటే మళ్ళీ వేయండి.');
  } else if (weather.weatherDesc.includes('మేఘం') || weather.weatherDesc.includes('మబ్బు')) {
    suggestions.push('• మబ్బు వాతావరణం: పురుగు మందులు చల్లడానికి అనుకూలం.');
  } else if (weather.weatherDesc.includes('ఎండ') || weather.weatherDesc.includes('పొడి')) {
    suggestions.push('• ఎండ వాతావరణం: పంటలకు నీరు ఎక్కువగా అవసరం.');
    suggestions.push('• మధ్యాహ్నం వేళ పనులు తగ్గించండి.');
  }

  // General suggestions
  suggestions.push('• నేటి వాతావరణం ఆధారంగా పంట రక్షణ చర్యలు తీసుకోండి.');
  suggestions.push('• పంట పరిస్థితిని రోజూ పరిశీలించండి.');

  return suggestions.join('\n');
}