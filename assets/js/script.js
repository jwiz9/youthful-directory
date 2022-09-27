
const submitFormEl = document.getElementById('submit-form');
const submitTextEl = document.getElementById('search-text');
const cityNameEl = document.getElementById('current-city');
const tempEl = document.getElementById('temp')
const windEl = document.getElementById('wind')
const humidityEl = document.getElementById('humidity');
const currentWeatherIconEl = document.getElementById('current-weather-icon')
const headerContainerEl = document.getElementById('h2-container');
const searchHistoryEl = document.getElementById('search-history');
// URL for weather API fetch.
const apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?appid=67cb8234fa480d50fdcf3a0cdfb94ffb&units=imperial';
// URL for converting city names into coordinates.
const geocodeUrl = 'https://api.openweathermap.org/geo/1.0/direct?appid=67cb8234fa480d50fdcf3a0cdfb94ffb&q=';

// Gets coordinates of a city once named.
const generateCoordinates = function(event) {
    event.preventDefault();
  
    // Returns an alert to enter a city name.
    if (!submitTextEl.value) {
      return alert('Please enter a city name');
    }
  
    const usaCountryCode = 'US';
    const cityName = submitTextEl.value.trim();
    submitTextEl.value = '';
    const updatedGeocodeUrl = `${geocodeUrl}${cityName},${usaCountryCode}`;
  
    fetch(updatedGeocodeUrl).then(function(response) {
      if (response.ok) {
        return response.json();
      }
    })
    .then(function(data) {
      if (data.length === 0) {
        return alert(`Could not find the city ${cityName}. Please check the spelling and try again.`);
      }
      const cityObj = data[0];
      return getWeather(cityObj);
    })
    .catch(function(error) {
      console.log(error);
      return alert('Could not connect to OpenWeather Geocode API.');
    }) 
  }
  
  // Gets weather information for a city given the coordinates.
  const getWeather = function(cityObj) {
    let lat = cityObj.lat;
    let lon = cityObj.lon;
    let name = cityObj.name;
    let updatedForecastUrl = `${apiUrl}&lat=${lat}&lon=${lon}`;
  
    fetch(updatedForecastUrl).then(function(response) {
      if (response.ok) {
        return response.json();
      }
    })
    .then(function(data) {
      return infoHandler(data, name);
    })
    .catch(function(error) {
      console.log(error);
      return alert('Could not connect to the OpenWeather One Call API.');
    })
  }
  
  const infoHandler = function(data, name) {
    const currentDate = getDate(parseInt(data.current.dt));
    updateCurrentWeather(data, name, currentDate);
    updateForecast(data);
    updateStorage(data, name)
    updateHistory();
  
    return true;
  }
  
  // Updates 5-day forecast cards.
  const updateForecast = function(data) {
  
    // Checks if cards already exist.
    if (document.getElementById('card-1') != null) {
      // Deletes them if they do.
      for (let i=0; i < 5; i++) {
        let toBeDeletedEl = document.getElementById(`card-${i+1}`);
        toBeDeletedEl.remove();
      }
    }
  
    // Create each day card
    for (let i=0; i < 5; i++) {
      let elId = i+1;
      createCard(elId, data);
    }
  
    return true;
  }
  
  // Creates a day of the 5 day forecast given the weather data and an element ID starting at 1 going through 5.
  const createCard = function(elId, data) {
    let cardEl = document.createElement('card');
    cardEl.id = `card-${elId}`;
    cardEl.className = 'day-card';
  
    // Creates a date header.
    let headerEl = document.createElement('h4');
    let timestamp = data.daily[elId].dt
    headerEl.textContent = `${getDate(timestamp)}`
    cardEl.appendChild(headerEl);
    
    // Creates a weather icon.
    let icon = data.daily[elId].weather[0].icon
    let iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`
    let imgEl = document.createElement('img');
    imgEl.className = 'forecast-icon';
    imgEl.src = iconUrl;
    cardEl.appendChild(imgEl);
  
    // Creates temperature text.
    let tempEl = document.createElement('p');
    // Averages minimum and max temperatures on particular day.
    let temp = (parseInt(data.daily[elId].temp.max) + parseInt(data.daily[elId].temp.min)) / 2
    tempEl.textContent = `Temp: ${Math.round(temp)}\u00B0 F`
    cardEl.appendChild(tempEl);
  
    // Creates wind text.
    let windEl = document.createElement('p');
    let wind = data.daily[elId].wind_speed;
    windEl.textContent = `Wind: ${Math.round(wind)} MPH`;
    cardEl.appendChild(windEl);
  
    // Creates humidity text.
    let humidityEl = document.createElement('p');
    let humidity = data.daily[elId].humidity;
    humidityEl.textContent = `Humidity: ${humidity}%`;
    cardEl.appendChild(humidityEl);
  
    let containerEl = document.getElementById('five-day-container');
    containerEl.appendChild(cardEl);
  }
  
  // Updates weather info for current day.
  const updateCurrentWeather = function(data, name, currentDate) {
  
    // Updates city name being displayed, extra spaces to separate icon.
    cityNameEl.textContent = `${name} (${currentDate})   `;
  
    // API icon for current weather conditions.
    let icon = data.current.weather[0].icon
    let iconUrl = `http://openweathermap.org/img/wn/${icon}.png`
  
    let imgTest = document.getElementById('current-weather-icon');
    // If a image element already exists it will be deleted.
    if (imgTest) {
      imgTest.remove();
    } 
    
    // create image displaying current weather status
    let imgEl = document.createElement('img');
    imgEl.className = 'weather-icon';
    imgEl.id = 'current-weather-icon'
    imgEl.src = iconUrl;
    headerContainerEl.appendChild(imgEl);
  
    // API gives us temperature in F.
    let temp = data.current.temp;
    // Updates element with temperature.
    tempEl.textContent = `Temp: ${Math.round(temp)}\u00B0 F`;
  
    // API gives wind speed in MPH.
    let wind = data.current.wind_speed;
    // Updates element with wind speed.
    windEl.textContent = `Wind: ${Math.round(wind)} MPH`;
  
    // API gives humidity in percentage.
    let humidity = data.current.humidity;
    // Updates element with humidity.
    humidityEl.textContent = `Humidity: ${humidity}%`;
  
  }
  
  // Finds current date given timezone offset from UTC in seconds.
  const getCurrentDate = function(timezoneOffset) {
  
    // Date is in UTC time.
    const today = new Date();
    // Local hour difference from UTC time, timezoneOffset is given in seconds.
    const hourDisplacement = timezoneOffset / 60 / 60
    // Checks local date compared to UTC date.
    let todayDate = undefined;
    if (today.getHours() + hourDisplacement < 0 ) {
      // If UTC timezone is a day ahead, subtract a day from the local calendar date.
      todayDate = `${today.getMonth()+1}/${today.getDate()-1}/${today.getFullYear()}`;
    } else if (today.getHours() + hourDisplacement > 23) {
      // If UTC timezone is a day behind, add a day to the local calendar date.
      todayDate = `${today.getMonth()+1}/${today.getDate()+1}/${today.getFullYear()}`;
    } else {
      // Else it's the same day.
      todayDate = `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`;
    }
    return todayDate;
  }
  
  // Gives date in dd/mm/yyyy given a unix timestamp in seconds.
  const getDate = function(timestamp) {
  
    // New date expects milliseconds, so we multiply timestamp by 1000.
    const date = new Date(timestamp * 1000);
  
    // Date formatted in dd/mm/yyyy.
    const formattedDate = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
  
    return formattedDate;
  }
  
  // Updates recent history city search local storage.
  const updateStorage = function(data, name) {
    // Create city object to be stored locally.
    let cityObj = {
      lat: data.lat,
      lon: data.lon,
      name: name
    }
  
    let savedCities = JSON.parse(localStorage.getItem('savedData'))
  
    // Checks if saved data already exists.
    if (!savedCities) {
      savedCities = [];
    }
  
    // Checks if city is already in saved history.
    for (let i=0; i < savedCities.length; i++) {
      // If city already exists, shift it to the beginning of the history.
      if (savedCities[i].name === cityObj.name) {
        savedCities.splice(i, 1)
      }
    }
  
    // Adds city to the front of the list.
    savedCities.unshift(cityObj);
  
    // If list is over 8 objects in length, gets rid of the last object.
    if (savedCities.length > 8) {
      savedCities.pop();
    }
  
    // Updates local storage.
    localStorage.setItem('savedData', JSON.stringify(savedCities))
    return true;
  }
  
  // Updates side bar containing search history.
  const updateHistory = function(data, name) {
    let savedCities = JSON.parse(localStorage.getItem('savedData'))
  
    let buttonContainer = document.getElementById('search-history');
    let containerChildrenCount = buttonContainer.childElementCount;
  
    if (containerChildrenCount > 0) {
      // Removes previous buttons by one.
      for (let i=0; i < containerChildrenCount; i++) {
        let deleteMe = document.getElementById(`saved-city-${i+1}`)
        deleteMe.remove();
      }
    }
  
    // Adds updated buttons.
    if (savedCities) {
      for (let i=0; i < savedCities.length; i++) {
        let buttonEl = document.createElement('button');
        buttonEl.type = 'button';
        buttonEl.className = 'saved-cities';
        buttonEl.id = `saved-city-${i+1}`;
        buttonEl.textContent = savedCities[i].name;
    
        buttonContainer.appendChild(buttonEl);
      }
    }
    return true;
  }
  
  const clickHandler = function(event) {
    if (event.target.type === 'button') {
      // Gets index in local storage relating to button clicked.
      let index = event.target.id.replace('saved-city-', '')
      index = parseInt(index) - 1;
  
      let storage = JSON.parse(localStorage.getItem('savedData'));
      cityObj = storage[index];
  
      getWeather(cityObj);
    }
  }
  
  submitFormEl.addEventListener('submit', generateCoordinates)
  
  searchHistoryEl.addEventListener('click', clickHandler);
  
  updateHistory();