var db = require("../models");
var passport = require("../config/passport");
var movieSearch = require("../public/js/movie-search");
var buddySearch = require("../public/js/buddy-search")
var mysql = require("mysql");

var connection =require("../public/js/connection");

module.exports = function(app) {

  // If the user has valid login credentials, send them to the members page. Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function(req, res) {

    res.render(req.user);
  });

  // Route for signing up a user.
  // otherwise send back an error
  app.post("/api/signup", function(req, res) {
    db.User.create({
      email: req.body.email,
      password: req.body.password,
      username: req.body.username
    })
      .then(function() {
        res.redirect(307, "/api/login");
      })
      .catch(function(err) {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", function(req, res) {
   
    req.logout();
    res.redirect("/");
  })


    
  
  
  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function(req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id,
        username: req.user.username,
        movie_one:req.user.movie_one,
        movie_two:req.user.movie_two,
        movie_three:req.user.movie_three,
        actor_one:req.user.actor_one,
        actor_two:req.user.actor_two,
        actor_three:req.user.actor_three,
        director_one:req.user.director_one,
        director_two:req.user.director_two,
        director_three:req.user.director_three,
        genre_one:req.user.genre_one,
        genre_two:req.user.genre_two,
        genre_three:req.user.genre_three

        


      });
    }
  });

  // app.get("/api/userinformation/:id",function(req,res){
  //   var id=req.params.id
  //   console.log(id);
  //   db.Users.findOne({where:{username:id}}).then(function(data){ 
  //     res.json(data);

  //   })
   
  // });
  app.get("/api/movieSearchInfo/:id",function(req,res){
    var id=req.params.id;
   connection.query("SELECT * FROM SearchMovieData WHERE username=?",id,function(err,data){
     if(err) throw err;
     res.json(data);

   })

  })
  app.get("/api/buddySearchInfo/:id",function(req,res){
    var id=req.params.id;
   connection.query("SELECT * FROM SearchBuddyData WHERE username=?",id,function(err,data){
     if(err) throw err;
     res.json(data);

   })
  })

   

  app.post("/api/search/:id",function(req,res){
    var id=req.params.id;
    var numberofMovies=req.body.numberMovies;
    console.log(numberofMovies);
    movieSearch.movieSearch(id,numberofMovies);
     buddySearch.buddySearch(id);
})


   
  app.put("/api/submitUserInformation/:id", function(req, res){
    var id = req.params.id;
    console.log(id)
    db.User.update(
      {movie_one: req.body.movie_one,
        movie_two:req.body.movie_two,
        movie_three:req.body.movie_three,
        actor_one:req.body.actor_one,
        actor_two:req.body.actor_two,
        actor_three:req.body.actor_three,
        director_one:req.body.director_one,
        director_two:req.body.director_two,
        director_three:req.body.director_three,
        genre_one:req.body.genre_one,
        genre_two:req.body.genre_two,
        genre_three:req.body.genre_three},
      {where: {
        username:id
      }}
    )
    .then(function(data) {
      res.json(data)
    });
    
   })

   app.delete("/api/deleteSearch/:id",function(req,res){
     connection.query("DELETE FROM SearchBuddyData WHERE username = ?",req.params.id,function(err,result){
      if(err) throw err;
      console.log("deleted");
      connection.query("DELETE FROM SearchMovieData WHERE username =?",req.params.id,function(err,result){
        if(err) throw err;
        console.log("2deleted");
      })

     })

  

   })

  }
   
     
   
