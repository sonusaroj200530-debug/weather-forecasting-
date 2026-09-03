import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { fetchWeatherData, searchCities } from './server/weatherService.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-safe Gemini initialization
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// 2. City Geocoding Search
app.get('/api/weather/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.json([]);
      return;
    }
    const results = await searchCities(query);
    res.json(results);
  } catch (err: any) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Failed to search cities' });
  }
});

// 3. Current Weather & Forecast & Alerts
app.get('/api/weather/current', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 40.7128;
    const lon = parseFloat(req.query.lon as string) || -74.006;
    const city = (req.query.city as string) || 'New York';
    const country = (req.query.country as string) || 'United States';

    const data = await fetchWeatherData(lat, lon, city, country);
    res.json(data);
  } catch (err: any) {
    console.error('Weather fetch error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch weather data' });
  }
});

// 4. Conversational AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, cityContext, history } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Determine target location: check if user asked about a specific city
    let targetCity = cityContext?.name || 'New York';
    let targetLat = cityContext?.lat ?? 40.7128;
    let targetLon = cityContext?.lon ?? -74.006;
    let targetCountry = cityContext?.country || '';

    // Extract potential city name if user asked e.g. "Weather in Paris" or "Tokyo forecast"
    const cityMatch = message.match(/(?:in|for|at|around)\s+([A-Za-z\s]{3,25})(?:\?|\.|\s+tomorrow|\s+today|\s+this|$)/i);
    let updatedWeatherData = null;

    if (cityMatch && cityMatch[1]) {
      const detectedCity = cityMatch[1].trim();
      const searchResults = await searchCities(detectedCity);
      if (searchResults && searchResults.length > 0) {
        targetCity = searchResults[0].name;
        targetLat = searchResults[0].latitude;
        targetLon = searchResults[0].longitude;
        targetCountry = searchResults[0].country;
      }
    }

    // Fetch latest live weather data for the location
    let weatherData = null;
    try {
      weatherData = await fetchWeatherData(targetLat, targetLon, targetCity, targetCountry);
      updatedWeatherData = weatherData;
    } catch (err) {
      console.warn('Could not fetch live weather for chat context:', err);
    }

    const ai = getGeminiClient();

    if (ai) {
      // Formulate prompt with live meteorological facts
      const weatherFacts = weatherData
        ? `
CURRENT LIVE CONDITIONS FOR ${weatherData.city}, ${weatherData.country}:
- Temperature: ${weatherData.current.temperature}°C (Feels like: ${weatherData.current.apparentTemperature}°C)
- Sky / Conditions: ${weatherData.current.weatherDescription}
- Humidity: ${weatherData.current.humidity}%, Wind: ${weatherData.current.windSpeed} km/h (direction ${weatherData.current.windDirection}°)
- Air Quality (US AQI): ${weatherData.airQuality.usAqi} (${weatherData.airQuality.category}) - ${weatherData.airQuality.advice}
- Active Alerts: ${weatherData.alerts.length > 0 ? weatherData.alerts.map(a => `[${a.severity.toUpperCase()}] ${a.title}: ${a.description} Instruction: ${a.instruction}`).join('; ') : 'No severe alerts active'}
- 7-Day Forecast Highlights:
${weatherData.daily.slice(0, 5).map(d => `  * ${d.date}: High ${d.tempMax}°C, Low ${d.tempMin}°C, ${d.weatherDescription}, Precip chance: ${d.precipProb}%`).join('\n')}
- Climate Zone: ${weatherData.climate?.climateZone || 'Temperate'}
- Climate Historic Trend: ${weatherData.climate?.historicTrend || ''}
`
        : 'Live weather data temporarily unavailable.';

      const conversationHistory = (history || []).slice(-6).map((h: any) => `${h.sender === 'user' ? 'User' : 'AtmosphereAI'}: ${h.text}`).join('\n');

      const systemInstruction = `You are AtmosphereAI, an elite conversational weather forecasting, severe alert, and climate intelligence assistant.
Your job is to provide accurate, helpful, friendly, and scientifically grounded answers about weather forecasts, radar interpretations, severe weather alerts & safety, air quality, outdoor planning, and long-term climate trends.
- Base your answers on the verified LIVE METEOROLOGICAL DATA provided below.
- If there are severe weather alerts, prominently advise on precautions and safety.
- Format responses cleanly with brief bullet points or paragraphs, bold temperatures, and friendly conversational tone.
- When asked about climate change or historical patterns, explain with atmospheric science principles (Köppen classifications, atmospheric pressure cells, jet streams, greenhouse warming, El Niño/La Niña).
- At the very end of your response, on a new line, provide 3 short, relevant follow-up questions formatted strictly as:
FOLLOW_UPS: ["question 1", "question 2", "question 3"]`;

      const prompt = `${weatherFacts}

Conversation Context:
${conversationHistory}
User: ${message}

Provide your conversational response now:`;

      let fullText = '';
      try {
        // Try gemini-3.8-flash first
        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        fullText = geminiResponse.text || '';
      } catch (gemini38Err: any) {
        console.warn('gemini-3.8-flash busy, falling back to gemini-3.1-flash-lite:', gemini38Err?.message || gemini38Err);
        try {
          const geminiLiteResponse = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
          fullText = geminiLiteResponse.text || '';
        } catch (liteErr: any) {
          console.warn('gemini-3.1-flash-lite also unavailable, falling back to meteorological synthesis:', liteErr?.message || liteErr);
        }
      }

      if (fullText) {
        let replyText = fullText;
        let followUps: string[] = [
          `What is the 7-day outlook for ${targetCity}?`,
          `Are there any storm or heat alerts in ${targetCity}?`,
          `Tell me about ${targetCity}'s seasonal climate patterns.`,
        ];

        const followUpMatch = fullText.match(/FOLLOW_UPS:\s*(\[.*?\])/s);
        if (followUpMatch && followUpMatch[1]) {
          try {
            followUps = JSON.parse(followUpMatch[1]);
            replyText = fullText.replace(/FOLLOW_UPS:\s*\[.*?\]/s, '').trim();
          } catch {
            // keep defaults
          }
        }

        res.json({
          reply: replyText,
          weatherData: updatedWeatherData,
          followUps,
        });
        return;
      }
    }

    // Fallback meteorological synthesis if Gemini calls were unavailable or key not set
    const curr = weatherData?.current;
    const aqi = weatherData?.airQuality;
    const alerts = weatherData?.alerts || [];

    let fallbackReply = `Here is the current meteorological analysis for **${targetCity}**:\n\n` +
      `• **Current Conditions:** ${curr?.weatherDescription || 'Fair'}, **${curr?.temperature ?? 20}°C** (Feels like **${curr?.apparentTemperature ?? 20}°C**)\n` +
      `• **Wind & Humidity:** Wind ${Math.round(curr?.windSpeed ?? 0)} km/h, Humidity ${curr?.humidity ?? 50}%, Pressure ${Math.round(curr?.pressure ?? 1013)} hPa\n` +
      `• **Air Quality Index:** US AQI **${aqi?.usAqi ?? 40}** (${aqi?.category ?? 'Good'}) — ${aqi?.advice ?? 'Safe for outdoor activities'}\n\n`;

    if (alerts.length > 0) {
      fallbackReply += `⚠️ **Active Meteorological Alerts:**\n` +
        alerts.map(a => `**${a.title}** (${a.severity.toUpperCase()}): ${a.description}\n*Safety Precaution:* ${a.instruction}`).join('\n\n') + '\n\n';
    } else {
      fallbackReply += `✅ **No severe weather alerts active** at this time for this area.\n\n`;
    }

    if (weatherData?.daily && weatherData.daily.length > 0) {
      fallbackReply += `📅 **7-Day Forecast Highlights:**\n` +
        weatherData.daily.slice(0, 4).map(d => `• **${d.date}:** High **${d.tempMax}°C** / Low **${d.tempMin}°C**, ${d.weatherDescription} (${d.precipProb}% precip chance)`).join('\n') +
        `\n\n`;
    }

    if (weatherData?.climate) {
      fallbackReply += `🌍 **Climate Context:** ${weatherData.climate.climateZone}. ${weatherData.climate.annualProfile}`;
    }

    res.json({
      reply: fallbackReply,
      weatherData: updatedWeatherData,
      followUps: [
        `What is the 7-day outlook for ${targetCity}?`,
        `Check severe storm or heat alerts in ${targetCity}`,
        `Analyze ${targetCity}'s long-term climate trends`,
      ],
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process chat conversation' });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AtmosphereAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
