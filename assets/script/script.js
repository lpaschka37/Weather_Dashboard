$latRelay = "";
$lonRelay = "";
$getCity = "";

// Get API data
$apiKey = "6d857c70a160a0d7b1f1b5ac6ca1e354";

$buttons = $(".cityBtn");
$paintCity = $("#city");
$paintTemp = $("#temp");
$paintHumid = $("#humidity");
$paintWind = $("#wind");
$paintUVI = $("#index");
$5dforcast = $(".5dforcast");
$searchBtn = $("#searchBtn");
$searchField = $("#searchField");
$weatherReport = $("#weatherReport");

$cityArray = JSON.parse(localStorage.getItem("cities"));
// hide until populated
$5dforcast.hide();
$weatherReport.hide();

//check if array is empty if not, populate buttons from storage
if ($cityArray != null) {
  for (var i = 0; i < $cityArray.length; i++) {
    $createButton = $("<div>");
    $createButton.addClass("cityDispBtn");
    $createButton.attr("data-city", $cityArray[i]);

    var p = $("<p>").text($cityArray[i]);
    $createButton.append(p);
    console.log($createButton);
    $("#results").prepend($createButton);
  }
  weatherDisplay($cityArray[$cityArray.length - 1]);
} else {
  $cityArray = [];
}

function weatherDisplay($getCity, addCity = false) {
  $queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + $getCity +"&units=imperial&appid=" + $apiKey;

  $.ajax({
    url: $queryUrl,
    method: "GET",
    error: function (xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      alert("error, not a city" + errorMessage);
    },
    success: function (response) {
      $weatherId = response.weather[0].id;
      console.log($weatherId);
      console.log(response);
      $latRelay = response.coord.lat;
      $lonRelay = response.coord.lon;
      if (addCity) {
        $cityArray.push($getCity);
        // console.log($getCity);
        $createButton = $("<div>");
        $createButton.addClass("cityDispBtn");
        $createButton.attr("data-city", $getCity);

        var p = $("<p>").text($getCity);
        $createButton.append(p);

        $("#results").prepend($createButton);
      }
      $oneCallUrl =
        "https://api.openweathermap.org/data/2.5/onecall?lat=" +
        $latRelay +
        "&lon=" +
        $lonRelay +
        "&units=imperial" +
        "&appid=" +
        $apiKey;
      // console.log(response.name);
      $paintCity.text(response.name);
      $paintCity.append(" " + moment(response.dt, "X").format("MM/DD/YY"));
      $paintCity.append(
        '<img src="https://openweathermap.org/img/wn/' +
          response.weather[0].icon +
          '.png">'
      );

      $.ajax({
        url: $oneCallUrl,
        method: "GET",
      }).then(function (response) {
        
        var uvi = response.current.uvi;
        $paintTemp.html("Temperature: " + response.current.temp + "&deg F");
        $paintHumid.text("Humidity: " + response.current.humidity + " %");
        $paintWind.text("Wind Speed: " + response.current.wind_speed + " MPH");
        $paintUVI.text("UV Index: " + response.current.uvi);

        if (uvi <= 2) {
          $paintUVI.css("background-color", "green", "padding", "5px");
        } else if (uvi >= 3 && uvi < 5) {
          $paintUVI.css("background-color", "yellow");
        } else if (uvi >= 6 && uvi < 8) {
          $paintUVI.css("background-color", "purple");
        }

        //set up arrays for all data from the response
        $dates = [];
        $dailyIcons = [];
        $dailyTemp = [];
        $dailyHumidity = [];
        $forecastIcons = $(".icons");
        $forecastTemp = $(".forecastTemp");
        $forecastHumidty = $(".forecastHumidity");
        $forecastDate = $(".forecastDate");
        var iconUrl = "https://openweathermap.org/img/wn/";

        //for loops to iterate through arrays
        for (var i = 1; i < 6; i++) {
          $saveTemp = response.daily[i].temp.day;
          $dailyTemp.push($saveTemp);
        }

        $forecastTemp.each(function (index) {
          $(this).html("Temp : " + $dailyTemp[index] + "&deg");
        });

        for (var i = 1; i < 6; i++) {
          $saveIcons = response.daily[i].weather[0].icon;
          $dailyIcons.push($saveIcons);
        }

        console.log($dailyIcons);
        $forecastIcons.each(function (index) {
          $(this).attr("src", iconUrl + $dailyIcons[index] + ".png");
        });

        for (var i = 1; i < 6; i++) {
          $saveHumidity = response.daily[i].humidity;
          $dailyHumidity.push($saveHumidity);
        }

        $forecastHumidty.each(function (index) {
          $(this).html("Humidity : " + $dailyHumidity[index] + "&deg");
        });

        for (var i = 1; i < 6; i++) {
          $saveDate = response.daily[i].dt;
          $dateString = moment.unix($saveDate).format("MM/DD/YYYY");
          $dates.push($dateString);
        }

        $forecastDate.each(function (index) {
          $(this).text($dates[index]);
        });
        localStorage.setItem("cities", JSON.stringify($cityArray));
        $5dforcast.show();
        $weatherReport.show();
      });
    },
  });

};

//click event for search button that triggers the ajax routine
$searchBtn.on("click", function (e) {
  e.preventDefault();
  $getCity = $("#searchField").val().trim();

  weatherDisplay($getCity, true);
});

$(document).on("click", ".cityDispBtn", function (e) {
  weatherDisplay($(this).text());
});