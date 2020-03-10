// var db = require("../models");
const axios = require('axios').default;
var moment = require('moment');
var request = require('ajax-request');
var $ = require('jquery')
var mysql = require("mysql");
// var inquirer = require("inquirer");
const cTable = require('console.table');
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
  // console.log("4"+GnumberofMovies);
  // numberOfMovies=numberOfMovies
  // console.log("numberofmovies"+GnumberofMovies);
  //sort the array  of the movie objects and pick out the the top ones numbered as the numberOfMovies Variable

  for (let i=1; i<chosenMovies.length; i++){
    let j=i-1;
    let tmp = chosenMovies[i];
    while(j>=0 && chosenMovies[j].movieScore < tmp.movieScore){
      // console.log("scores"+chosenMovies[j].movieScore +"otherscore"+tmp.movieScore)
      chosenMovies[j+1] = chosenMovies[j];
      j--
    }
    chosenMovies[j+1]=tmp
    
}
chosenMovies=chosenMovies.splice(0,GnumberofMovies);
chosenMovies=JSON.stringify(chosenMovies);
connection.query("INSERT INTO SearchMovieData(username,movieResults)VALUES(?,?)",[MyUserName,chosenMovies],function(err, result){
  if(err) throw err;
  console.log(result);
});
}

// for(var i=0;i<chosenMovies.length;i++){
  // console.log(chosenMovies[i].title+chosenMovies[i].movieScore);
  // connection.end();}
//   axios.post("/api/deploybuddies/"+MyUserName,{
    
//     "chosenMoviesArray":chosenMovies
//   })
//   .then(function(response){
//     console.log(response);
//   })
//   .catch(function(err){
//     console.log(err)
//   })

// }

// axios.post('/user', {
//   firstName: 'Fred',
//   lastName: 'Flintstone'
// })
// .then(function (response) {
//   console.log(response);
// })
// .catch(function (error) {
//   console.log(error);
// });



var movieSearchThree = function(){
  // console.log("3"+GnumberofMovies);
  var now = moment();
  var weekinpast=now.endOf("weeks").subtract(1,"weeks").subtract(1,"days").format("YYYY-MM-DD").toString();
  var weekinfuture=now.endOf("weeks").add(1, "weeks").subtract(1,"days").format("YYYY-MM-DD").toString();

   
   
  var queryURL= `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&primary_release_date.gte=${weekinpast}&primary_release_date.lte=${weekinfuture}&api_key=7a56247c125d9cfd74900b9921c62fc7&language=en-US`;
  // console.log(queryURL);
  

  request({
    url: queryURL,
    method: 'GET',
   
  }, function(err, res, body) {
  
    
    var results= JSON.parse(body);
    results=results.results;
    // console.log(results);
    results=results.slice(0,21);
    
    for(var i=0; i<results.length;i++){
        if(results[i].original_language==='en'){
      resultTitles.push(results[i].original_title);};
          }
      // console.log(resultTitles);

    
      //start of the operataion to search for info on each movie
    for(var i=0; i<resultTitles.length;i++){
    //for each of the fond movie titles, a query is made to collect all of the cast and crew informaiton 
      //of the collected movies
      queryURL=`http://www.omdbapi.com/?T=${resultTitles[i]}&apikey=7e6191f4`;
      // console.log(queryURL);
      axios.get(queryURL)
      .then(function(response){
        // var response=response;
        // if(response){
    //       if(response){
    //   // console.log("response")
    // }
      var response=response.data;
    

     


        var Metascore=response.Metascore
        var score=0;
        if(Metascore !=="N/A"){
          Metascore=parseFloat(Metascore)*.1;
          score+=Metascore;
        }
            
        var newFoundActorString=response.Actors;
        var newFoundDirectorString=response.Director;
        var newFoundGenreString=response.Genre;  
        var newFoundWriterString=response.Writer;
        var newFoundPoster=response.Poster;
        // console.log(score+"score");

        newFoundActorArray=newFoundActorString.split(",");
      for(i=0; i<newFoundActorArray.length; i++){
       var temp = newFoundActorArray[i].trim(" ").replace(/ *\([^)]*\) */g, "");
       newFoundActorArray[i]=temp;
      };
      // console.log("actors"+newFoundActorArray)
      newFoundDirectorArray=newFoundDirectorString.split(",");
      for(i=0; i<newFoundDirectorArray.length; i++){
       var temp = newFoundDirectorArray[i].trim(" ").replace(/ *\([^)]*\) */g, "");
       newFoundDirectorArray[i]=temp;
      }; 
      // console.log("Director"+newFoundDirectorArray)
      newFoundGenre=newFoundGenreString.split(",");
      for(i=0; i<newFoundGenre.length; i++){
       var temp = newFoundGenre[i].trim(" ").replace(/ *\([^)]*\) */g, "");
       newFoundGenre[i]=temp;
      }; 
      // console.log("Genres"+newFoundGenre)
      newFoundWriterArray=newFoundWriterString.split(",");
      for(i=0; i<newFoundWriterArray.length; i++){
       var temp = newFoundWriterArray[i].trim(" ").replace(/ *\([^)]*\) */g, "");
       newFoundWriterArray[i]=temp;
      }; 
      // console.log("writers"+newFoundWriterArray)

      // console.log("myfavactors "+favActors)
      // console.log("misc"+miscNames);


      for(var i=0;i<newFoundActorArray.length;i++){
        if(favActors.indexOf(newFoundActorArray[i])>-1){
          score+=10;
        }
      };

      for(var i=0;i<newFoundDirectorArray.length;i++){
        if(favDirectors.indexOf(newFoundDirectorArray[i])>-1){
          score+=10;
        }
      };
      for(var i=0;i<newFoundGenre.length;i++){
        if(favGenres.indexOf(newFoundGenre[i])>-1){
          score+=10;
        }
      };

      var newFoundMiscArray=newFoundWriterArray.concat(newFoundActorArray,newFoundDirectorArray,newFoundGenre);
      // console.log(newFoundMiscArray);
      for(var i=0;i<newFoundMiscArray.length;i++)
        {
          if (miscNames.indexOf(newFoundMiscArray[i])>-1){
            score++;
          }};
          // console.log(score+"newScore");

      var tomatoTitle=response.Title.replace(/ /g,"_");
      var newRottenTomatoLink = `https://www.rottentomatoes.com/m/${tomatoTitle}`;
      // console.log("score"+score);
      // console.log(response.Title);
      // console.log(newRottenTomatoLink);
      // console.log(newFoundPoster);


          var newMovieObject={
            title:response.Title,
            movieScore:score,
            poster:newFoundPoster,
            rottenTomatoLink:newRottenTomatoLink 
            
          };
          // console.log(JSON.stringify(newMoiveObject));
          chosenMovies.push(newMovieObject);

         }
        ).catch(function(err){
            console.log("ERRRS"+err);})}setTimeout(function(){
              // console.log("chosenmovies         "+JSON.stringify(chosenMovies));

            movieSearchFour();
            // cb(chosenMovies)
          },1000)
          }

)
}
 


var movieSearchTwo = function(){
  // console.log("2"+GnumberofMovies);
   
  // favActors=favActors;
  // favDirectors=favDirectors;
  // favGenres=favGenres;
  // favmovies=favMovies;
  // numberOfMovies=numberOfMovies;
  // miscNames=miscNames;
  //find the information pertaining to the user's favorite movies.
  //the information is then pushed into the miscnames array.
  for (var i=0; i<favMovies.length;i++){
  var queryURL=`http://www.omdbapi.com/?T=${favMovies[i]}&apikey=7e6191f4`;
  // console.log(queryURL);

  axios.get(queryURL)
  .then(function(response){
  
    // if(response){

  var response=response.data;
 
    // console.log(response);
      var foundActors=response.Actors;
      var foundDirectors=response.Director;
      var foundGenre=response.Genre;
      var foundWriters=response.Writer;

      foundActors=foundActors.split(",");
      for(i=0; i<foundActors.length; i++){
       var temp = foundActors[i].trim(" ").replace(/ *\([^)]*\) */g, "");
       foundActors[i]=temp;
      };
      // console.log(foundActors);
      foundDirectors=foundDirectors.split(",");
      for(i=0; i<foundDirectors.length; i++){
       var temp = foundDirectors[i].trim(" ").replace(/ *\([^)]*\) */g, "");
       foundDirectors[i]=temp;
      };
      // console.log(foundDirectors);
      foundWriters=foundWriters.split(",");
      for(i=0; i<foundWriters.length; i++){
       var temp = foundWriters[i].trim(" ").replace(/ *\([^)]*\) */g, "");
       foundWriters[i]=temp;
      };
      // console.log(foundWriters);
        foundGenre=foundGenre.split(",");
        for(i=0; i<foundGenre.length; i++){
         var temp = foundGenre[i].trim(" ").replace(/ *\([^)]*\) */g, "");
         foundGenre[i]=temp;
        };
        // console.log(foundWriters);
        //pushing the random names into the misc array
        for(i=0; i<foundWriters.length; i++){
          miscNames.push(foundWriters[i])};
        for(i=0; i<foundActors.length; i++){
         miscNames.push(foundActors[i])};  
        for(i=0; i<foundDirectors.length; i++){
          miscNames.push(foundDirectors[i])};
        for(i=0; i<foundGenre.length; i++){
          miscNames.push(foundGenre[i])};
          


      

      
      
      // ;
  }
  
  ).catch(function(err){
    console.log("ERRRS"+err);})
    } setTimeout(function(){
      // console.log(miscNames);
    // console.log(favActors,favDirectors,favGenres,favMovies);
    movieSearchThree()},1000);
  
  
}


var movieSearchOne = function(id,numberofMovies,){
MyUserName = id
 GnumberofMovies=numberofMovies;
//  console.log("1"+GnumberofMovies);

connection.query("SELECT * FROM Users WHERE username=?",MyUserName,function(err, data){
  if(err) throw err;
  // console.log(data);

    
     //pushes the hardcoded names and information into relevant arrays
    favMovies.push(data[0].movie_one, data[0].movie_two, data[0].movie_three);
    favActors.push(data[0].actor_one, data[0].actor_two, data[0].actor_three);
    favDirectors.push(data[0].director_one, data[0].director_two, data[0].director_three);
    favGenres.push(data[0].genre_one, data[0].genre_two, data[0].genre_three);
    // console.log(favActors,favDirectors,favGenres,favMovies);
    movieSearchTwo();
    // cb(chosenMovies);
  
  })};

  module.exports={
    movieSearch:movieSearchOne,
    movieSearchTwo:movieSearchTwo,
    movieSearchThree:movieSearchThree,
    movieSearchFour:movieSearchFour

    };

    
    









      
               
                  


      




