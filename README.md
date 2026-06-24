<div align="center">
  <img src="assets/favicon.svg" alt="WeatherNow Logo" width="80" height="80">
  
  # 🌤️ WeatherNow
  
  **Погодное SPA-приложение с glassmorphism-дизайном**
  
  [![GitHub Pages](https://img.shields.io/badge/Демо-GitHub%20Pages-FF8C42?style=for-the-badge&logo=github)](https://твой-логин.github.io/weathernow/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/ru/docs/Web/JavaScript)
  [![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?style=for-the-badge&logo=chart.js)](https://www.chartjs.org)
  [![OpenWeatherMap](https://img.shields.io/badge/OpenWeather-API-FF8C42?style=for-the-badge)](https://openweathermap.org/api)
</div>

---

## 📸 Скриншоты

<div align="center">
  <img src="https://placehold.co/600x340/87CEEB/white?text=Светлая+тема" alt="Светлая тема" width="45%">
  <img src="https://placehold.co/600x340/0a0a2e/white?text=Тёмная+тема" alt="Тёмная тема" width="45%">
</div>

---

## 📋 О проекте

**WeatherNow** — погодное SPA-приложение с автоопределением города по геолокации, поиском, прогнозом на 5 дней, почасовым прогнозом, интерактивными графиками и сравнением городов. Дизайн в стиле glassmorphism с анимированным небом.

### 🎯 Что показывает проект
- Работу с внешними API (OpenWeatherMap: Current, Forecast, Geocoding)
- Геолокацию (Geolocation API)
- Визуализацию данных (Chart.js — линейные графики)
- Управление состоянием (LocalStorage)
- Динамическую смену тем (CSS Variables)
- Push-уведомления (Notification API)

---

## 🛠 Технический стек

<table>
  <tr>
    <td><strong>Frontend</strong></td>
    <td>
      <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black">
      <img src="https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat-square&logo=bootstrap">
      <img src="https://img.shields.io/badge/CSS_Variables-Тёмная_тема-1572B6?style=flat-square&logo=css3">
    </td>
  </tr>
  <tr>
    <td><strong>API</strong></td>
    <td>
      <img src="https://img.shields.io/badge/OpenWeatherMap-Weather+Geocoding-FF8C42?style=flat-square">
      <img src="https://img.shields.io/badge/Geolocation-API-00C853?style=flat-square">
      <img src="https://img.shields.io/badge/Notification-API-FF5252?style=flat-square">
    </td>
  </tr>
  <tr>
    <td><strong>Графики</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Chart.js-4.4-FF6384?style=flat-square&logo=chart.js">
    </td>
  </tr>
  <tr>
    <td><strong>Хранение</strong></td>
    <td>
      <img src="https://img.shields.io/badge/LocalStorage-Избранное,_тема-FFCA28?style=flat-square">
    </td>
  </tr>
  <tr>
    <td><strong>Деплой</strong></td>
    <td>
      <img src="https://img.shields.io/badge/GitHub-Pages-222222?style=flat-square&logo=github">
    </td>
  </tr>
</table>

---

## ✨ Ключевые фичи

| Фича | Описание | Технология |
|------|----------|------------|
| 📍 **Автоопределение** | Определение города по GPS-координатам | Geolocation API |
| 🔍 **Поиск городов** | Автодополнение с дебаунсом 300 мс | OpenWeatherMap Geocoding |
| 📅 **Прогноз на 5 дней** | Карточки с эмодзи, t°C, ветром, влажностью | OpenWeatherMap Forecast |
| 🕐 **Почасовой прогноз** | График температуры + осадков на 24 часа | Chart.js |
| 📈 **График температуры** | Линейный график макс/мин с градиентами | Chart.js |
| 📊 **Сравнение городов** | Split-экран: два города side-by-side | Promise.all |
| ⭐ **Избранное** | Сохранение до 10 городов | LocalStorage |
| 🌙 **Тёмная тема** | Переключатель + 50 мерцающих звёзд | CSS Variables |
| 🫧 **Glassmorphism** | Стеклянные карточки с блюром | CSS backdrop-filter |
| ☁️ **Анимированное небо** | 4 плывущих облака + динамический фон | CSS Animations |
| 🔔 **Push-уведомления** | Предупреждения о дожде/грозе/снеге | Notification API |
| 🗺️ **Карта осадков** | Интерактивная карта OpenWeatherMap | iframe |

---

## 📁 Архитектура проекта
