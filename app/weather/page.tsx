"use client";

import { useEffect, useState } from "react";

interface Weather {
  name: string;
  coord: { lat: number; lon: number };
  sys: { country: string; sunrise: number; sunset: number };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  weather: { id: number; main: string; description: string; icon: string }[];
  wind: { speed: number; deg: number };
  visibility: number;
  clouds: { all: number };
  dt: number;
}

interface ForecastItem {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number; humidity: number };
  weather: { main: string; description: string; icon: string }[];
  wind: { speed: number };
  pop: number;
}

interface ForecastDay {
  date: string;
  label: string;
  icon: string;
  condition: string;
  temp_min: number;
  temp_max: number;
  humidity: number;
  wind: number;
  pop: number;
  description: string;
}

interface AirQuality {
  aqi: number;
  components: {
    co: number; no: number; no2: number; o3: number;
    so2: number; pm2_5: number; pm10: number; nh3: number;
  };
}

const AQI_LABELS: Record<number, { label: string; color: string; bg: string; bar: string }> = {
  1: { label: "Good",      color: "text-emerald-300", bg: "bg-emerald-500/20 border-emerald-500/30", bar: "bg-emerald-400" },
  2: { label: "Fair",      color: "text-yellow-300",  bg: "bg-yellow-500/20 border-yellow-500/30",  bar: "bg-yellow-400" },
  3: { label: "Moderate",  color: "text-orange-300",  bg: "bg-orange-500/20 border-orange-500/30",  bar: "bg-orange-400" },
  4: { label: "Poor",      color: "text-red-300",     bg: "bg-red-500/20 border-red-500/30",        bar: "bg-red-400" },
  5: { label: "Very Poor", color: "text-purple-300",  bg: "bg-purple-500/20 border-purple-500/30",  bar: "bg-purple-400" },
};

const POLLUTANT_THRESHOLDS: Record<string, { levels: number[]; danger: string }> = {
  pm2_5: { levels: [5,   15,  25,  50],    danger: "Most dangerous — enters bloodstream" },
  pm10:  { levels: [15,  45,  75,  150],   danger: "Causes respiratory inflammation" },
  o3:    { levels: [60,  100, 140, 180],   danger: "Worsens asthma, chest pain" },
  no2:   { levels: [10,  25,  50,  100],   danger: "Traffic pollution, lung damage" },
  so2:   { levels: [20,  40,  125, 350],   danger: "Irritates airways, acid rain" },
  co:    { levels: [200, 400, 1000, 2000], danger: "Reduces oxygen in blood" },
  nh3:   { levels: [1,   30,  60,  100],   danger: "Eye & respiratory irritant" },
  no:    { levels: [5,   25,  50,  100],   danger: "Precursor to NO2 and ozone" },
};

function getPollutantLevel(key: string, value: number) {
  const t = POLLUTANT_THRESHOLDS[key];
  if (!t) return { color: "text-white/60", bg: "bg-white/10", label: "—", danger: "" };
  const [g, f, m, p] = t.levels;
  if (value <= g) return { color: "text-emerald-300", bg: "bg-emerald-500/15",  label: "Good",      danger: t.danger };
  if (value <= f) return { color: "text-yellow-300",  bg: "bg-yellow-500/15",   label: "Fair",      danger: t.danger };
  if (value <= m) return { color: "text-orange-300",  bg: "bg-orange-500/15",   label: "Moderate",  danger: t.danger };
  if (value <= p) return { color: "text-red-300",     bg: "bg-red-500/15",      label: "Poor",      danger: t.danger };
  return           { color: "text-purple-300",        bg: "bg-purple-500/15",   label: "Very Poor", danger: t.danger };
}

const WEATHER_BACKGROUNDS: Record<string, string> = {
  Clear: "from-[#0f2027] via-[#203a43] to-[#2c5364]",
  Clouds: "from-[#141e30] via-[#243b55] to-[#374a5e]",
  Rain: "from-[#0d0d0d] via-[#1a1a2e] to-[#16213e]",
  Drizzle: "from-[#0d0d0d] via-[#1a1a2e] to-[#16213e]",
  Thunderstorm: "from-[#0f0c29] via-[#302b63] to-[#24243e]",
  Snow: "from-[#1a1a2e] via-[#2d3561] to-[#4a5472]",
  Mist: "from-[#232526] via-[#414345] to-[#525c65]",
  Fog: "from-[#232526] via-[#414345] to-[#525c65]",
  Haze: "from-[#232526] via-[#414345] to-[#525c65]",
};

const WEATHER_EMOJI: Record<string, string> = {
  Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
  Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Fog: "🌫️", Haze: "🌫️",
};

const PRESET_CITIES = ["Mantova", "Kyiv", "Kelmentsi", "Paris", "Roma", "Verona", "Manerba del Garda", "Florence"];

function formatTime(unix: number) {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function windDirection(deg: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function groupForecastByDay(list: ForecastItem[]): ForecastDay[] {
  const days: Record<string, ForecastItem[]> = {};
  list.forEach((item) => {
    const key = new Date(item.dt * 1000).toISOString().split("T")[0];
    if (!days[key]) days[key] = [];
    days[key].push(item);
  });
  return Object.entries(days).slice(0, 5).map(([key, items]) => {
    const temps = items.map((i) => i.main.temp);
    const midday = items.find((i) => new Date(i.dt * 1000).getHours() >= 12) ?? items[Math.floor(items.length / 2)];
    const label = new Date(key + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return {
      date: key, label,
      icon: midday.weather[0].icon,
      condition: midday.weather[0].main,
      description: midday.weather[0].description,
      temp_min: Math.round(Math.min(...temps)),
      temp_max: Math.round(Math.max(...temps)),
      humidity: Math.round(items.reduce((s, i) => s + i.main.humidity, 0) / items.length),
      wind: Math.round(items.reduce((s, i) => s + i.wind.speed, 0) / items.length),
      pop: Math.round(Math.max(...items.map((i) => i.pop)) * 100),
    };
  });
}

// ── API helpers — all calls go through /api/weather ──────────────────────────
async function apiFetch(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/weather?${qs}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

export default function OpenWeather() {
  const [weather, setWeather]       = useState<Weather | null>(null);
  const [forecast, setForecast]     = useState<ForecastDay[]>([]);
  const [airQuality, setAirQuality] = useState<AirQuality | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [city, setCity]             = useState("Mantova");
  const [input, setInput]           = useState("");
  const [unit, setUnit]             = useState<"metric" | "imperial">("metric");
  const [visible, setVisible]       = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  const fetchWeather = async (cityName: string, units: "metric" | "imperial") => {
    setLoading(true);
    setError(null);
    setVisible(false);
    setAirQuality(null);
    try {
      const [currentData, forecastData] = await Promise.all([
        apiFetch({ type: "weather",  city: cityName, units }),
        apiFetch({ type: "forecast", city: cityName, units }),
      ]);

      setWeather(currentData);
      setForecast(groupForecastByDay(forecastData.list));
      setSelectedDay(0);

      const { lat, lon } = currentData.coord;
      try {
        const airData = await apiFetch({ type: "air", lat: String(lat), lon: String(lon) });
        const item = airData.list?.[0];
        if (item) setAirQuality({ aqi: item.main.aqi, components: item.components });
      } catch {
        // air quality failure is non-fatal
      }

      setTimeout(() => setVisible(true), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather(city, unit); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setCity(input.trim());
    fetchWeather(input.trim(), unit);
    setInput("");
  };

  const toggleUnit = () => {
    const next = unit === "metric" ? "imperial" : "metric";
    setUnit(next);
    fetchWeather(city, next);
  };

  const condition  = weather?.weather[0]?.main ?? "Clear";
  const bg         = WEATHER_BACKGROUNDS[condition] ?? WEATHER_BACKGROUNDS.Clear;
  const emoji      = WEATHER_EMOJI[condition] ?? "🌡️";
  const unitSymbol = unit === "metric" ? "°C" : "°F";
  const speedUnit  = unit === "metric" ? "m/s" : "mph";
  const activeForecast = forecast[selectedDay];
  const aqiInfo    = airQuality ? AQI_LABELS[airQuality.aqi] : null;

  return (
    <main className={`min-h-screen bg-gradient-to-br ${bg} text-white font-sans transition-all duration-700`}>
      <div className="max-w-2xl mx-auto px-5 py-12 flex flex-col gap-6">

        {/* Preset city chips */}
        <div className="flex flex-wrap gap-2">
          {PRESET_CITIES.map((c) => (
            <button key={c} type="button"
              onClick={() => { setCity(c); fetchWeather(c, unit); }}
              className={`px-4 py-1.5 rounded-full font-mono text-xs tracking-wide border transition-all cursor-pointer ${
                city === c
                  ? "bg-white/30 border-white/50 text-white font-bold"
                  : "bg-white/10 border-white/20 text-white/60 hover:bg-white/20 hover:text-white"
              }`}
            >{c}</button>
          ))}
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Search any city…"
            className="flex-1 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 font-mono text-sm focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/10 transition-all"
          />
          <button type="submit" className="bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl px-5 py-3 font-mono text-sm transition-colors">Search</button>
          <button type="button" onClick={toggleUnit} className="bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl px-4 py-3 font-mono text-sm transition-colors">
            {unit === "metric" ? "°F" : "°C"}
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            <p className="font-mono text-xs text-white/40 tracking-widest uppercase">Fetching weather…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-4xl">⚠️</span>
            <p className="font-mono text-sm text-white/60">{error}</p>
            <button onClick={() => fetchWeather(city, unit)} className="border border-white/30 text-white/70 font-mono text-xs tracking-widest uppercase px-5 py-2 rounded-lg hover:bg-white/10 transition-colors">Retry</button>
          </div>
        )}

        {!loading && !error && weather && (
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
            className="flex flex-col gap-4">

            {/* Current weather */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-7">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    {weather.name}
                    <span className="ml-2 text-lg font-normal text-white/50">{weather.sys.country}</span>
                  </h2>
                  <p className="text-white/50 font-mono text-xs tracking-widest uppercase mt-1">
                    {new Date(weather.dt * 1000).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                </div>
                <span className="text-5xl">{emoji}</span>
              </div>
              <div className="mt-6 flex items-end gap-4">
                <span className="text-8xl font-thin leading-none">{Math.round(weather.main.temp)}</span>
                <div className="mb-2">
                  <span className="text-3xl font-light text-white/70">{unitSymbol}</span>
                  <p className="text-white/50 text-sm mt-1 capitalize">{weather.weather[0].description}</p>
                  <p className="text-white/40 text-xs font-mono mt-0.5">Feels like {Math.round(weather.main.feels_like)}{unitSymbol}</p>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <span className="text-sm text-white/60 font-mono">↑ {Math.round(weather.main.temp_max)}{unitSymbol}</span>
                <span className="text-sm text-white/60 font-mono">↓ {Math.round(weather.main.temp_min)}{unitSymbol}</span>
              </div>
            </div>

            {/* Air Quality */}
            {airQuality && aqiInfo && (
              <div className={`border rounded-2xl p-5 ${aqiInfo.bg}`}>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-white/40">🌬️ Air Quality Index</p>
                  <span className={`font-bold text-sm px-3 py-1 rounded-full bg-white/10 ${aqiInfo.color}`}>{aqiInfo.label}</span>
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${aqiInfo.bar}`} style={{ width: `${(airQuality.aqi / 5) * 100}%` }} />
                  </div>
                  <span className={`font-black text-xl ${aqiInfo.color}`}>{airQuality.aqi}<span className="text-white/30 font-normal text-xs">/5</span></span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: "pm2_5", label: "PM2.5", value: airQuality.components.pm2_5, priority: true },
                    { key: "pm10",  label: "PM10",  value: airQuality.components.pm10,  priority: true },
                    { key: "o3",    label: "O₃",    value: airQuality.components.o3,    priority: true },
                    { key: "no2",   label: "NO₂",   value: airQuality.components.no2,   priority: true },
                    { key: "so2",   label: "SO₂",   value: airQuality.components.so2,   priority: false },
                    { key: "co",    label: "CO",    value: airQuality.components.co,    priority: false },
                    { key: "nh3",   label: "NH₃",   value: airQuality.components.nh3,   priority: false },
                    { key: "no",    label: "NO",    value: airQuality.components.no,    priority: false },
                  ] as { key: string; label: string; value: number; priority: boolean }[]).map(({ key, label, value, priority }) => {
                    const level = getPollutantLevel(key, value);
                    const threshold = POLLUTANT_THRESHOLDS[key];
                    const maxVal = threshold ? threshold.levels[3] * 1.5 : value * 2;
                    const barPct = Math.min((value / maxVal) * 100, 100);
                    return (
                      <div key={key} className={`rounded-xl px-4 py-3 border ${level.bg} border-white/10`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider">{label}</p>
                            {priority && <span className="text-[8px] bg-white/10 text-white/40 rounded px-1 font-mono">KEY</span>}
                          </div>
                          <span className={`text-[10px] font-bold ${level.color}`}>{level.label}</span>
                        </div>
                        <div className="flex items-end justify-between mb-1.5">
                          <p className={`text-lg font-bold ${level.color}`}>{value.toFixed(1)}</p>
                          <p className="font-mono text-[9px] text-white/30">µg/m³</p>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                          <div className={`h-full rounded-full transition-all duration-700 ${
                            level.label === "Good" ? "bg-emerald-400" :
                            level.label === "Fair" ? "bg-yellow-400" :
                            level.label === "Moderate" ? "bg-orange-400" :
                            level.label === "Poor" ? "bg-red-400" : "bg-purple-400"
                          }`} style={{ width: `${barPct}%` }} />
                        </div>
                        {threshold && <p className="text-[9px] text-white/30 leading-tight">{threshold.danger}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5-day forecast */}
            {forecast.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
                <p className="font-mono text-[10px] tracking-widest uppercase text-white/40 mb-3 px-1">5-Day Forecast</p>
                <div className="grid grid-cols-5 gap-2">
                  {forecast.map((day, i) => (
                    <button key={day.date} onClick={() => setSelectedDay(i)}
                      className={`flex flex-col items-center gap-1 rounded-xl py-3 px-1 transition-all cursor-pointer ${
                        selectedDay === i ? "bg-white/20 border border-white/30" : "hover:bg-white/10 border border-transparent"
                      }`}
                    >
                      <p className="font-mono text-[10px] text-white/50 uppercase tracking-wide">{i === 0 ? "Today" : day.label.split(",")[0]}</p>
                      <span className="text-2xl">{WEATHER_EMOJI[day.condition] ?? "🌡️"}</span>
                      <p className="text-xs font-semibold">{day.temp_max}{unitSymbol}</p>
                      <p className="text-[10px] text-white/40">{day.temp_min}{unitSymbol}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected day detail */}
            {activeForecast && (
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5">
                <p className="font-mono text-[10px] tracking-widest uppercase text-white/40 mb-4">
                  {selectedDay === 0 ? "Today's Details" : activeForecast.label}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Humidity",       value: `${selectedDay === 0 ? weather.main.humidity : activeForecast.humidity}%`, icon: "💧" },
                    { label: "Wind",           value: selectedDay === 0 ? `${weather.wind.speed} ${speedUnit} ${windDirection(weather.wind.deg)}` : `${activeForecast.wind} ${speedUnit}`, icon: "💨" },
                    { label: "Pressure",       value: `${weather.main.pressure} hPa`, icon: "🌡️" },
                    { label: "Visibility",     value: `${(weather.visibility / 1000).toFixed(1)} km`, icon: "👁️" },
                    { label: "Cloud Cover",    value: `${weather.clouds.all}%`, icon: "☁️" },
                    { label: "Sunrise / Set",  value: `${formatTime(weather.sys.sunrise)} / ${formatTime(weather.sys.sunset)}`, icon: "🌅" },
                    { label: "Precip. Chance", value: `${activeForecast.pop}%`, icon: "🌂" },
                    { label: "Condition",      value: activeForecast.description.charAt(0).toUpperCase() + activeForecast.description.slice(1), icon: "📋" },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-white/10 border border-white/10 rounded-xl px-4 py-4">
                      <p className="text-white/40 font-mono text-[10px] tracking-widest uppercase mb-1">{icon} {label}</p>
                      <p className="text-white font-semibold text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}