

let apiKey = 'aa6cbc221d6a0641446e4c1089a0233f'
// let apiKey = '710a14b7ca1155280945bfbd3c9be6da'
let cnt = 5
let exclude = 'minutely,hourly,alerts'
let cDate = moment().format('MM/DD/YYYY')
let uvColor = ''

let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || []
let recent = searchHistory.length - 1
// `http://openweathermap.org/img/wn/${weatherCode}@2x.png`



document.addEventListener('click', event => {
  event.preventDefault()
  // when search button is clicked...
  if (event.target.classList.contains('btn')) {
    // grab input andprepare element to be saved to local storage and 
    let cityName = document.getElementById('search').value
    let searchElem = document.createElement('li')
    searchElem.classList.add('list-group-item')
    searchElem.classList.add('searchItem')
    searchElem.textContent = cityName
    document.getElementById('list').append(searchElem)
    // create object to add to array (local storage)
    let search = {
      city: cityName,
    }
    searchHistory.push(search)
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory))
    // clears input value
    document.getElementById('search').value = ''

    // run function to grab data and populate weather div spaces    
    getData(searchElem.textContent)
  }
  // when search history items are clicked... repopulates the weather div with previous info
  if (event.target.classList.contains('searchItem')) {
    let cityName = event.target.textContent
    getData(cityName)
  }
})

// function to reassign uvColor variable (used in class to change color of uv index)
const uvRating = (uvNumber) => {
  if (uvNumber <= 2) {
    uvColor = 'low'
  }
  else if (uvNumber <= 5) {
    uvColor = 'mod'
  }
  else if (uvNumber <= 7) {
    uvColor = 'high'
  }
  else if (uvNumber <= 10) {
    uvColor = 'very'
  }
  else if (uvNumber > 10) {
    uvColor = 'extreme'
  }
}

// primary function (grabs API data, assign variables, and populate spaces)
const getData = (cityName) => {
  let callNow = `https://api.openweathermap.org/data/2.5/weather?q=${cityName},usa&appid=${apiKey}`
  axios.get(callNow)
    .then(res => {
      // lat and lon are required for weather forecast API get
      let lat = res.data.coord.lat
      let lon = res.data.coord.lon

      // uses lon and lat to axious 5/6 day forecast get weather data
      let callForecast = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=${exclude}&appid=${apiKey}&units=imperial`

      axios.get(callForecast)
        .then(res => {
          // current weather results
          let tempNow = res.data.current.temp
          let windNow = res.data.current.wind_speed
          let humidityNow = res.data.current.humidity
          let uvNow = res.data.current.uvi
          uvRating(uvNow)
          let wCodeNow = res.data.current.weather[0]['icon']
          // populate current weather div space
          document.getElementById('current').innerHTML = `
          <h1>${cityName} <span> ${cDate}</span>
          <img src="http://openweathermap.org/img/wn/${wCodeNow}@2x.png" alt="icon">
          </h1>
          <p>Temperature: ${tempNow}\xB0F</p>
          <p>Humidity: ${humidityNow}%</p>
          <p>Wind Speed: ${windNow}MPH</p>
          <p>UV Index:  <span class="label ${uvColor}">${uvNow}</span></p>
          `

          // forecast weather results (top 5)
          for (i = 0; i < 5; i++) {
            let weatherForecast = res.data.daily[i].weather[0]
            let wCodeForecast = res.data.daily[i].weather[0]['icon']
            let tempForecast = res.data.daily[i].temp.day
            let uvForecast = res.data.daily[i].uvi
            uvRating(uvForecast)
            let humidityForecast = res.data.daily[i].humidity
            // date of each forecast
            let forecastCard = 'f' + (i + 1)
            let date = moment().add(1 + i, 'days').format('MM/DD/YYYY')
            // populate designated div for forecast info
            document.getElementById(forecastCard).innerHTML = `
          <h2>${date}</h2>
          <img src="http://openweathermap.org/img/wn/${wCodeForecast}@2x.png" alt="icon">
          <p>Temp: ${tempForecast}\xB0F</p>
          <p>Humidity: ${humidityForecast}%</p>
          `
          }
        })
        .catch(err => { alert(`No results found. Please retry search! \nYou can search by city, state or city, country`) })
    })
    .catch(err => { alert(`No results found. Please retry search! \nYou can search by city, state or city, country`) })
}

// populates weather information if previous search exists at page start/refresh
// search history will keep the most recent search item
if (recent >= 0) {
  let searchElem = document.createElement('li')
  searchElem.classList.add('list-group-item')
  searchElem.classList.add('searchItem')
  searchElem.textContent = searchHistory[recent]['city']
  document.getElementById('list').append(searchElem)

  getData(searchElem.textContent)
}