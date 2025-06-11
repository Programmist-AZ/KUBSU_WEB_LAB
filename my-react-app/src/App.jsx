import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ToDoForm from './AddTask';
import ToDo from './Task';

const TASKS_STORAGE_KEY = 'tasks-list-project-web';
const weatherApiKey = 'c7616da4b68205c2f3ae73df2c31d177';

function App() {
  const [rates, setRates] = useState({});
  const [weatherData, setWeatherData] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAllData() {
      try {
        const { data: currency } = await axios.get('https://www.cbr-xml-daily.ru/daily_json.js');
        const { USD, EUR } = currency?.Valute || {};

        if (!USD || !EUR) throw new Error('Нет данных о валюте');

        setRates({
          USDrate: USD.Value.toFixed(2).replace('.', ','),
          EURrate: EUR.Value.toFixed(2).replace('.', ',')
        });

        navigator.geolocation.getCurrentPosition(async ({ coords }) => {
          const { data: weather } = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${weatherApiKey}`
          );
          setWeatherData(weather);
        });
      } catch (err) {
        setError('Ошибка загрузки данных.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    if (stored) {
      try {
        setTodos(JSON.parse(stored));
      } catch {
        console.warn('Неверный формат данных в localStorage');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTask = (task) => {
    if (task.trim()) {
      setTodos([...todos, { id: crypto.randomUUID(), task, complete: false }]);
    }
  };

  const removeTask = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTask = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, complete: !todo.complete } : todo
    ));
  };

  return (
    <div className="App">
      {loading && <p>Загрузка...</p>}
      {!loading && error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          <div className="info">
            <div className="money">
              <div>Доллар США $ — {rates.USDrate} руб.</div>
              <div>Евро € — {rates.EURrate} руб.</div>
            </div>
            {weatherData && (
              <div className="weather-info">
                <h3>Погода в: {weatherData.name}, {weatherData.sys.country}</h3>
                <div>
                  🌡 {(weatherData.main.temp - 273.15).toFixed(1)}°C  
                  · 💨 {weatherData.wind.speed} м/с  
                  · ☁ {weatherData.clouds.all}%
                  <img
                    className="weather-icon"
                    src={`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`}
                    alt="Иконка погоды"
                  />
                </div>
              </div>
            )}
          </div>

          <header>
            <h1 className="list-header">Список задач: {todos.length}</h1>
          </header>
          <ToDoForm addTask={addTask} />
          {todos.map(todo => (
            <ToDo key={todo.id} todo={todo} toggleTask={toggleTask} removeTask={removeTask} />
          ))}
        </>
      )}
    </div>
  );
}

export default App;
