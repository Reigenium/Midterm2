const apiKey = "5b2a767ad5f24f1abac6631b3cd41ba1"; // Замените на свой ключ API OpenWeatherMap
let currentUnits = 'metric'; // Единицы измерения по умолчанию: Цельсий

// Функция для поиска погоды по названию города
function searchWeather() {
  const query = document.getElementById('search-input').value; // Получаем название города из поля ввода
  if (query.trim() === '') {
    return; // Если строка пуста, ничего не делаем
  }
  
  fetchWeather(query); // Вызываем функцию для получения погоды
}

// Функция для получения погоды для указанного города
function fetchWeather(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnits}&appid=${apiKey}`) 
    .then(response => response.json()) // Преобразуем ответ в формат JSON
    .then(data => displayCurrentWeather(data)) // Отображаем текущую погоду
    .catch(error => console.error("Error fetching weather:", error)); // Логируем ошибку, если она произошла
}

// Функция для отображения информации о текущей погоде
function displayCurrentWeather(data) {
  // Отображаем данные о городе и текущей погоде
  document.getElementById('current-city').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('current-temp').textContent = `${data.main.temp}°`; // Температура
  document.getElementById('current-humidity').textContent = `Humidity: ${data.main.humidity}%`; // Влажность
  document.getElementById('current-wind').textContent = `Wind: ${data.wind.speed} m/s`; // Скорость ветра
  document.getElementById('current-weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`; // Иконка погоды
  
  // Получаем прогноз погоды на 5 дней
  fetchForecast(data.coord.lat, data.coord.lon); // Запрашиваем прогноз по координатам города
}

// Функция для получения прогноза погоды на 5 дней
function fetchForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${currentUnits}&appid=${apiKey}`)
    .then(response => response.json()) // Преобразуем ответ в формат JSON
    .then(data => displayForecast(data)) // Отображаем прогноз
    .catch(error => console.error("Error fetching forecast:", error)); // Логируем ошибку, если она произошла
}

// Функция для отображения прогноза погоды на 5 дней
function displayForecast(data) {
    const forecastList = document.getElementById('forecast-list');
    forecastList.innerHTML = ''; // Очищаем предыдущий прогноз
    
    // Фильтруем прогноз на каждые 24 часа (по 8 значений на каждый день)
    data.list.filter((item, index) => index % 8 === 0) // Получаем прогнозы через каждый 8-й элемент (каждые 24 часа)
      .forEach(item => {
        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        
        const date = new Date(item.dt * 1000).toLocaleDateString(); // Форматируем дату
        const highTemp = item.main.temp_max;  // Максимальная температура
        const lowTemp = item.main.temp_min;   // Минимальная температура
        const weatherCondition = item.weather[0].description;  // Описание погоды (например, ясное небо)
        const weatherIcon = item.weather[0].icon;  // Код иконки погоды
  
        forecastCard.innerHTML = `
          <h4>${date}</h4>
          <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="Weather Icon">
          <p><strong>${weatherCondition}</strong></p>
          <p><strong>${highTemp}° / ${lowTemp}°</strong></p>
        `;
        
        forecastList.appendChild(forecastCard); // Добавляем карточку в список прогноза
      });
  }

// Функция для переключения единиц измерения температуры (Цельсий / Фаренгейт)
function toggleUnits() {
  currentUnits = (currentUnits === 'metric') ? 'imperial' : 'metric'; // Переключаем единицы измерения
  const unitButton = document.getElementById('unit-toggle');
  unitButton.textContent = (currentUnits === 'metric') ? "Switch to Fahrenheit" : "Switch to Celsius"; // Изменяем текст на кнопке

  // Повторно загружаем погоду с новыми единицами
  const city = document.getElementById('current-city').textContent;
  if (city) {
    const cityName = city.split(',')[0].trim(); // Извлекаем название города из строки
    fetchWeather(cityName); // Повторно вызываем функцию получения погоды
  }
}

// Функция для получения погоды для текущего местоположения пользователя
function getLocationWeather() {
  if (navigator.geolocation) {
    // Получаем координаты местоположения
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeatherByLocation(lat, lon); // Получаем погоду по координатам
    }, () => {
      alert("Unable to retrieve your location."); // Сообщение, если не удалось получить местоположение
    });
  } else {
    alert("Geolocation is not supported by this browser."); // Сообщение, если браузер не поддерживает геолокацию
  }
}

// Функция для получения погоды по координатам
function fetchWeatherByLocation(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnits}&appid=${apiKey}`)
    .then(response => response.json()) // Преобразуем ответ в формат JSON
    .then(data => displayCurrentWeather(data)) // Отображаем текущую погоду
    .catch(error => console.error("Error fetching location weather:", error)); // Логируем ошибку, если она произошла
}
