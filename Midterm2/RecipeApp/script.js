// Ключ API для доступа к Spoonacular API
const apiKey = "1622128472aa4e7fa83234672923691c";

// Переменная для хранения выбранного рецепта для просмотра или добавления в избранное
let selectedRecipe = null;

// Функция для поиска рецептов по запросу пользователя
function searchRecipes() {
  const query = document.getElementById('search-input').value;
  
  // Если строка поиска пуста, очищаем список рецептов и выходим
  if (query.trim() === '') {
    document.getElementById('recipe-list').innerHTML = '';
    return;
  }
  
  // Запрашиваем рецепты по введенному запросу через Spoonacular API
  fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`)
    .then(response => response.json())
    .then(data => displayRecipes(data.results)) // Отображаем рецепты на странице
    .catch(error => console.error("Ошибка при получении рецептов:", error));
}

// Функция для отображения списка рецептов в виде кликабельных карточек
function displayRecipes(recipes) {
  const recipeList = document.getElementById('recipe-list');
  recipeList.innerHTML = ''; // Очищаем предыдущие результаты поиска
  
  // Создаем карточку для каждого рецепта
  recipes.forEach(recipe => {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';
    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
    `;
    recipeCard.onclick = () => showRecipeDetails(recipe.id); // Добавляем событие на клик для отображения подробностей
    recipeList.appendChild(recipeCard);
  });
}

// Функция для получения и отображения подробной информации о рецепте в модальном окне
function showRecipeDetails(recipeId) {
    fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true&apiKey=${apiKey}`)
      .then(response => response.json())
      .then(recipe => {
        selectedRecipe = recipe; // Сохраняем выбранный рецепт в переменную
        
        // Проверяем, добавлен ли рецепт в избранное
        const isFavorited = isRecipeFavorited(recipe.id);
  
        // Заполняем модальное окно подробностями рецепта
        document.getElementById('recipe-title').textContent = recipe.title;
        document.getElementById('recipe-image').src = recipe.image;
        document.getElementById('recipe-ingredients').innerHTML = `<strong>Ингредиенты:</strong><ul>${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}</ul>`;
        document.getElementById('recipe-instructions').innerHTML = `<strong>Инструкции:</strong><p>${recipe.instructions || "Не доступны"}</p>`;
  
        // Извлекаем и отображаем информацию о питательной ценности
        const nutrition = recipe.nutrition?.nutrients || [];
        const calories = nutrition.find(nutrient => nutrient.name === "Calories")?.amount || "Н/Д";
        const protein = nutrition.find(nutrient => nutrient.name === "Protein")?.amount || "Н/Д";
        const fat = nutrition.find(nutrient => nutrient.name === "Fat")?.amount || "Н/Д";
        const carbs = nutrition.find(nutrient => nutrient.name === "Carbohydrates")?.amount || "Н/Д";
        document.getElementById('recipe-nutrition').innerHTML = `
          <strong>Питательная ценность:</strong>
          <p>Калории: ${calories}</p>
          <p>Белки: ${protein}</p>
          <p>Жиры: ${fat}</p>
          <p>Углеводы: ${carbs}</p>
        `;
  
        // Отображаем рейтинг рецепта, если доступен
        const ratings = recipe.aggregateLikes || "Не оценено";
        document.getElementById('recipe-ratings').innerHTML = `<strong>Рейтинг:</strong> <p>${ratings} лайков</p>`;
  
        // Меняем текст кнопки в зависимости от того, добавлен ли рецепт в избранное
        const favoriteBtn = document.getElementById('favorite-btn');
        favoriteBtn.textContent = isFavorited ? "Удалить из избранного" : "Добавить в избранное";
        favoriteBtn.onclick = isFavorited ? removeFromFavorites : addToFavorites;
  
        // Показываем модальное окно
        document.getElementById('recipe-modal').style.display = 'flex';
      })
      .catch(error => console.error("Ошибка при получении подробностей рецепта:", error));
}

// Функция для закрытия модального окна
function closeModal() {
  document.getElementById('recipe-modal').style.display = 'none';
}

// Функция для добавления рецепта в список избранных
function addToFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites.push({ id: selectedRecipe.id, title: selectedRecipe.title, image: selectedRecipe.image });
  localStorage.setItem('favorites', JSON.stringify(favorites));
  showFavorites();
  closeModal();
}

// Функция для удаления рецепта из списка избранных
function removeFromFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const updatedFavorites = favorites.filter(fav => fav.id !== selectedRecipe.id);
  localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  showFavorites();
  closeModal();
}

// Функция для проверки, добавлен ли рецепт в избранное
function isRecipeFavorited(recipeId) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  return favorites.some(fav => fav.id === recipeId);
}

// Функция для закрытия модального окна при клике вне его
window.onclick = function(event) {
  const modal = document.getElementById('recipe-modal');
  if (event.target === modal) {
    closeModal();
  }
};

// Функция для отображения списка избранных рецептов
function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const favoritesList = document.getElementById('favorites-list');
  favoritesList.innerHTML = ''; // Очищаем предыдущие избранные
  
  // Создаем карточку для каждого избранного рецепта
  favorites.forEach(favorite => {
    const favCard = document.createElement('div');
    favCard.className = 'recipe-card';
    favCard.innerHTML = `
      <img src="${favorite.image}" alt="${favorite.title}">
      <h3>${favorite.title}</h3>
    `;
    favCard.onclick = () => showRecipeDetails(favorite.id); // Добавляем событие на клик для отображения подробностей
    favoritesList.appendChild(favCard);
  });
}

// Загружаем список избранных при загрузке страницы
document.addEventListener('DOMContentLoaded', showFavorites);
