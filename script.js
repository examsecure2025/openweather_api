const openweatherApiBaseUrl = 'https://api.openweathermap.org/data/2.5';
const openweatherApiEndpoint = '/weather';

const openweatherSearchInput = document.getElementById('openweatherSearchInput');
const openweatherSearchBtn = document.getElementById('openweatherSearchBtn');
const openweatherError = document.getElementById('openweatherError');
const openweatherLoading = document.getElementById('openweatherLoading');
const openweatherResults = document.getElementById('openweatherResults');
const openweatherThemeToggle = document.getElementById('openweatherThemeToggle');
const openweatherThemeIcon = document.getElementById('openweatherThemeIcon');
const openweatherBody = document.body;

// dito kinukuha yung weather data galing sa api
async function fetchWeatherData(cityName) {
    try {
        const apiKey = openweatherApiKey;
        const url = `${openweatherApiBaseUrl}${openweatherApiEndpoint}?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('city not found');
            } else if (response.status === 401) {
                throw new Error('invalid api key');
            } else {
                throw new Error('failed to fetch weather data');
            }
        }
        
        const weatherData = await response.json();
        return weatherData;
    } catch (error) {
        throw error;
    }
}

// dito pinapakita yung weather data sa card
function displayWeatherData(weatherData) {
    openweatherResults.innerHTML = '';
    
    const card = document.createElement('div');
    card.className = 'openweather-weather-card';
    
    const header = document.createElement('div');
    header.className = 'openweather-weather-header';
    
    const cityInfo = document.createElement('div');
    const cityName = document.createElement('h2');
    cityName.className = 'openweather-city-name';
    cityName.textContent = weatherData.name;
    
    const country = document.createElement('div');
    country.className = 'openweather-country';
    country.textContent = weatherData.sys.country;
    
    cityInfo.appendChild(cityName);
    cityInfo.appendChild(country);
    
    const weatherIcon = document.createElement('div');
    weatherIcon.className = 'openweather-weather-icon';
    const iconCode = weatherData.weather[0].icon;
    weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${weatherData.weather[0].description}">`;
    
    header.appendChild(cityInfo);
    header.appendChild(weatherIcon);
    
    const main = document.createElement('div');
    main.className = 'openweather-weather-main';
    
    const temp = document.createElement('div');
    temp.className = 'openweather-temp';
    temp.textContent = Math.round(weatherData.main.temp) + '°C';
    
    const tempRange = document.createElement('div');
    tempRange.className = 'openweather-temp-range';
    tempRange.innerHTML = `Max: ${Math.round(weatherData.main.temp_max)}° Min: ${Math.round(weatherData.main.temp_min)}°`;
    
    const description = document.createElement('div');
    description.className = 'openweather-description';
    description.textContent = weatherData.weather[0].description;
    
    main.appendChild(temp);
    main.appendChild(tempRange);
    main.appendChild(description);
    
    const details = document.createElement('div');
    details.className = 'openweather-weather-details';
    
    const feelsLike = createDetailItem('feels like', Math.round(weatherData.main.feels_like) + '°C', 'bi-thermometer-half');
    const humidity = createDetailItem('humidity', weatherData.main.humidity + '%', 'bi-droplet');
    const windSpeed = createDetailItem('wind speed', weatherData.wind.speed + ' m/s', 'bi-wind');
    const pressure = createDetailItem('pressure', weatherData.main.pressure + ' hPa', 'bi-speedometer2');
    const visibility = createDetailItem('visibility', (weatherData.visibility / 1000).toFixed(1) + ' km', 'bi-eye');
    const cloudiness = createDetailItem('cloudiness', weatherData.clouds.all + '%', 'bi-cloud');
    const sunrise = createDetailItem('sunrise', formatTime(weatherData.sys.sunrise), 'bi-sunrise');
    const sunset = createDetailItem('sunset', formatTime(weatherData.sys.sunset), 'bi-sunset');
    
    if (weatherData.wind.deg !== undefined) {
        const windDir = createDetailItem('wind direction', getWindDirection(weatherData.wind.deg), 'bi-compass');
        details.appendChild(windDir);
    }
    
    details.appendChild(feelsLike);
    details.appendChild(humidity);
    details.appendChild(windSpeed);
    details.appendChild(pressure);
    details.appendChild(visibility);
    details.appendChild(cloudiness);
    details.appendChild(sunrise);
    details.appendChild(sunset);
    
    const mapContainer = document.createElement('div');
    mapContainer.className = 'openweather-map-container';
    mapContainer.id = 'openweatherMap';
    
    card.appendChild(header);
    card.appendChild(main);
    card.appendChild(details);
    card.appendChild(mapContainer);
    
    openweatherResults.appendChild(card);
    
    setTimeout(function() {
        initMap(weatherData.coord.lat, weatherData.coord.lon, weatherData.name);
    }, 100);
}

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index] + ' (' + degrees + '°)';
}

let openweatherMap = null;

// dito ginagawa yung map para makita yung location
function initMap(lat, lon, cityName) {
    if (openweatherMap) {
        openweatherMap.remove();
    }
    
    openweatherMap = L.map('openweatherMap').setView([lat, lon], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(openweatherMap);
    
    L.marker([lat, lon]).addTo(openweatherMap)
        .bindPopup(cityName)
        .openPopup();
}

function createDetailItem(label, value, iconClass) {
    const item = document.createElement('div');
    item.className = 'openweather-detail-item';
    
    const labelSpan = document.createElement('div');
    labelSpan.className = 'openweather-detail-label';
    labelSpan.textContent = label;
    
    const valueSpan = document.createElement('div');
    valueSpan.className = 'openweather-detail-value';
    valueSpan.textContent = value;
    
    item.appendChild(labelSpan);
    item.appendChild(valueSpan);
    
    return item;
}

// dito chinecheck kung tama yung input ng user
function validateCityInput(inputValue) {
    const trimmedValue = inputValue.trim();
    
    if (trimmedValue === '') {
        return { valid: false, message: 'please enter a city name' };
    }
    
    if (!/^[a-zA-Z\s\-']+$/.test(trimmedValue)) {
        return { valid: false, message: 'invalid city name. use letters only' };
    }
    
    return { valid: true, value: trimmedValue };
}

function showOpenweatherError(message) {
    openweatherError.textContent = message;
    openweatherError.classList.add('show');
    
    setTimeout(function() {
        openweatherError.classList.remove('show');
    }, 3000);
}

function clearOpenweatherError() {
    openweatherError.classList.remove('show');
    openweatherError.textContent = '';
}

function showOpenweatherLoading() {
    openweatherLoading.style.display = 'block';
    openweatherResults.innerHTML = '';
    clearOpenweatherError();
}

function hideOpenweatherLoading() {
    openweatherLoading.style.display = 'none';
}

function handleSearchWeather() {
    const inputValue = openweatherSearchInput.value;
    const validation = validateCityInput(inputValue);
    
    if (!validation.valid) {
        showOpenweatherError(validation.message);
        return;
    }
    
    const cityName = validation.value;
    const button = openweatherSearchBtn;
    
    button.disabled = true;
    button.classList.add('loading');
    showOpenweatherLoading();
    
    fetchWeatherData(cityName)
        .then(function(weatherData) {
            displayWeatherData(weatherData);
            hideOpenweatherLoading();
            button.classList.remove('loading');
            button.disabled = false;
        })
        .catch(function(error) {
            let errorMessage = 'failed to fetch weather data';
            if (error.message) {
                errorMessage = error.message.toLowerCase();
            }
            showOpenweatherError(errorMessage);
            hideOpenweatherLoading();
            button.classList.remove('loading');
            button.disabled = false;
        });
}

// dito sinetup yung dark mode at light mode toggle
function toggleTheme() {
    if (openweatherBody.classList.contains('openweather-light')) {
        openweatherBody.classList.remove('openweather-light');
        openweatherBody.classList.add('openweather-dark');
        openweatherThemeIcon.textContent = 'Light';
    } else {
        openweatherBody.classList.remove('openweather-dark');
        openweatherBody.classList.add('openweather-light');
        openweatherThemeIcon.textContent = 'Dark';
    }
}

function setupOpenweatherEventListeners() {
    openweatherSearchBtn.addEventListener('click', handleSearchWeather);
    
    openweatherSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearchWeather();
        }
    });
    
    openweatherSearchInput.addEventListener('input', function() {
        clearOpenweatherError();
    });
    
    openweatherThemeToggle.addEventListener('click', toggleTheme);
}

document.addEventListener('DOMContentLoaded', function() {
    setupOpenweatherEventListeners();
});

