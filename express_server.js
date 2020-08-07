const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt'); //Password Hasher
const cookieSession = require('cookie-session'); //cookie encryption
const help = require('./helpers'); //helper functions in helpers.js

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

//using express to use ejs as engine
app.set("view engine", "ejs");
//converting request body to a string from a buffer. then adding data to req object
app.use(bodyParser.urlencoded({extended: true}));


//Database containing short URLS and long URLS and user ID's tagged to each. Leaving examples here for reference
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "sample" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "sample2" },
};

//Database containing user information. Leaving values here for reference.
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

//PORT
app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

// HOME.. redirects to /urls if user is logged in. Otherwise to Login page
app.get("/", (req, res) => {
  let templateVars = { user: users[req.session.userID] };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Main page to view URLS
app.get("/urls", (req, res) => {
  const loginAccountId = req.session.userID;
  const accountUrls = help.urlsForUser(loginAccountId, urlDatabase);
  // console.log(accountUrls)
  const templateVars = { urls: accountUrls, user: users[loginAccountId] };
  res.render("urls_index", templateVars);
});


//page with input field to enter long URL. if not logged in redirected to loogin page
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.userID] };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Edit Long url. can modify the long URL. have to be the account assigned to the short URL in order to access the page and make changes
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.userID] };
  const loginAccountId = req.session.userID;
  if (loginAccountId === urlDatabase[req.params.shortURL].userID) {
    res.render("urls_show", templateVars);
  } else {
    res.status(404).json({Error: 'You do not have access to modify this URL'});
  }
});

// post to create the tinyURL
app.post("/urls", (req, res) => {
  const shortURL = help.generateRandomString();
  urlDatabase[shortURL] = { 'longURL': req.body.longURL, 'userID': users[req.session.userID].id };
  res.redirect(`/urls/${shortURL}`);
});

// Short URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//use shortURL to delete URL from database object
//redurect to list of URL
// userID had to match loginID in order to delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const loginAccountId = req.session.userID;
  const accountUrls = help.urlsForUser(loginAccountId, urlDatabase);
  const idOfAccountUrls = accountUrls[req.params.shortURL].userID;
  if (loginAccountId === idOfAccountUrls) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(404).json({Error: 'You do not have access to modify this URL'});
  }
});

// taking in the edit input, updating database to reflect new given long URL
// userID has to match loginID in order to edit
app.post("/urls/:shortURL", (req, res) => {
  const loginAccountId = req.session.userID;
  if (loginAccountId === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.editedURL;
    res.redirect('/urls');
  } else {
    res.status(404).json({Error: 'You do not have access to modify this URL'});
  }
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
  const randomID = help.generateRandomString();
  if (req.body.email && req.body.password && !help.checkIfEmailExists(users, req.body.email)) {
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.userID = randomID;
    res.redirect('/urls');
  }	else {
    res.status(404).json({Error: 'Invalid email/Password OR email already assigned to an account.'});
  }
});

// Login Render
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.userID] };
  res.render("urls_login", templateVars);
});

// renders login page when header button is pressed.
app.post("/login", (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  const loginId = help.fetchUserIdFromDatabase(users, loginEmail);
  if (!loginId) {
    res.status(403).json({Error: 'Invalid email/Password Combination'});
  }
  const dbHashedPassword = users[loginId].password;
  if (help.checkIfEmailExists(users, loginEmail) && bcrypt.compareSync(loginPassword, dbHashedPassword)) {
    const matchedId = help.fetchUserIdFromDatabase(users, loginEmail);
    req.session.userID = matchedId;
    res.redirect("/urls");
  } else {
    res.status(403).json({Error: 'Invalid email/Password Combination'});
  }
});

//when Logout is clicked
//Need to set cookie as null with Session
app.get("/logout", (req, res) => {
  req.session.userID = null;
  res.redirect('/urls');
});



















