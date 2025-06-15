import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ToDoForm from './AddTask';
import ToDo from './Task';

const TASKS_STORAGE_KEY = 'tasks-list-project-web';
const DEFAULT_CITY = {
  name: "Краснодаре",
  latitude: 45.0355,
  longitude: 38.9753
};

function App() {
  const [rates, setRates] = useState({});
  const [weatherData, setWeatherData] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Функция для преобразования кода погоды в текст
  const getWeatherCondition = (code) => {
    const conditions = {
      0: 'Ясно',
      1: 'Преимущественно ясно',
      2: 'Переменная облачность',
      3: 'Пасмурно',
      45: 'Туман',
      51: 'Легкая морось',
      53: 'Умеренная морось',
      55: 'Сильная морось',
      61: 'Небольшой дождь',
      63: 'Умеренный дождь',
      65: 'Сильный дождь',
      80: 'Ливень',
      81: 'Сильный ливень',
      82: 'Очень сильный ливень'
    };
    return conditions[code] || 'Неизвестно';
  };

  useEffect(() => {
    async function fetchAllData() {
      try {
        // Валюты
        const currency = await axios.get('https://www.cbr-xml-daily.ru/daily_json.js');
        const { USD, EUR } = currency.data.Valute;

        setRates({
          USDrate: USD.Value.toFixed(2).replace('.', ','),
          EURrate: EUR.Value.toFixed(2).replace('.', ',')
        });

        // Погода для Краснодара
        const weatherRes = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${DEFAULT_CITY.latitude}&longitude=${DEFAULT_CITY.longitude}&current_weather=true`
        );

        setWeatherData({
          temp: weatherRes.data.current_weather.temperature,
          wind_speed: weatherRes.data.current_weather.windspeed,
          condition: getWeatherCondition(weatherRes.data.current_weather.weathercode)
        });

      } catch (err) {
        console.error(err);
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  // Задачи: загрузка и сохранение
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
                <h3>Погода в: {DEFAULT_CITY.name}</h3>
                <div>
                  🌡 Температура: {weatherData.temp}°C<br />
                  💨 Ветер: {weatherData.wind_speed} м/с<br />
                  ☁ Состояние: {weatherData.condition}
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
