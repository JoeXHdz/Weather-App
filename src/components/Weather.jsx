import React, { useEffect, useRef, useState } from "react";
import "./Weather.css";
import search_icon from "../assets/search.png";
import clear_icon from "../assets/clear.png";
import cloud_icon from "../assets/cloud.png";
import drizzle_icon from "../assets/drizzle.png";
import humidity_icon from "../assets/humidity.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snow.png";
import wind_icon from "../assets/wind.png";
import mist_icon from "../assets/mist.png";

const Weather = () => {
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(false);
  const [forecastData, setForecastData] = useState([]);
  const [error, setError] = useState("");

  const allIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": cloud_icon,
    "03n": cloud_icon,
    "04d": cloud_icon,
    "04n": cloud_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": drizzle_icon,
    "10n": drizzle_icon,
    "13d": snow_icon,
    "13n": snow_icon,
    "50d": mist_icon,
    "50n": mist_icon,
  };

  const fetchForecast = async (lat, lon) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setError("Error fetching forecast data.");
        return;
      }

      const dailyForecast = data.list.filter((_, index) => index % 8 === 0);
      setForecastData(
        dailyForecast.map((item) => ({
          date: new Date(item.dt_txt).toLocaleDateString(),
          temperature: Math.floor(item.main.temp),
          icon: allIcons[item.weather[0].icon] || clear_icon,
        }))
      );
    } catch {
      setError("Error fetching forecast data. Please try again.");
    }
  };

  const search = async (city) => {
    if (city === "") {
      setError("Please enter a city name.");
      return;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setError("");

      const icon = allIcons[data.weather[0].icon] || clear_icon;

      const weatherCondition = data.weather[0].main.toLowerCase();
      const weatherToColorMap = {
        clear: "LemonChiffon",
        clouds: "SlateGrey",
        rain: "SlateBlue",
        snow: "snow",
        drizzle: "lightblue",
        mist: "lightsteelblue",
        default: "NavajoWhite",
      };

      const newBackgroundColor =
        weatherToColorMap[weatherCondition] || weatherToColorMap.default;
      document.body.style.backgroundColor = newBackgroundColor;

      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        location: data.name,
        icon: icon,
      });

      await fetchForecast(data.coord.lat, data.coord.lon);
    } catch {
      setError("Error fetching weather data. Please try again.");
      setWeatherData(false);
      setForecastData([]);
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = "gainsboro";

    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div className="weather">
      <div className="header">
        <h1>Weather Forecast</h1>
      </div>
      <div className="search-bar">
        <input ref={inputRef} type="text" placeholder="Search" />
        <img
          src={search_icon}
          alt="Search"
          onClick={() => search(inputRef.current.value)}
        />
      </div>
      {error && <p className="error-message">{error}</p>}
      {weatherData ? (
        <>
          <img
            src={weatherData.icon}
            alt="Weather Icon"
            className="weather-icon"
          />
          <p className="temperature">{weatherData.temperature}°F</p>
          <p className="location">{weatherData.location}</p>
          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="Humidity Icon" />
              <div>
                <p>{weatherData.humidity}</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} alt="Wind Speed Icon" />
              <div>
                <p>{weatherData.windSpeed}</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
          {forecastData.length > 0 && (
            <div className="forecast">
              <h2>5-Day Forecast</h2>
              <div className="forecast-cards">
                {forecastData.map((day, index) => (
                  <div key={index} className="forecast-card">
                    <p>{day.date}</p>
                    <img src={day.icon} alt="Weather Icon" />
                    <p>{day.temperature}°F</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Weather;
