var username="";
var password="";
var userInformation={};
var movieone= $(".movie-one");
var movieTwo = $(".movie-two");
var movieThree = $(".movie-three");
var actorone = $(".actor-one");
var actorTwo = $(".actor-two");
var actorThree = $(".actor-three");
var directorOne = $(".director-one");
var directortwo = $(".director-two");
var directorthree = $(".director-three");
var genreOne = $("#genre-1");
var genreTwo = $("#genre-2");
var genreThree = $("#genre-3");
var searchable=$(".searchable");
var numberOfMovies=$("#searchNumber");
var posterContainer=$(".posterContainer")


//sets up the posters uptop by using the 
//userinformation previousely called at page start
var setupHomePage=function(data){
  var movieArray=[];
  var moviePosterArray=[];
  //sets up an array of the user's three favorite movies
  movieArray.push(data.movie_one);
  movieArray.push(data.movie_two);
  movieArray.push(data.movie_three);

  //for each of the movies in the array , find the poster associated with it
  //using an external api call
  for(var i=0;i<movieArray.length;i++){
    queryURL=`https://www.omdbapi.com/?T=${movieArray[i]}&apikey=7e6191f4`;
    $.ajax({
          url:queryURL,
          type:"GET"
      })
      .then(function(response){
    moviePosterArray.push(response.Poster);});}
    //wait a second for the process to end and then set up the posters 
    //as images in fivs
    setTimeout(function(){
  //  console.log(moviePosterArray)
    for(var i=0; i<moviePosterArray.length;i++){
    var newPoster = $("<div>");
    newPoster.addClass("posterFrame");
    var newImage = $("<img>");
    newImage.attr("src",moviePosterArray[i]);
    newImage.attr("alt","poster");
    newPoster.append(newImage);
    posterContainer.append(newPoster);}
  },1000);}

//initial page setup
$(document).ready(function(){
//the search button does not appear if no info is submitted
$(".searchForm").attr("style","visibility:collapse");

  //get the username and its data from the user object
  $.get("/api/user_data").then(function(data){
    // setup the welcome message with the username
    $(".member-name").text(data.username);
    username=data.username;
    password=data.password; 
    //deletes the info from previous searches before one can commence this one
    $.ajax({
      url:"/api/deleteSearch/"+username,
      type:"DELETE",
      success:function(result){
        console.log("result"+result)}
      })
    // console.log(data);
      //if the user has submitted any movie information, the search function 
      //will appear and the function to set up the posters is called
    if(data.movie_one||data.movie_two||data.movie_three){
      $(".searchForm").attr("style","visibility:visible")
      setupHomePage(data);
    }
  })   
});

  
  //submits all of the input information into a mysql database
  var handleSubmit=  function(event){
  event.preventDefault();
  event.stopPropagation();
  // console.log(movieOne.val());
   userInformation= 
    {
      "movie_one":movieone.val(),
      "movie_two":movieTwo.val(),
      "movie_three":movieThree.val(),
      "actor_one":actorone.val(),
      "actor_two":actorTwo.val(),
      "actor_three":actorThree.val(),
      "director_one":directorOne.val(),
      "director_two":directortwo.val(),
      "director_three":directorthree.val(),
      "genre_one":genreOne.val(),
      "genre_two":genreTwo.val(),
      "genre_three":genreThree.val(),
      "searchable":searchable.val(),
    };
  // console.log(userInformation);
  $.ajax({
    url:"/api/submitUserInformation/"+username,
    type:"put",
    data:userInformation
})
  .then(function(data){
    console.log(username + password);

    //this gives updates a seudo userinformation object to be used for 
    //the current session without logging in or out
    $.ajax({
      url:"/api/relogin",
      type:"post",
      data:{
      username:username,
      password:password,
      "movie_one":userInformation.movie_one,
      "movie_two":userInformation.movie_two,
      "movie_three":userInformation.movie_three,
      "actor_one":userInformation.actor_one,
      "actor_two":userInformation.actor_two,
      "actor_three":userInformation.actor_three,
      "director_one":userInformation.director_one,
      "director_two":userInformation.director_two,
      "director_three":userInformation.director_three,
      "genre_one":userInformation.genre_one,
      "genre_two":userInformation.genre_two,
      "genre_three":userInformation.genre_three,
      "searchable":userInformation.searchable},
      })
      .then(function(data){
        // console.log("updated");
        // console.log(data);
          location.reload();
      })
     })
    }

  

 
//submit button click 
$(".submitButton").on("click",handleSubmit);

//makes oneself searchable
$(".searchable").on('change', function(){
  if ($(this).is(':checked')){
    $(this).attr('value', 'true');
  } else {
    $(this).attr('value', 'false');
  }
});

//the function for searching for both movies and buddies
var handleSearch=function(event){
  event.stopPropagation;
  event.preventDefault;
  numberOfMovies=numberOfMovies.val();
  console.log(numberOfMovies);
  $.ajax({
    url:"/api/search/"+username,
    type:"post",
    data:{"numberMovies":numberOfMovies}
  })
  .then(function(){
    console.log("searching");
    location.replace("/results");
  })
  }   

//click event for search
$("#searchButton").on("click",handleSearch);


