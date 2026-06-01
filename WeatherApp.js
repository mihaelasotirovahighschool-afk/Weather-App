// Wait for the HTML DOM content to fully load before adding event listeners
document.getElementById('search-form').addEventListener('submit', function(event) {
    // Prevent default form submission reload behavior
    event.preventDefault();

    // Extract the textual city name and remove leading/trailing whitespaces
    const cityName = document.getElementById('search-input').value.trim();
    
    if (cityName !== "") {
        fetchCoordinates(cityName);
    }
});

/**
 * Step 1: Resolve textual city name into numeric Latitude & Longitude (Geocoding API)
 */
function fetchCoordinates(city) {
    showLoading(); // Activate the visual loading spinner

    // Define Open-Meteo Geocoding URL endpoint configuration
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`;

    fetch(geocodingUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to communicate with location service.");
            }
            return response.json();
        })
        .then(data => {
            // Verify if the API successfully pinpointed any matching city array data
            if (!data.results || data.results.length === 0) {
                throw new Error("City not found. Please verify spelling.");
            }

            // Extract geolocation data from the top index match
            const result = data.results[0];
            const lat = result.latitude;
            const lon = result.longitude;
            const correctCityName = result.name; // Formal capitalized city name string

            // Route to Step 2: Extract atmospheric weather properties
            fetchWeatherData(lat, lon, correctCityName);
        })
        .catch(error => {
            showError(error.message); // Direct error message string to the UI layer
        });
}

/**
 * Step 2: Fetch meteorological datasets based on latitude and longitude coordinates
 */
function fetchWeatherData(lat, lon, cityName) {
    // Construct request query targeted at real-time telemetry variables
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to extract weather parameters.");
            }
            return response.json();
        })
        .then(data => {
            // Forward relevant object packets into the parsing view matrix
            displayWeather(data.current_weather, cityName);
        })
        .catch(error => {
            showError(error.message);
        });
}

/**
 * Step 3: Inject the processed structural data objects directly into HTML selectors
 */
function displayWeather(weather, cityName) {
    hideLoading(); // Turn off loading interface components

    // Map basic text telemetry variables to the DOM nodes
    document.getElementById('city-name').innerText = cityName;
    document.getElementById('temperature').innerText = `${Math.round(weather.temperature)}°C`;
    document.getElementById('wind-speed').innerHTML = `<i class="fa-solid fa-wind"></i> Wind Speed: ${weather.windspeed} km/h`;

    // Map structural World Meteorological Organization (WMO) numerical status IDs
    const weatherCode = weather.weathercode;
    const conditionText = getWeatherCondition(weatherCode);
    const iconClass = getWeatherIconClass(weatherCode);

    // Apply the textual definition and dynamic icon typography CSS classes
    document.getElementById('weather-condition').innerHTML = `<i class="fa-solid fa-smog"></i> Condition: ${conditionText}`;
    
    const iconElement = document.getElementById('weather-icon');
    iconElement.className = `fa-solid ${iconClass}`; // Rewrite explicit element font styles

    // Enforce distinctive yellow highlights if clear skies are identified
    if (weatherCode === 0 || weatherCode === 1) {
        iconElement.classList.add('sun-icon');
    }

    // Toggle container display flags to clear visibility states
    document.getElementById('weather-info').style.display = 'block';
    document.getElementById('error').style.display = 'none';
}

/**
 * Utility Decoder: Maps numeric WMO weather conditions to readable English classifications
 */
function getWeatherCondition(code) {
    if (code === 0) return "Clear Sky";
    if (code === 1 || code === 2 || code === 3) return "Mainly Clear / Partly Cloudy";
    if (code === 45 || code === 48) return "Fog";
    if (code === 51 || code === 53 || code === 55) return "Drizzle";
    if (code === 61 || code === 63 || code === 65) return "Rain";
    if (code === 71 || code === 73 || code === 75) return "Snow Fall";
    if (code === 80 || code === 81 || code === 82) return "Rain Showers";
    if (code === 95 || code === 96 || code === 99) return "Thunderstorm";
    return "Unknown Conditions";
}

/**
 * Utility Selector: Maps numerical WMO weather codes to specific Font Awesome vector icon classes
 */
function getWeatherIconClass(code) {
    if (code === 0) return "fa-sun"; // Sun vector
    if (code === 1 || code === 2 || code === 3) return "fa-cloud-sun"; // Semi cloudy vector
    if (code === 45 || code === 48) return "fa-smog"; // Haze/Fog vector
    if (code === 51 || code === 53 || code === 55) return "fa-cloud-rain"; // Soft shower vector
    if (code === 61 || code === 63 || code === 65) return "fa-cloud-showers-heavy"; // Storm precipitation vector
    if (code === 71 || code === 73 || code === 75) return "fa-snowflake"; // Winter snow vector
    if (code === 80 || code === 81 || code === 82) return "fa-cloud-showers-water"; // Heavy precipitation cloud
    if (code === 95 || code === 96 || code === 99) return "fa-cloud-bolt"; // Electrical discharge storm
    return "fa-cloud"; // Generic baseline cloud fallback
}

/**
 * Interface Controllers: Mutate DOM CSS visible display configurations
 */
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('weather-info').style.display = 'none';
    document.getElementById('error').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    hideLoading();
    document.getElementById('error-message').innerText = message;
    document.getElementById('error').style.display = 'block';
    document.getElementById('weather-info').style.display = 'none';
}