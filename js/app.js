// Check for a saved location
let gpsLocation;
let locationData;
if (localStorage.getItem('location') === null) {
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

// Insert key and remove comment
// TODO: Run mapbox request through proxy to avoid exposing api key
// const mapboxKey = '';

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
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 10000
          }
        );
      } else {
        // location is not available
        console.log('Location not available');
        reject(reason);
      }
    }
  );
}

async function getLocationData(loc) {
  locationData = loc;
  let url;
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
  // Using a proxy server on heroku
  let url = 'https://afternoon-castle-56771.herokuapp.com/api/v1/json?lat=' + loc.lat + '&lon=' + loc.long;
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
  let precip = cur.precipProbability != 0 ? cur.precipType : 'precipitation';

  // Set HTML elements to the data we got from DarkSky
  document.getElementById('location').innerHTML = location.features[0].place_name;
  document.getElementById('current-icon').className = 'wi ' + setIcon(cur.icon);
  document.getElementById('current-temp').innerHTML = Math.round(cur.temperature) + '&deg;F | Feels like: ' + Math.round(cur.apparentTemperature) + '&deg;F';
  document.getElementById('current-clouds').innerHTML = 'Cloud cover: ' + Math.round(cur.cloudCover * 100) + '%';
  document.getElementById('current-precip').innerHTML = 'Chance of ' + precip + ': ' + cur.precipProbability * 100 + '%';
  document.getElementById('current-humidity').innerHTML = 'Humidity: ' + Math.round(cur.humidity * 100) + '%';
  document.getElementById('current-wind-speed').innerHTML = 'Wind: ' + Math.round(cur.windSpeed) + 'mph' + '&nbsp;' + '<i id="current-wind-icon" class=""></i>';
  document.getElementById('current-wind-icon').className = windDir;
  document.getElementById('minutely-summary').innerHTML = conditions.minutely.summary;
  // UV Index 
  document.getElementById('current-uv-index-guage-title').innerHTML = 'UV Index:';
  document.getElementById('current-uv-index-guage').style.width = uvIndexPercent(cur.uvIndex) + '%';
  document.getElementById('current-uv-index-guage').className = 'determinate ' + uvIndexColor(cur.uvIndex);
  document.getElementById('current-uv-index-guage-detail').innerHTML = cur.uvIndex;

}

function updateForecast(conditions) {
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
    let precip = day.precipProbability != 0 ? day.precipType : 'precipitation';
    let precipProb = Math.round(day.precipProbability * 100);
    let humidity = Math.round(day.humidity * 100) + '%';
    let wind = 'Wind: &nbsp;&nbsp;' + Math.round(day.windSpeed) + 'mph &nbsp;&nbsp;<i class="wi wi-wind ' + windDirection(day.windBearing) + '"></i>';
    let sunDetails = 'Sunrise <i class="wi wi-sunrise"></i>&nbsp;&nbsp; ' + formatTime(day.sunriseTime) + '&nbsp;&nbsp;|&nbsp;&nbsp;Sunset <i class="wi wi-sunset"></i>&nbsp;&nbsp; ' + formatTime(day.sunsetTime);
    // Set HTML elements to the data we got from DarkSky
    // Daily Summary
    document.getElementById('day-' + i + '-icon').innerHTML = '<i class="wi ' + setIcon(day.icon) + '"></i>';
    document.getElementById('day-' + i + '-summary').innerHTML = dayOfWeek + ': ' + day.summary;
    document.getElementById('day-' + i + '-precip').innerHTML = precipProb + '% chance of ' + precip;
    document.getElementById('day-' + i + '-temps').innerHTML = Math.round(day.temperatureHigh) + '&deg; / ' + Math.round(day.temperatureLow) + '&deg;';
    // Daily expanded
    // Precipitation
    document.getElementById('day-' + i + '-precip-guage-title').innerHTML = 'Chance of ' + precip + ':';
    document.getElementById('day-' + i + '-precip-guage').style.width = precipProb + '%';
    document.getElementById('day-' + i + '-precip-guage-detail').innerHTML = precipProb + '%';
    // Humidity
    document.getElementById('day-' + i + '-humidity-guage-title').innerHTML = 'Humidity:';
    document.getElementById('day-' + i + '-humidity-guage').style.width = Math.round(day.humidity * 100) + '%';
    document.getElementById('day-' + i + '-humidity-guage-detail').innerHTML = humidity;
    // UV Index
    document.getElementById('day-' + i + '-uv-index-guage-title').innerHTML = 'UV Index:';
    document.getElementById('day-' + i + '-uv-index-guage').style.width = uvIndexPercent(day.uvIndex) + '%';
    document.getElementById('day-' + i + '-uv-index-guage').className = 'determinate ' + uvIndexColor(day.uvIndex);
    document.getElementById('day-' + i + '-uv-index-guage-detail').innerHTML = day.uvIndex;
    // Wind
    document.getElementById('day-' + i + '-wind-details').innerHTML = wind;
    // Sun
    document.getElementById('day-' + i + '-sun-details').innerHTML = sunDetails;
  }
}

function formatTime(time) {
  let date = new Date(time * 1000);
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
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

function uvIndexPercent(i) {
  if (i >= 11) {
    return 100;
  } else {
    return Math.round(i / 11 * 100);
  }
}

function uvIndexColor(i) {
  if (i < 3) {
    return 'green accent-4';
  } else if (i < 6) {
    return 'yellow accent-4';
  } else if (i < 8) {
    return 'orange accent-4';
  } else if (i < 11) {
    return 'red darken-2';
  } else {
    return 'deep-purple';
  }
};

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

async function getData(locData, coords) {
  try {
    if (!coords) {
      coords = await getGpsLocation();
    }
    if (!locData) {
      locData = await getLocationData(coords);
    }
    let weath = await getWeather(coords);

    updateCurrent(weath, locData);
    updateForecast(weath);
  } catch (error) {
    console.log(error.message);
  }
};

async function userInputLocation(e) {
  if (locationInput.value === '') {
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

  gpsLocation = {
    lat: loc.features[0].center[1],
    long: loc.features[0].center[0]
  };

  getData(loc, gpsLocation);
}

(async () => {
  await loadData();
  await getData();
})();

// Listen for the form to be updated
form.addEventListener('submit', userInputLocation);

// Enable collapsable boxes
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
});