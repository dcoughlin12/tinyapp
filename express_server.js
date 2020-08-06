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
const generateRandomString = function() {
  const randomId = Math.random().toString(36).substring(2,8);
  return randomId;
};

const fetchUserIdFromDatabase = function(userObject, emailGiven) {
  for (let key in userObject) {
    if (emailGiven === userObject[key].email) {
      return key;
    }
  }
  return false;
};

//function that checks if email input on registration already exists in the database.
// returns true if email is taken
const checkIfEmailExists = function(userObject, emailGiven) {
  const matchedUserId = fetchUserIdFromDatabase(userObject, emailGiven);
  if (matchedUserId) {
    return true;
  }
  return false;
};

//function checking if given password matches password in database
//returns true if password matches
const checkIfPasswordMatches = function(userObject, passwordGiven, emailGiven) {
  const matchedUserId = fetchUserIdFromDatabase(userObject, emailGiven);
  if (passwordGiven === userObject[matchedUserId].password) {
    return true;
  }
  return false;
};

//Function that returns all the urls in the database that have the same ID as the logged in user
// returns an array of the longURL strings from all the objects with matching Id's in the datebase. 
const urlsForUser = function(id) {
	const individualLongUrls = {};
  for (let eachUrlObj in urlDatabase) {
  	if (urlDatabase[eachUrlObj].userID === id) {
  		individualLongUrls[eachUrlObj] = urlDatabase[eachUrlObj];
  	}
  }
  return individualLongUrls
};

//database containing short URLS and long URLS ad values
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "sample" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "sample2" },
};
// const urlDatabase = { OLD DATABASE STRUCTURE ONLY HERE FOR REFERENCE WHEN MAKING CHANGES. DELETE LATER
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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
};
// HOME
app.get("/", (req, res) => {
  res.send("Hello!");
});
//PORT
app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});


//Main page to view URLS
app.get("/urls", (req, res) => {
	// console.log(urlsForUser(users[req.cookies.user_id].id))
	const loginAccountId = req.cookies.user_id;
	const accountUrls = urlsForUser(loginAccountId);
	console.log(accountUrls)
  const templateVars = { urls: accountUrls, user: users[loginAccountId] };
  res.render("urls_index", templateVars);
});


//page with input field to enter long URL. if not logged in redirected to loogin page
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  if (templateVars.user) {
  	res.render("urls_new", templateVars);
  } else {
  res.redirect("/login");
}
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

// post to create the tinyURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { 'longURL': req.body.longURL, 'userID': users[req.cookies.user_id].id };
  res.redirect(`/urls/${shortURL}`);
});

// Short URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL; //// need to see if [req.params.shortURL] is correct.. dont understand the path
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
  urlDatabase[req.params.shortURL].longURL = req.body.editedURL;
  res.redirect('/urls');
});


//new template for login page
app.get("/register", (req, res) => {
  let templateVars = { user: null };
  res.render("urls_register", templateVars);
});


// moving registration info to users object database
// saving registration info to a cookie
//rediret to /urls
app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  if (req.body.email && req.body.password && !checkIfEmailExists(users, req.body.email)) {
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", randomID);
    res.redirect('/urls');
  }	else {
    res.status(404).json({Error: 'Invalid email/Password OR email already used to register account.'});
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_login", templateVars);
});

// renders login page when header button is pressed.
app.post("/login", (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  if (checkIfEmailExists(users, loginEmail) && checkIfPasswordMatches(users, loginPassword, loginEmail)) {
    const matchedId = fetchUserIdFromDatabase(users, loginEmail);
    res.cookie("user_id", matchedId);
    res.redirect("/urls");
  } else {
    res.status(403).json({Error: 'Invalid email/Password Combination'});
  }
});

//when Logout is clicked
//need to clear the user_id cookie and redirect to /urls
app.get("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});



















