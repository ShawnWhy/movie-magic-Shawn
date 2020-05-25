var axios = require('axios').default;
var connection=require("./connection");
var favMovies=[];
var favActors =[];
var favDirectors=[];
var favGenres=[];
var miscNames=[];
var buddyArray=[];



//the third section of the buddy search function, takes the different awwrray information and 
//use the arrays to compare with the information submitted by other users. 
var buddySearchThree= function(){

    //get all of the user data from the users who are not rhe current user
    connection.query("SELECT * FROM Users where username !=?",MyUserName,function(err, data){
        var users = data;

        //we take each of the names submited by each of the found users, and
        //try to match it in the arrays generted by the function, 
        //if there is a match, points are added to the user.
        for(var i=0; i< users.length; i++){
             var buddyScore=0;
             if(favMovies.indexOf(users[i].movie_one)>-1){
                buddyScore+=20;
            };
            if(favMovies.indexOf(users[i].movie_two)>-1){
                buddyScore+=15;
            };
            if(favMovies.indexOf(users[i].movie_three)>-1){
                buddyScore+=10;
            };
            if(favActors.indexOf(users[i].actor_one)>-1){
                buddyScore+=20;
            };
            if(favActors.indexOf(users[i].actor_two)>-1){
                buddyScore+=15;
            };
            if(favActors.indexOf(users[i].actor_three)>-1){
                buddyScore+=10;
            };
            if(favDirectors.indexOf(users[i].director_one)>-1){
                buddyScore+=20;
            }
            if(favDirectors.indexOf(users[i].director_two)>-1){
                buddyScore+=15;
            }
            if(favDirectors.indexOf(users[i].director_three)>-1){
                buddyScore+=10;
            }
            if(favGenres.indexOf(users[i].genre_one)>-1){
                buddyScore+=5;
            }
            if(favGenres.indexOf(users[i].genre_two)>-1){
                buddyScore+=4;
            }
            if(favGenres.indexOf(users[i].genre_three)>-1){
                buddyScore+=3;
            }
            var allNamesList=[];
            allNamesList.push(users[i].actor_one,users[i].actor_two,users[i].actor_three,users[i].director_one,users[i].director_two,users[i].director_three,);
            allNamesList.push(users[i].genre_one,users[i].genre_two,users[i].genre_three);
            // console.log(allNamesList);

            if(miscNames.indexOf(allNamesList)>-1){
                buddyScore+=1;}
           
            // console.log("score =" + buddyScore);
            //each one of the names and score associated is pushed into an array 
            var buddyObject={
                username:users[i].username,
                score:buddyScore
            };
            // console.log(JSON.stringify(buddyObject)); 
            buddyArray.push(buddyObject);
        }
        setTimeout(function(){
            //a async await should have been perfromed here, but I decided to wait 
            //manually for one second for the for loops to finish, complete assembling th e
            //array of "buddies" and I am able to sort them and take the ones with the top scores.
            // console.log(buddyArray)
            for (let i=1; i<buddyArray.length; i++){
                //insertion sort
                let j=i-1;
                let tmp = buddyArray[i];
                while(j>=0 && buddyArray[j].score < tmp.score){
                  // console.log("scores"+chosenMovies[j].movieScore +"otherscore"+tmp.movieScore)
                  buddyArray[j+1] = buddyArray[j];
                  j--
                }
                buddyArray[j+1]=tmp};
            //taking the top five    
            buddyArray=buddyArray.splice(0,4);
            //stringifying the result to be put into a database
            buddyArray=JSON.stringify(buddyArray);

connection.query(
    "INSERT INTO SearchBuddyData(username,buddyREsults)VALUES(?,?)",
    [MyUserName,buddyArray],
    function(err, result){
        if(err) throw err;
        });
        },1000);


            
      
        
        }
    )

}

//second section of buddie search, the first part is below
var buddySearchTwo = function(){
    //find the information pertaining to the user's favorite movies.
    //the information is then pushed into the miscnames array.

    for (var i=0; i<favMovies.length;i++){

    //takes each movie in the favorite movie array and find the names of the cast and crew for each
    var queryURL=`https://www.omdbapi.com/?T=${favMovies[i]}&apikey=7e6191f4`;

    axios.get(queryURL)
    .then(function(response){
        var response=response.data;
            var foundActors=response.Actors;
            var foundDirectors=response.Director;
            var foundGenre=response.Genre;
            var foundWriters=response.Writer;

        //convert all of the found actor information into an array of names that can be manipulated
        foundActors=foundActors.split(",");
        for(i=0; i<foundActors.length; i++){
        //takes off all of the puncuation and assorted marks inside the array of names
         var temp = foundActors[i].trim(" ").replace(/ *\([^)]*\) */g, "");
         foundActors[i]=temp;
        };

        //convert all of the found director information into an array of names that can be manipulated
        foundDirectors=foundDirectors.split(",");
        for(i=0; i<foundDirectors.length; i++){
         var temp = foundDirectors[i].trim(" ").replace(/ *\([^)]*\) */g, "");
         foundDirectors[i]=temp;
        };

        //convert all of the found writer information into an array of names that can be manipulated
        foundWriters=foundWriters.split(",");
        for(i=0; i<foundWriters.length; i++){
         var temp = foundWriters[i].trim(" ").replace(/ *\([^)]*\) */g, "");
         foundWriters[i]=temp;
        };

        //convert all of the found genre information into an array that can be manipulated
        foundGenre=foundGenre.split(",");
        for(i=0; i<foundGenre.length; i++){
        var temp = foundGenre[i].trim(" ").replace(/ *\([^)]*\) */g, "");
        foundGenre[i]=temp;
        };
          
        // then, we pushing the random names into the misc names array
        //we can replace this whole block with the new collaps array command i think 
          for(i=0; i<foundWriters.length; i++){
            miscNames.push(foundWriters[i])};
          for(i=0; i<foundActors.length; i++){
           miscNames.push(foundActors[i])};  
          for(i=0; i<foundDirectors.length; i++){
            miscNames.push(foundDirectors[i])};
          for(i=0; i<foundGenre.length; i++){
            miscNames.push(foundGenre[i])};
        }
    
    ).catch(function(err){
      console.log("ERRRS"+err);
    })}

//probably should have used async to await for the process to finish, 
//but chose to wait one second for the process to finish before going on to part three
setTimeout(function(){
buddySearchThree()},1000);
}
  
// first section of the function to find friends by matching personages. 
 
var BuddySearchOne = function(id){
   MyUserName=id 
    //the userName is transfered from the api calls as red.body.id
    connection.query("SELECT * FROM Users WHERE username=?",MyUserName,function(err, data){
      if(err) throw err;
        //pushes the hardcoded names and information into relevant arrays
        //the array of the user's favorite movies
        favMovies.push(data[0].movie_one, data[0].movie_two, data[0].movie_three);

        //the array of the user's favorite actors
        favActors.push(data[0].actor_one, data[0].actor_two, data[0].actor_three);

        //the array of the user's favorite directors
        favDirectors.push(data[0].director_one, data[0].director_two, data[0].director_three);

        //the array of the user's favorite genres
        favGenres.push(data[0].genre_one, data[0].genre_two, data[0].genre_three);


        buddySearchTwo();
      
      })};
    
     


      module.exports={
          buddySearch:BuddySearchOne,
          buddySearchTwo:buddySearchTwo,
          buddySearchThree:buddySearchThree
          }
        