var latRelay = "";
var lonRelay = "";
var getCity = "";

// Get API data
var apiKey = "6d857c70a160a0d7b1f1b5ac6ca1e354";


//set global variables for classes and id's
var buttons = $("#cityBtn");
var searchBtn = $("#searchBtn");
var searchField = $("#searchField");
var weatherReport = $("#weatherReport");
var city = $("#city");
var setTemp = $("#temp");
var setHumid = $("#humidity");
var setWind = $("#wind");
var setUVI = $("#index");
var dforcast = $(".5dforcast");

var cityArray = JSON.parse(localStorage.getItem("cities"));
// hide until value
buttons.hide();
dforcast.hide();
weatherReport.hide();

//check if array is empty. if not populate buttons via local storage.
if (cityArray != null) {
  for (var i = 0; i < cityArray.length; i++) {
    createBtn = $("<div>");
    createBtn.addClass("cityDispBtn");
    createBtn.attr("data-city", cityArray[i]);

    var p = $("<p>").text(cityArray[i]);
    createBtn.append(p);
    console.log(createBtn);
    $("#results").prepend(createBtn);
  }
  wDisplay(cityArray[cityArray.length - 1]);
} else {
  cityArray = [];
}

function wDisplay(getCity, addCity = false) {
  var queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + getCity +"&units=imperial&appid=" + apiKey;

  $.ajax({
    url: queryUrl,
    method: "GET",
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("error, not a city" + errorMessage);
    },
    
    success: function (response) {
      weatherId = response.weather[0].id;
      console.log(weatherId);
      console.log(response);
      latRelay = response.coord.lat;
      lonRelay = response.coord.lon;
      if (addCity) {
        cityArray.push(getCity);
        // console.log(getCity);
        createBtn = $("<div>");
        createBtn.addClass("cityDispBtn");
        createBtn.attr("data-city", getCity);

        var p = $("<p>").text(getCity);
        createBtn.append(p);

        $("#results").prepend(createBtn);
      }
      oneCallUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latRelay + "&lon=" + lonRelay + "&units=imperial" + "&appid=" + apiKey;
      // console.log(response.name);
      city.text(response.name);
      city.append(" " + moment(response.dt, "X").format("MM/DD/YY"));
      city.append('<img src="https://openweathermap.org/img/wn/' + response.weather[0].icon + '.png">'
      );

      $.ajax({
        url: oneCallUrl,
        method: "GET",
      }).then(function (response) {
        
        var uvi = response.current.uvi;
        setTemp.html("Temperature: " + response.current.temp + "&deg F");
        setHumid.text("Humidity: " + response.current.humidity + "%");
        setWind.text("Wind Speed: " + response.current.wind_speed + " MPH");
        setUVI.text("UV Index: " + response.current.uvi);

        if (uvi <= 2) {
          setUVI.css("background-color", "#00e000", "padding", "25px");
        } else if (uvi >= 3 && uvi < 5) {
          setUVI.css("background-color", "#cffff00");
        } else if (uvi >= 6 && uvi < 8) {
          setUVI.css("background-color", "#ff0a0a");
        }

        //set up arrays for all data from the response
        var dates = [];
        var dailyIcons = [];
        var dailyTemp = [];
        var dailyHumidity = [];
        var forecastIcons = $(".icons");
        var forecastTemp = $(".forecastTemp");
        var forecastHumidty = $(".forecastHumidity");
        var forecastDate = $(".forecastDate");
        var iconUrl = "https://openweathermap.org/img/wn/";

        //for loops to iterate through arrays
        for (var i = 1; i < 6; i++) {
          saveTemp = response.daily[i].temp.day;
          dailyTemp.push(saveTemp);
        }

        forecastTemp.each(function (index) {
          $(this).html("Temp : " + dailyTemp[index] + "&deg");
        });

        for (var i = 1; i < 6; i++) {
          saveIcons = response.daily[i].weather[0].icon;
          dailyIcons.push(saveIcons);
        }

        console.log(dailyIcons);
        forecastIcons.each(function (index) {
          $(this).attr("src", iconUrl + dailyIcons[index] + ".png");
        });

        for (var i = 1; i < 6; i++) {
          saveHumidity = response.daily[i].humidity;
          dailyHumidity.push(saveHumidity);
        }

        forecastHumidty.each(function (index) {
          $(this).html("Humidity : " + dailyHumidity[index] + "&deg");
        });

        for (var i = 1; i < 6; i++) {
          saveDate = response.daily[i].dt;
          dateString = moment.unix(saveDate).format("MM/DD/YYYY");
          dates.push(dateString);
        }

        forecastDate.each(function (index) {
          $(this).text(dates[index]);
        });
        localStorage.setItem("cities", JSON.stringify(cityArray));
        dforcast.show();
        weatherReport.show();
      });
    },
  });

};

//click event for search button
searchBtn.on("click", function (e) {
  e.preventDefault();
  getCity = $("#searchField").val().trim();

  wDisplay(getCity, true);
});

$(document).on("click", ".cityDispBtn", function (e) {
  wDisplay($(this).text());
});