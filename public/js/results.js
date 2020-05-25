
var username;
var movieArray;
var movieContainer=$(".movieResultsContainer");
var buddyContainer=$(".buddyResultsContainer");
var buddyArray;


$(document).ready(function(){

    setTimeout(function(){
    // wait for 4 seconds for the search buddy and search movie functions to finish,
    //and the information saved onto the database,
    //and calls to get user data for the username.
    $.get("/api/user_data").then(function(data) {
    
    //buts the username inthe welcoming message and uses it to call database
      $(".member-name").text(data.username);
      username=data.username;
      $.ajax({
        url:"/api/movieSearchInfo/"+username,
        type:"GET"
        })
        .then(function(response){
        //parses the string into an usable array,
         movieArray=response[0].movieResults;
         movieArray=JSON.parse(movieArray);
         console.log(movieArray[1]);
         deployPosters();
        })

        $.ajax({
            url:"/api/buddySearchInfo/"+username,
            type:"GET"
        })
            .then(function(response){
            buddyArray=response[0].buddyREsults;
            buddyArray=JSON.parse(buddyArray);
            console.log(buddyArray[1]);
            deployBuddies();
            })
    })
    }, 4000)
})


//put the images associated with the movies into divs and 
//deploy the div into the container assigned

var deployPosters=function(){
    console.log(movieArray);
    for(var i=0; i<movieArray.length;i++){
        var newPoster = $("<div>");
        newPoster.addClass("posterFrame");
        var newLink = $("<a>");
        newLink.attr("href",movieArray[i].rottenTomatoLink);
        var newImage = $("<img>");
        newImage.attr("src",movieArray[i].poster);
        newImage.attr("alt","poster");
        newLink.append(newImage)
        newPoster.append(newLink);
        movieContainer.append(newPoster);}
};

//do the same thing for the found buddies array
var deployBuddies=function(){
    for(var i=0; i<buddyArray.length;i++){
        var newBuddy = $("<div>");
        newBuddy.addClass("buddyFrame");
        var newbuddyName=$("<h3>");
        newbuddyName.text("ID :"+buddyArray[i].username);
        var newbuddyscore=$("<h4>");
        newbuddyscore.text("score :"+buddyArray[i].score);
        newBuddy.append(newbuddyName);
        newBuddy.append(newbuddyscore);
        buddyContainer.append(newBuddy);}
};

