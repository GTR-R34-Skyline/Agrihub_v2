import { useState, useEffect } from "react";
import { Cloud, Droplets, Wind, Thermometer, Sun, CloudRain, MapPin } from "lucide-react";

interface WeatherData {
  temp: number;
  humidity: number;
  wind: number;
  condition: string;
  location: string;
}

// Simulated weather data based on Indian agricultural regions
const getSeasonalWeather = (location: string): WeatherData => {
  const month = new Date().getMonth();
  const isKharif = month >= 5 && month <= 9; // June-Oct
  const isRabi = month >= 10 || month <= 2; // Nov-Mar
  
  const baseTemp = isKharif ? 32 : isRabi ? 22 : 28;
  const baseHumidity = isKharif ? 75 : isRabi ? 45 : 55;
  
  return {
    temp: baseTemp + Math.floor(Math.random() * 6 - 3),
    humidity: baseHumidity + Math.floor(Math.random() * 10 - 5),
    wind: 8 + Math.floor(Math.random() * 12),
    condition: isKharif ? "Partly Cloudy" : isRabi ? "Clear" : "Sunny",
    location: location || "India",
  };
};

const getForecast = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return days.map((day, i) => ({
    day,
    high: 28 + Math.floor(Math.random() * 8),
    low: 18 + Math.floor(Math.random() * 6),
    rain: Math.floor(Math.random() * 40),
  }));
};

interface WeatherWidgetProps {
  location?: string;
  compact?: boolean;
}

export const WeatherWidget = ({ location = "India", compact = false }: WeatherWidgetProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<{ day: string; high: number; low: number; rain: number }[]>([]);

  useEffect(() => {
    setWeather(getSeasonalWeather(location));
    setForecast(getForecast());
  }, [location]);

  if (!weather) return null;

  const conditionIcon = weather.condition.includes("Cloud") || weather.condition.includes("Rain")
    ? <CloudRain className="h-8 w-8 text-blue-400" />
    : <Sun className="h-8 w-8 text-warning" />;

  if (compact) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {conditionIcon}
            <div>
              <p className="text-2xl font-bold">{weather.temp}°C</p>
              <p className="text-xs text-muted-foreground">{weather.condition}</p>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><Droplets className="h-3 w-3" /> {weather.humidity}%</div>
            <div className="flex items-center gap-1 mt-1"><Wind className="h-3 w-3" /> {weather.wind} km/h</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          Weather
        </h3>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {weather.location}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        {conditionIcon}
        <div>
          <p className="text-3xl font-bold">{weather.temp}°C</p>
          <p className="text-sm text-muted-foreground">{weather.condition}</p>
        </div>
        <div className="ml-auto space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4" /> Humidity: {weather.humidity}%
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4" /> Wind: {weather.wind} km/h
          </div>
        </div>
      </div>

      {/* 5-day forecast */}
      <div className="border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">5-Day Forecast</p>
        <div className="grid grid-cols-5 gap-2 text-center">
          {forecast.map((f) => (
            <div key={f.day} className="rounded-lg bg-muted/30 p-2">
              <p className="text-xs font-medium">{f.day}</p>
              <p className="text-sm font-bold mt-1">{f.high}°</p>
              <p className="text-xs text-muted-foreground">{f.low}°</p>
              {f.rain > 20 && (
                <p className="text-xs text-blue-500 mt-1">🌧 {f.rain}%</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Farming Advisory */}
      <div className="mt-4 rounded-lg bg-primary/5 border border-primary/10 p-3">
        <p className="text-xs font-semibold text-primary mb-1">🌾 Farming Tip</p>
        <p className="text-xs text-muted-foreground">
          {weather.humidity > 70
            ? "High humidity — watch for fungal diseases. Ensure proper ventilation in crop fields."
            : weather.temp > 35
            ? "High temperatures — ensure adequate irrigation. Consider mulching to retain soil moisture."
            : "Good conditions for field work. Ideal time for planting or harvesting activities."}
        </p>
      </div>
    </div>
  );
};
