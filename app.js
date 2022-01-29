//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");

const app = express();

// console.log(md5("1"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(session({
  secret: "my lover lover.",
  resave: false,
  cookie: {
    secure: true
  },
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/learnDB", {
  useNewUrlParser: true
});
// Remove the deprication // WARNING:
// mongoose.set("useCreateIndex", true);

//enviromental variables
// console.log(process.env.API_KEY);
// Create a Schema for the data
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  secrets: String
});

//#insert passport plugin to tap into userSchema
userSchema.plugin(passportLocalMongoose);

//#userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields: ["password"]});
const User = new mongoose.model("User", userSchema);

//#authenticate using create strategy
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Render Home Page!!!
app.get("/", function(req, res) {
  res.render("home");
});

// login Route
app.get("/login", function(req, res) {
  res.render("login");
});

//register route
app.get("/register", function(req, res) {
  res.render("register");
});

// Secrets Route
app.get("/secrets", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
    // console.log(req.body);
  }
});

// Secrets Route
app.get("/submit", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/submit");
  } else {
    res.render("submit");

  }
});

// Post route
app.post("/submit", function(req, res){
  const submittedSecret = req.body.secret;
  console.log(req.body.secrets);
  User.findById(req.body.secrets, (err, foundUser) => {
    if (err){
      console.log(err);
    }else{
      if (foundUser){
      //  foundUser.secret = submittedSecret;
        foundUser.save();
        res.redirect("/secrets");
      }
    }
  });
});

// Post Route
app.post("/register", function(req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
        passport.authenticate("local")(req, res, function() {
        res.render("secrets");
      });
    }
  });

});


app.post("/login", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        if(err){
          console.log(err);
        }else{
      res.render("secrets");
    }
        });
    }
  });
  //  return res.redirect('/users/' + req.user.username);
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.listen(3000, (req, res) => {
  console.log("listening...");
});


// const username = req.body.username;
// const password = req.body.password;

// User.findOne({email:username}, function(err, foundUser){
//    if(err){
//      console.log(err);
//    }else{
//      if(foundUser){
//        bcrypt.compare(password, foundUser.password, function(err, result) {
//              if(result === true){
//                res.render("secrets");
//            }
//    });
//    }
//    }
//  });


// Register Route





// bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//    const newUser = new User({
//    email: req.body.username,
//    password: hash
//password: md5(req.body.password)
//  });
//  newUser.save(function(err){
//    if (err){
//      console.log(err);
//    }else{
//      res.render("secrets");
//    }
//  });
// Store hash in your password DB.
//});
