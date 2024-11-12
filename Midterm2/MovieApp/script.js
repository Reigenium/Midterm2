const apiKey = "4895c6fcd4a70f83ca94fb3dd99f76f7";  // API ключ для доступа к базе данных фильмов

let selectedMovie = null;  // Переменная для хранения выбранного фильма

// Функция для поиска фильмов по запросу
function searchMovies() {
  const query = document.getElementById('search-input').value;  // Получаем введённый запрос
  const sortOption = document.getElementById('sort-options').value;  // Получаем выбранный способ сортировки
  
  // Если запрос пустой, очищаем список фильмов
  if (query.trim() === '') {
    document.getElementById('movie-list').innerHTML = '';
    return;
  }
  
  // Делаем запрос к API для поиска фильмов с учетом выбранной сортировки
  fetch(`https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${apiKey}&sort_by=${sortOption}`)
    .then(response => response.json())  // Получаем данные в формате JSON
    .then(data => displayMovies(data.results))  // Отображаем фильмы
    .catch(error => console.error("Ошибка при загрузке фильмов:", error));  // Обработка ошибки
}

// Функция для отображения списка фильмов
function displayMovies(movies) {
  const movieList = document.getElementById('movie-list');
  movieList.innerHTML = '';
  
  // Если фильмов нет, показываем сообщение
  if (movies.length === 0) {
    movieList.innerHTML = "<p>Фильмов не найдено.</p>";
  } else {
    // Для каждого фильма создаём карточку
    movies.forEach(movie => {
      const movieCard = document.createElement('div');
      movieCard.className = 'movie-card';
      movieCard.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>Дата выпуска: ${movie.release_date}</p>
      `;
      movieCard.onclick = () => showMovieDetails(movie.id);  // При клике показываем подробности фильма
      movieList.appendChild(movieCard);
    });
  }
}

// Функция для отображения подробной информации о фильме
function showMovieDetails(movieId) {
  fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,videos`)
    .then(response => response.json())  // Получаем данные о фильме
    .then(movie => {
      selectedMovie = movie;  // Сохраняем выбранный фильм в переменную

      // Проверяем, есть ли фильм в списке для просмотра
      const isWatchlisted = isMovieWatchlisted(movie.id);

      // Отображаем информацию о фильме в модальном окне
      document.getElementById('movie-title').textContent = movie.title;
      document.getElementById('movie-poster').src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      document.getElementById('movie-synopsis').innerHTML = `<strong>Сюжет:</strong> ${movie.overview}`;
      document.getElementById('movie-rating').innerHTML = `<strong>Рейтинг:</strong> ${movie.vote_average}/10`;
      document.getElementById('movie-cast').innerHTML = `<strong>Актеры:</strong> ${movie.credits.cast.slice(0, 5).map(c => c.name).join(', ')}`;
      
      // Ищем трейлер фильма
      const trailer = movie.videos.results.find(v => v.type === "Trailer");
      document.getElementById('movie-trailers').innerHTML = trailer 
        ? `<strong>Трейлер:</strong> <a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank">Смотреть</a>` 
        : '';
      
      // Изменяем текст на кнопке в зависимости от того, есть ли фильм в списке
      const watchlistBtn = document.getElementById('watchlist-btn');
      watchlistBtn.textContent = isWatchlisted ? "Удалить из списка" : "Добавить в список";
      watchlistBtn.onclick = isWatchlisted ? removeFromWatchlist : addToWatchlist;

      // Открываем модальное окно
      document.getElementById('movie-modal').style.display = 'flex';
    })
    .catch(error => console.error("Ошибка при загрузке деталей фильма:", error));  // Обработка ошибки
}

// Функция для закрытия модального окна
function closeModal() {
  document.getElementById('movie-modal').style.display = 'none';  // Закрываем модальное окно
}

// Функция для добавления фильма в список для просмотра
function addToWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];  // Получаем текущий список фильмов
  watchlist.push({ id: selectedMovie.id, title: selectedMovie.title, poster: selectedMovie.poster_path });  // Добавляем новый фильм
  localStorage.setItem('watchlist', JSON.stringify(watchlist));  // Сохраняем обновлённый список в localStorage
  showWatchlist();  // Обновляем отображение списка
  closeModal();  // Закрываем модальное окно
}

// Функция для удаления фильма из списка для просмотра
function removeFromWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  const updatedWatchlist = watchlist.filter(movie => movie.id !== selectedMovie.id);  // Удаляем фильм из списка
  localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));  // Обновляем список в localStorage
  showWatchlist();  // Обновляем отображение списка
  closeModal();  // Закрываем модальное окно
}

// Функция для проверки, есть ли фильм в списке для просмотра
function isMovieWatchlisted(movieId) {
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  return watchlist.some(movie => movie.id === movieId);  // Проверяем, есть ли фильм в списке
}

// Закрываем модальное окно, если кликнули вне его
window.onclick = function(event) {
  const modal = document.getElementById('movie-modal');
  if (event.target === modal) {
    closeModal();  // Закрываем модальное окно
  }
};

// Функция для отображения списка фильмов в списке для просмотра
function showWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  const watchlistContainer = document.getElementById('watchlist');
  watchlistContainer.innerHTML = '';
  
  // Для каждого фильма из списка создаём карточку
  watchlist.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    movieCard.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w200${movie.poster}" alt="${movie.title}">
      <h3>${movie.title}</h3>
    `;
    movieCard.onclick = () => showMovieDetails(movie.id);  // При клике показываем подробности фильма
    watchlistContainer.appendChild(movieCard);
  });
}

// Показываем список фильмов при загрузке страницы
document.addEventListener('DOMContentLoaded', showWatchlist);
