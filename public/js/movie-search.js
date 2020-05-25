const axios = require('axios').default;
var moment = require('moment');
var request = require('ajax-request');
var $ = require('jquery')
var mysql = require("mysql");
var dotenv=require("dotenv");
var connection=require("./connection");




var favMovies=[];
var favActors =[];
var favDirectors=[];
var favGenres=[];
var miscNames=[];
var chosenMovies=[];
var resultTitles=[];
var GnumberofMovies=10;
var MyUserName;

var movieSearchFour = function(){

  //perform insertion sort to find the top scoring movies
 for (let i=1; i<chosenMovies.length; i++){
    let j=i-1;
    let tmp = chosenMovies[i];
    while(j>=0 && chosenMovies[j].movieScore < tmp.movieScore){
      chosenMovies[j+1] = chosenMovies[j];
      j--
    }
    chosenMovies[j+1]=tmp
  }

//take only the top ones
chosenMovies=chosenMovies.splice(0,GnumberofMovies);
chosenMovies=JSON.stringify(chosenMovies);
//insert the result into the database
connection.query("INSERT INTO SearchMovieData(username,movieResults)VALUES(?,?)",[MyUserName,chosenMovies],function(err, result){
  if(err) throw err;
  console.log(result);
});
}





var movieSearchThree = function(){
  var now = moment();
  //calculate a period of two weeks from the tiem of search
  var weekinpast=now.endOf("weeks").subtract(1,"weeks").subtract(1,"days").format("YYYY-MM-DD").toString();
  var weekinfuture=now.endOf("weeks").add(1, "weeks").subtract(1,"days").format("YYYY-MM-DD").toString();
  //use a api call to find all of the movies that will be in theaters during the time period
   var queryURL= `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&primary_release_date.gte=${weekinpast}&primary_release_date.lte=${weekinfuture}&api_key=7a56247c125d9cfd74900b9921c62fc7&language=en-US`;
  request({
    url: queryURL,
    method: 'GET',
   }, 
  
  function(err, res, body) {
    var results= JSON.parse(body);
    results=results.results;
    results=results.slice(0,21);
    //for all of the movies found, each of the titles is pushed into an 
    //array to use for the search
    for(var i=0; i<results.length;i++){
        if(results[i].original_language==='en'){
        resultTitles.push(results[i].original_title);};
        }
     //for each of the found movie titles, a query is made to collect all of the cast and crew informaiton 
      //of the collected movies
    for(var i=0; i<resultTitles.length;i++){
       queryURL=`https://www.omdbapi.com/?T=${resultTitles[i]}&apikey=7e6191f4`;
      axios.get(queryURL)
      .then(function(response){
        var response=response.data;
        //each of the movies is scored based on its virtues
        //as well as it affinity with the user's name arrays

        //the metascore as points added
        var Metascore=response.Metascore
        var score=0;
        if(Metascore !=="N/A"){
          Metascore=parseFloat(Metascore)*.1;
          score+=Metascore;
        }
        
        //found cast and crew and movie poster
        var newFoundActorString=response.Actors;
        var newFoundDirectorString=response.Director;
        var newFoundGenreString=response.Genre;  
        var newFoundWriterString=response.Writer;
        var newFoundPoster=response.Poster;

      //organizing the names into workable arrays
      //actor array
        newFoundActorArray=newFoundActorString.split(",");
      for(i=0; i<newFoundActorArray.length; i++){
       var temp = newFoundActorArray[i].trim(" ").replace(/ *\([^)]*\) */g, "");
       newFoundActorArray[i]=temp;
      };

      //director array
      newFoundDirectorArray=newFoundDirectorString.split(",");
      for(i=0; i<newFoundDirectorArray.length; i++){
       var temp = newFoundDirectorArray[i].trim(" ").replace(/ *\([^)]*\) */g, "");
       newFoundDirectorArray[i]=temp;
      }; 

      //genre array
      newFoundGenre=newFoundGenreString.split(",");
      for(i=0; i<newFoundGenre.length; i++){
       var temp = newFoundGenre[i].trim(" ").replace(/ *\([^)]*\) */g, "");
       newFoundGenre[i]=temp;
      }; 

      //writer array
      newFoundWriterArray=newFoundWriterString.split(",");
      for(i=0; i<newFoundWriterArray.length; i++){
       var temp = newFoundWriterArray[i].trim(" ").replace(/ *\([^)]*\) */g, "");
       newFoundWriterArray[i]=temp;
      }; 
  

      //go through the actors array to find if any match with the user's fav actors
      //if so add 10 points for each match
      for(var i=0;i<newFoundActorArray.length;i++){
        if(favActors.indexOf(newFoundActorArray[i])>-1){
          score+=10;
        }
      };

      //same for the directors
      for(var i=0;i<newFoundDirectorArray.length;i++){
        if(favDirectors.indexOf(newFoundDirectorArray[i])>-1){
          score+=10;
        }
      };

      //same for genres
      for(var i=0;i<newFoundGenre.length;i++){
        if(favGenres.indexOf(newFoundGenre[i])>-1){
          score+=10;
        }
      };

      //if the user's misc array matches with any of the 
      //found name over all, one point is added
      var newFoundMiscArray=newFoundWriterArray.concat(newFoundActorArray,newFoundDirectorArray,newFoundGenre);
      for(var i=0;i<newFoundMiscArray.length;i++)
        {
          if (miscNames.indexOf(newFoundMiscArray[i])>-1){
            score++;
          }};
    //change the title of the movies into something usable by rotten tomato
    var tomatoTitle=response.Title.replace(/ /g,"_");
    var newRottenTomatoLink = `https://www.rottentomatoes.com/m/${tomatoTitle}`;
    var newMovieObject={
            title:response.Title,
            movieScore:score,
            poster:newFoundPoster,
            rottenTomatoLink:newRottenTomatoLink 
            };
          //push each of the movie objects into an array
          chosenMovies.push(newMovieObject);
         })
         .catch(function(err){
           console.log("ERRRS"+err);})}setTimeout(function(){
        //wait one second for the process to finish and we have the users array
        //then call up part four
          movieSearchFour();
          },1000)
          }

)
}
 


var movieSearchTwo = function(){
  //for each of the user's favorite movies, 
  //the cast and crew infor is found by makign an external api call
  for (var i=0; i<favMovies.length;i++){
  var queryURL=`https://www.omdbapi.com/?T=${favMovies[i]}&apikey=7e6191f4`;
  axios.get(queryURL)
  .then(function(response){
    var response=response.data;
      //taking the cast and crew names and formatting them into 
      //workable arrays
      //the arrays are pushed into a pool of names
      var foundActors=response.Actors;
      var foundDirectors=response.Director;
      var foundGenre=response.Genre;
      var foundWriters=response.Writer;
      //actor array
      foundActors=foundActors.split(",");
      for(i=0; i<foundActors.length; i++){
       var temp = foundActors[i].trim(" ").replace(/ *\([^)]*\) */g, "");
       foundActors[i]=temp;
      };
      //director array
      foundDirectors=foundDirectors.split(",");
      for(i=0; i<foundDirectors.length; i++){
       var temp = foundDirectors[i].trim(" ").replace(/ *\([^)]*\) */g, "");
       foundDirectors[i]=temp;
      };
      //writer array
      foundWriters=foundWriters.split(",");
      for(i=0; i<foundWriters.length; i++){
       var temp = foundWriters[i].trim(" ").replace(/ *\([^)]*\) */g, "");
       foundWriters[i]=temp;
      };
      //genre array
      foundGenre=foundGenre.split(",");
        for(i=0; i<foundGenre.length; i++){
         var temp = foundGenre[i].trim(" ").replace(/ *\([^)]*\) */g, "");
         foundGenre[i]=temp;
        };

        //pushing the random names into the misc names array
        for(i=0; i<foundWriters.length; i++){
          miscNames.push(foundWriters[i])};
        for(i=0; i<foundActors.length; i++){
         miscNames.push(foundActors[i])};  
        for(i=0; i<foundDirectors.length; i++){
          miscNames.push(foundDirectors[i])};
        for(i=0; i<foundGenre.length; i++){
          miscNames.push(foundGenre[i])};
  })
  .catch(function(err){
   console.log("ERRRS"+err);})

  //wait one second for the process to end and then call the third part
  }
  setTimeout(function(){
  movieSearchThree()
  },1000);
}


var movieSearchOne = function(id,numberofMovies,){
//getting the username and number of movies from the api routes
 MyUserName = id
 GnumberofMovies=numberofMovies;
//  console.log("1"+GnumberofMovies);
//search the database for the submitted userinformation
connection.query("SELECT * FROM Users WHERE username=?",MyUserName,function(err, data){
  if(err) throw err;
    //pushes the hardcoded names and information into relevant arrays
    favMovies.push(data[0].movie_one, data[0].movie_two, data[0].movie_three);
    favActors.push(data[0].actor_one, data[0].actor_two, data[0].actor_three);
    favDirectors.push(data[0].director_one, data[0].director_two, data[0].director_three);
    favGenres.push(data[0].genre_one, data[0].genre_two, data[0].genre_three);
    //afterwards phase two is called
    movieSearchTwo();
  
  })
};

  module.exports={
    movieSearch:movieSearchOne,
    movieSearchTwo:movieSearchTwo,
    movieSearchThree:movieSearchThree,
    movieSearchFour:movieSearchFour
  };

    
    









      
               
                  


      




