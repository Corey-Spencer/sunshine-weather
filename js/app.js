let gpsLocation = {
  lat: 35.7271689,
  long: -83.6381007
}

// Insert keys and remove comments
// const darkSkyKey = '';
// const mapboxKey = '';

// Get user location or use default
async function getLocation() {
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

async function getLocationName(loc) {
  let url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + loc.long + ',' + loc.lat + '.json?access_token=' + mapboxKey
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

async function getData() {
  try {
    let coords = await getLocation();
    let locName = await getLocationName(coords);
    let weath = await getWeather(coords);

    updateCurrent(weath, locName);
    updateForecast(weath);
  } catch (error) {
    console.log(error.message);
  }
};

(async () => {
  await getData();
})();

// Enable collapsable boxes
document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('.collapsible');
  var instances = M.Collapsible.init(elems, {});
});