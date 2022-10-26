var city="";
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty= $("#humidity");
var currentWSpeed=$("#wind-speed");
var currentUvindex= $("#uv-index");
var storedCity=[];

// pulls from storage passed searches
function find(searched){
    for (var i=0; i<storedCity.length; i++){
        if(searched.toUpperCase()===storedCity[i]){
            return -1;
        }
    }
    return 1;
}

var APIKey="6b9bcab1fb0051ee03321659b70152c4";

// Display the curent and future weather to the user after grabing the city form the input text box.
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}

// Here we create the AJAX call
function currentWeather(city){
    // Here we build the URL so we can get a data from server side.
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

        console.log(response);
        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+ weathericon +"@2x.png";
        var date=new Date(response.dt*1000).toLocaleDateString();

        //parse the response for name of city and concanatig the date and icon.
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");

        // Convert the temp to fahrenheit
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2)+"&#8457");

        //Humidity
        $(currentHumidty).html(response.main.humidity+"%");

        //Wind speed and convert to MPH
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(currentWSpeed).html(windsmph+"MPH");

        // Display UVIndex using appid and coordinates 
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            storedCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(storedCity);
            if (storedCity==null){
                storedCity=[];
                storedCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(storedCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    storedCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(storedCity));
                    addToList(city);
                }
            }
        }

    });
}

    // This function returns the UVIindex response.
function UVIndex(long,lat) {
    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey + "&lat=" + lat + "&lon=" + long;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(currentUvindex).html(response.value);
            });
}
    
// Here we display the 5 days forecast for the current city.
function forecast(cityid){
    var dayover = false;
    var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            var tempK= response.list[((i+1)*8)-1].main.temp;
            var tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity= response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate" + i).html(date);
            $("#fImg" + i).html("<img src="+ iconurl +">");
            $("#fTemp" + i).html(tempF+"&#8457");
            $("#fHumidity" + i).html(humidity+"%");
        }
        
    });
}

//Daynamically add the passed city on the search history
function addToList(passed){
    var listEl= $("<li>" + passed.toUpperCase()+"</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", passed.toUpperCase());
    $(".list-group").append(listEl);
}

// display the past search again when the list group item is clicked in search history
function invokePastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}

// render function
function loadlastCity(){
    $("ul").empty();
    var storedCity = JSON.parse(localStorage.getItem("cityname"));
    if(storedCity!==null){
        storedCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<storedCity.length;i++){
            addToList(storedCity[i]);
        }
        city=storedCity[i-1];
        currentWeather(city);
    }

}

//Clear the stored data
function clearHistory(event){
    event.preventDefault();
    storedCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}


//Handlers
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);
