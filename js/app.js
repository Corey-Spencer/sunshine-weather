// Check for a saved location
let gpsLocation;
if(localStorage.getItem('location') === null) {
  // No saved location, set default
  gpsLocation = {
    lat: 35.705847,
    long: -83.525229
  };
} else {
  gpsLocation = JSON.parse(localStorage.getItem('location'));
}

const form = document.querySelector('#location-form');
const locationInput = document.querySelector('#location-input');

// Insert keys and remove comments
// const darkSkyKey = '';
// const mapboxKey = '';

// Get user location or use default
async function getGpsLocation() {
  return new Promise(
    (resolve, reject) => {
      if ("geolocation" in navigator) {
        // location is available
        navigator.geolocation.getCurrentPosition(function (position) {
            // Got location
            gpsLocation['lat'] = position.coords.latitude;
            gpsLocation['long'] = position.coords.longitude;
            resolve(gpsLocation);
          },
          // location available but denied
          function (error) {
            if (error.code == error.PERMISSION_DENIED)
              console.log('Location Blocked');
            resolve(gpsLocation);
          },
          // options
          {enableHighAccuracy: true, timeout: 5000, maximumAge: 10000}
          );
      } else {
        // location is not available
        console.log('Location not available');
        reject(reason);
      }
    }
  );
}
let locationData;
async function getLocationData(loc) {
  locationData = loc;
  let url;
  // If loc is a string we need to lookup data with the string
  // If loc is an object we have gps location
  if (typeof loc === 'string') {
    url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + loc + '.json?&access_token=' + mapboxKey;
  } else if (typeof loc === 'object') {
    url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + loc.long + ',' + loc.lat + '.json?access_token=' + mapboxKey;
  } else {
    return false;
  }
  
  const response = await fetch(url, {});
  return new Promise(
    (resolve, reject) => {
      if (response) {
        const json = response.json();
        resolve(json)
      } else {
        reject(reason);
      }
    }    
  )
}

async function getWeather(loc) {
  // Using cors-anywhere for api call for now
  // TODO: Build a cors-anywhere clone or workaround the cors error
  let url = 'https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/' + darkSkyKey + '/' + loc.lat + ',' + loc.long;
  const response = await fetch(url, {});
  return new Promise(
    (resolve, reject) => {
      const json = response.json();
      resolve(json)
    }
  )
}

function updateCurrent(conditions, location) {
  let cur = conditions.currently;
  let windDir = 'wi wi-wind ' + windDirection(cur.windBearing);

  // Set HTML elements to the data we got from DarkSky
  document.getElementById('location').innerHTML = location.features[0].place_name;
  document.getElementById('current-icon').className = 'wi ' + setIcon(cur.icon);
  document.getElementById('current-temp').innerHTML = Math.round(cur.temperature) + '&deg;F | Feels like: ' + Math.round(cur.apparentTemperature) + '&deg;F';
  document.getElementById('current-clouds').innerHTML = Math.round(cur.cloudCover * 100) + '% cloud cover';
  let precip = cur.precipProbability != 0? cur.precipType : 'precipitation';
  document.getElementById('current-precip').innerHTML = cur.precipProbability * 100 + '% chance of ' + precip;
  document.getElementById('current-humidity').innerHTML = 'Humidity: ' + Math.round(cur.humidity * 100) + '%';
  document.getElementById('current-wind-speed').innerHTML = 'Wind: ' + Math.round(cur.windSpeed) + 'mph' + '&nbsp;' + '<i id="current-wind-icon" class=""></i>';
  document.getElementById('current-wind-icon').className = windDir; 
  document.getElementById('minutely-summary').innerHTML = conditions.minutely.summary;
}

function updateForecast(conditions) {
  console.log('getting forecast')

  let days = conditions.daily.data;
  for (var i = 0; i < days.length; i++) {
    let day = days[i];
    // Determine day of week
    let date = new Date();
    let dow;
    let dayOfWeek;
    if (i != 0) {
      date.setDate(date.getDate() + i);
      dow = date.getDay();
      dayOfWeek = getDayOfWeek(dow);
    } else {
      dayOfWeek = 'Today';
    }
    // Set HTML elements to the data we got from DarkSky
    document.getElementById('day-' + i + '-icon').innerHTML = '<i class="wi ' + setIcon(day.icon) + '"></i>';
    document.getElementById('day-' + i + '-summary').innerHTML = dayOfWeek + ': ' + day.summary;
    document.getElementById('day-' + i + '-precip').innerHTML = Math.round(day.precipProbability * 100) + '% chance of ' + day.precipType;
    document.getElementById('day-' + i + '-temps').innerHTML = Math.round(day.temperatureHigh) + '&deg; / ' + Math.round(day.temperatureLow) + '&deg;';
  }
}

function getDayOfWeek(day) {
  let dow;
  switch (day) {
    case 0:
      dow = 'Sunday';
      break;
    case 1:
      dow = 'Monday';
      break;
    case 2:
      dow = 'Tuesday';
      break;
    case 3:
      dow = 'Wednesday';
      break;
    case 4:
      dow = 'Thursday';
      break;
    case 5:
      dow = 'Friday';
      break;
    case 6:
      dow = 'Saturday';
      break;
  };
  return dow;
}

function windDirection(deg) {
  if (deg > 348.75 && deg < 11.25) {
    return 'from-0-deg';
  } else if (deg > 11.25 && deg < 33.75) {
    return 'from-23-deg';
  } else if (deg > 33.75 && deg < 56.25) {
    return 'from-45-deg';
  } else if (deg > 56.25 && deg < 78.75) {
    return 'from-68-deg';
  } else if (deg > 78.75 && deg < 101.25) {
    return 'from-90-deg';
  } else if (deg > 101.25 && deg < 123.75) {
    return 'from-113-deg';
  } else if (deg > 123.75 && deg < 146.25) {
    return 'from-135-deg';
  } else if (deg > 146.25 && deg < 168.75) {
    return 'from-158-deg';
  } else if (deg > 168.75 && deg < 191.25) {
    return 'from-180-deg';
  } else if (deg > 191.25 && deg < 213.75) {
    return 'from-203-deg';
  } else if (deg > 213.75 && deg < 236.25) {
    return 'from-225-deg';
  } else if (deg > 236.25 && deg < 258.75) {
    return 'from-248-deg';
  } else if (deg > 258.75 && deg < 281.25) {
    return 'from-270-deg';
  } else if (deg > 281.25 && deg < 303.75) {
    return 'from-293-deg';
  } else if (deg > 303.75 && deg < 326.25) {
    return 'from-313-deg';
  } else if (deg > 326.25 && deg < 348.75) {
    return 'from-336-deg';
  } else {
    // Return N/A icon if we can't match data
    return 'wi-na'
  }
}

function setIcon(cond) {
  switch (cond) {
    case 'clear-day':
      return 'wi-forecast-io-clear-day';
      break;
    case 'clear-night':
      return 'wi-forecast-io-clear-night';
      break;
    case 'rain':
      return 'wi-forecast-io-rain';
      break;
    case 'snow':
      return 'wi-forecast-io-snow';
      break;
    case 'sleet':
      return 'wi-forecast-io-sleet';
      break;
    case 'wind':
      return 'wi-forecast-io-wind';
      break;
    case 'fog':
      return 'wi-forecast-io-fog';
      break;
    case 'cloudy':
      return 'wi-forecast-io-cloudy';
      break;
    case 'partly-cloudy-day':
      return 'wi-forecast-io-partly-cloudy-day';
      break;
    case 'partly-cloudy-night':
      return 'wi-forecast-io-partly-cloudy-night';
      break;
    case 'hail':
      return 'wi-forecast-io-hail';
      break;
    case 'thunderstorm':
      return 'wi-forecast-io-thunderstorm';
      break;
    case 'tornado':
      return 'wi-forecast-io-tornado';
      break;
  }
}

async function searchForLocation(loc) {
  try {
    // add a button to enable gps location or search
    // pass location to api & get back gps coords
    // get weather for new location
    // update DOM with new weather data
  } catch (error) {
    // Let user know we couldn't find location
    console.log(error.message);
  }
};

async function loadData() {
  try {
    let loc = await getLocationData(gpsLocation);
    let weath = await getWeather(gpsLocation);
    updateCurrent(weath, loc);
    updateForecast(weath);
  } catch (error) {
    console.log(error.message)
  }
}

async function getData() {
  try {
    let coords = await getGpsLocation();
    let locData = await getLocationData(coords);
    let weath = await getWeather(coords);

    updateCurrent(weath, locData);
    updateForecast(weath);
    console.log('locData= ' + locationData);
    
    // ---WorkFlow Layout--- //
    // ---X--- check for saved location 
      // ---X--- if saved location use that
      // ---X--- else use default location
    // get initial weather and display it
    // try to get gps location
      // if not be done
      // if we get location save to local storage and continue

    // ---Alternate Entry Point--- //
    // user searches for location
      // save gps to local storage
    
    // gather data from mapbox
    // get weather data from Dark Sky
    // update DOM with weather data


  } catch (error) {
    console.log(error.message);
  }
};

async function userInputLocation(e) {
  if(locationInput.value === '') {
    alert('Add a task');
  }
  e.preventDefault();
  // Trim extra spaces
  let searchString = locationInput.value.trim();
  // Replace spaces with '%20' required for mapbox api
  searchString = locationInput.value.replace(/ /gi, "%20");
  // Remove any characters that shouldn't be passed to api
  searchString = searchString.replace(/[,.]/gi, "");
  // Clear input
  locationInput.value = '';

  // Kick off location search
  let loc = await getLocationData(searchString);
  // Got gps need to split the string at the comma and set to gpsLocation object
  console.log('loc = ' + loc.features[0].center);
}

(async () => {
  await loadData();
  await getData();
})();

// Listen for the form to be updated
form.addEventListener('submit', userInputLocation);

// Enable collapsable boxes
document.addEventListener('DOMContentLoaded', function () {
  // var elems = document.querySelectorAll('.collapsible');
  // var instances = M.Collapsible.init(elems, {});
  M.AutoInit();
});