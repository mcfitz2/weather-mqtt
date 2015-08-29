// Require the module 
var Forecast = require('forecast');
var cities = require("cities");
var config = require("./config.json");
var mqtt = require("mqtt");


var client = mqtt.connect(config.broker_url);
var forecast = new Forecast({
  service: 'forecast.io',
  key: config.forcast_api_key,
  units: 'fahrenheit', // Only the first letter is parsed 
  cache: true, // Cache API requests? 
  ttl: { // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/ 
    minutes: 20,
    seconds: 0
  }
});

var weather = {};

var city = cities.zip_lookup(config.zip);
forecast.get([city.latitude, city.longitude], function (err, result) {
  if (err) return console.dir(err);
  weather = result;
  setInterval(function () {
    forecast.get([city.latitude, city.longitude], function (err, result) {
      if (err) return console.dir(err);
      weather = result;

      client.publish("/weather", JSON.stringify(weather));
      client.publish("/weather/current/temperature", String(weather.currently.temperature));
    });
  }, 1000 * 60 * 20);
});