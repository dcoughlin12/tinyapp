const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


app.use(cookieParser());
//using express to use ejs as engine
app.set("view engine", "ejs");
//converting request body to a string from a buffer. then adding data to req object
app.use(bodyParser.urlencoded({extended: true}));

//random 6 digit generator
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}
//database containing short URLS and long URLS ad values
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//darabase containing user information
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//shows JSON string of the dtabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: req.cookies.user_id };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: req.cookies.user_id };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: req.cookies.user_id };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // consle.log(req.body);  // Log the POST request body to the console
  // res.send("Ok!!!");         // Respond with 'Ok' (we will replace this)
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Short URL
app.get("/u/:shortURL", (req, res) => {
  // console.log(req)
  const longURL = urlDatabase[req.params.shortURL]; //// need to see if [req.params.shortURL] is correct.. dont understand the path
  res.redirect(longURL);
});

//use shortURL to delete URL from database object
//redurect to list of URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// taking in the edit input, updating database to reflect new given long URL
app.post("/urls/:shortURL", (req, res) => {
  // console.log('in edit route');
  urlDatabase[req.params.shortURL] = req.body.editedURL;
  res.redirect('/urls');
});

//set a cookie named username to the value submitted in the request body via the login form.
//After our server has set the cookie...
// Redirect the browser back to the /urls page.
app.post("/login", (req, res) => {
  // res.cookie('username', req.body.login);
  // console.log(req.cookies);
  // console.log(req.body.login)// this is the username.
  res.redirect('/urls');
});

//when Logout is clicked
//need to clear the username cookie and redirect to /urls
app.post("/logout", (req, res) => {
  // res.clearCookie('username');
  res.redirect('/urls');
});

//new template for login page
app.get("/register", (req, res) => {
	let templateVars = { user: req.cookies.user_id };
	res.render("urls_register", templateVars);
});

// moving registration info to users object database
// saving registration info to a cookie
//rediret to /urls
app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  users[randomID] = { 
  	id: randomID,
  	email: req.body.email, 
  	password: req.body.password
  }	
  // console.log(users[randomID])
  res.cookie("user_id", users[randomID]);
  res.redirect('/urls');
})


















