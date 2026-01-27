import { useState, useEffect } from 'react';
import {
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Info,
  Umbrella,
} from 'lucide-react';

interface WeatherAdvisorProps {
  equipmentType: string;
  location: string;
  startDate: Date;
  endDate: Date;
  className?: string;
}

interface WeatherForecast {
  date: Date;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'windy';
  tempHigh: number;
  tempLow: number;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  uvIndex: number;
}

interface WeatherRecommendation {
  severity: 'good' | 'caution' | 'warning';
  message: string;
  tips: string[];
}

export default function WeatherAdvisor({
  equipmentType,
  location,
  startDate,
  endDate,
  className = '',
}: WeatherAdvisorProps) {
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [recommendation, setRecommendation] = useState<WeatherRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadWeatherData();
  }, [location, startDate, endDate]);

  const loadWeatherData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock forecast
    const conditions: WeatherForecast['condition'][] = ['sunny', 'cloudy', 'rainy', 'sunny', 'windy', 'cloudy', 'sunny'];
    const days: WeatherForecast[] = [];
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayIndex = days.length % conditions.length;
      days.push({
        date: new Date(currentDate),
        condition: conditions[dayIndex],
        tempHigh: 65 + Math.random() * 20,
        tempLow: 45 + Math.random() * 15,
        precipitation: conditions[dayIndex] === 'rainy' ? 60 + Math.random() * 30 : Math.random() * 20,
        windSpeed: conditions[dayIndex] === 'windy' ? 20 + Math.random() * 15 : 5 + Math.random() * 10,
        humidity: 40 + Math.random() * 40,
        uvIndex: conditions[dayIndex] === 'sunny' ? 6 + Math.random() * 4 : 2 + Math.random() * 3,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setForecast(days);
    generateRecommendation(days, equipmentType);
    setLoading(false);
  };

  const generateRecommendation = (weatherData: WeatherForecast[], equipment: string) => {
    const hasRain = weatherData.some(d => d.condition === 'rainy' || d.condition === 'stormy');
    const hasStrongWind = weatherData.some(d => d.windSpeed > 25);
    const hasExtremeTemp = weatherData.some(d => d.tempHigh > 95 || d.tempLow < 32);

    const isOutdoorEquipment = ['excavator', 'tractor', 'tent', 'landscaping', 'construction'].some(
      type => equipment.toLowerCase().includes(type)
    );

    let rec: WeatherRecommendation;

    if (hasStrongWind && isOutdoorEquipment) {
      rec = {
        severity: 'warning',
        message: 'High winds expected - use caution with outdoor equipment',
        tips: [
          'Secure all loose materials and tarps',
          'Avoid operating cranes or lifts in winds over 20mph',
          'Consider rescheduling heavy lift operations',
          'Keep equipment low to ground when not in use',
        ],
      };
    } else if (hasRain && isOutdoorEquipment) {
      rec = {
        severity: 'caution',
        message: 'Rain expected during your rental period',
        tips: [
          'Ensure equipment has proper covers',
          'Allow extra time for outdoor projects',
          'Check for waterproof storage options',
          'Inspect tires and tracks for mud conditions',
        ],
      };
    } else if (hasExtremeTemp) {
      rec = {
        severity: 'caution',
        message: 'Extreme temperatures expected',
        tips: [
          'Allow equipment to warm up before heavy use',
          'Check fluid levels more frequently',
          'Take regular breaks to prevent overheating',
          'Keep equipment in shade when possible',
        ],
      };
    } else {
      rec = {
        severity: 'good',
        message: 'Great conditions for your rental!',
        tips: [
          'Perfect weather for outdoor work',
          'Standard operating procedures apply',
          'Enjoy your rental experience!',
        ],
      };
    }

    setRecommendation(rec);
  };

  const getWeatherIcon = (condition: WeatherForecast['condition']) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-6 h-6 text-amber-500" />;
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-400" />;
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'stormy': return <CloudRain className="w-6 h-6 text-indigo-600" />;
      case 'snowy': return <Snowflake className="w-6 h-6 text-cyan-400" />;
      case 'windy': return <Wind className="w-6 h-6 text-teal-500" />;
    }
  };

  const getSeverityColor = (severity: WeatherRecommendation['severity']) => {
    switch (severity) {
      case 'good': return 'bg-green-50 border-green-200 text-green-800';
      case 'caution': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'warning': return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getSeverityIcon = (severity: WeatherRecommendation['severity']) => {
    switch (severity) {
      case 'good': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'caution': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
              <Cloud className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Weather Advisor</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {location}
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className={`p-4 border-b ${getSeverityColor(recommendation.severity)}`}>
          <div className="flex items-start gap-3">
            {getSeverityIcon(recommendation.severity)}
            <div>
              <p className="font-medium">{recommendation.message}</p>
              {expanded && (
                <ul className="mt-2 space-y-1">
                  {recommendation.tips.map((tip, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-current opacity-60">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Forecast */}
      <div className="p-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {forecast.slice(0, expanded ? forecast.length : 5).map((day, index) => (
            <div key={index} className="flex-shrink-0 w-20 text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">
                {index === 0 ? 'Today' : day.date.toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              <div className="flex justify-center mb-2">
                {getWeatherIcon(day.condition)}
              </div>
              <p className="text-sm font-semibold text-gray-900">{Math.round(day.tempHigh)}°</p>
              <p className="text-xs text-gray-500">{Math.round(day.tempLow)}°</p>
              {day.precipitation > 30 && (
                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-blue-600">
                  <Droplets className="w-3 h-3" />
                  {Math.round(day.precipitation)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Info (Expanded) */}
      {expanded && forecast.length > 0 && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <Thermometer className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-900">
                {Math.round(Math.max(...forecast.map(f => f.tempHigh)))}°F
              </p>
              <p className="text-xs text-gray-500">Max Temp</p>
            </div>
            <div className="text-center">
              <Wind className="w-5 h-5 text-teal-500 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-900">
                {Math.round(Math.max(...forecast.map(f => f.windSpeed)))} mph
              </p>
              <p className="text-xs text-gray-500">Max Wind</p>
            </div>
            <div className="text-center">
              <Umbrella className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-900">
                {forecast.filter(f => f.precipitation > 30).length} days
              </p>
              <p className="text-xs text-gray-500">Rain Expected</p>
            </div>
            <div className="text-center">
              <Sun className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-900">
                {Math.round(Math.max(...forecast.map(f => f.uvIndex)))}
              </p>
              <p className="text-xs text-gray-500">UV Index</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Weather data is updated hourly. Conditions may change - we'll notify you of any significant weather alerts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
