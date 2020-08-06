const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
const help = require('./helpers')

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}))

//using express to use ejs as engine
app.set("view engine", "ejs");
//converting request body to a string from a buffer. then adding data to req object
app.use(bodyParser.urlencoded({extended: true}));


//database containing short URLS and long URLS ad values
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "sample" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "sample2" },
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
	const loginAccountId = req.session.user_id;
	const accountUrls = help.urlsForUser(loginAccountId, urlDatabase);
	// console.log(accountUrls)
  const templateVars = { urls: accountUrls, user: users[loginAccountId] };
  res.render("urls_index", templateVars);
});


//page with input field to enter long URL. if not logged in redirected to loogin page
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
  	res.render("urls_new", templateVars);
  } else {
  res.redirect("/login");
}
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

// post to create the tinyURL
app.post("/urls", (req, res) => {
  const shortURL = help.generateRandomString();
  urlDatabase[shortURL] = { 'longURL': req.body.longURL, 'userID': users[req.session.user_id].id };
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
  const loginAccountId = req.session.user_id;
  const accountUrls = help.urlsForUser(loginAccountId, urlDatabase);
  const idOfAccountUrls = accountUrls[req.params.shortURL].userID
  if (loginAccountId === idOfAccountUrls) {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
  } else {
    res.status(404).json({Error: 'You do not have access to modify this URL'});
  }
});

// taking in the edit input, updating database to reflect new given long URL
// userID had to match loginID in order to edit
app.post("/urls/:shortURL", (req, res) => {
  const loginAccountId = req.session.user_id;
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
    const hashedPassword = bcrypt.hashSync(password, 10)
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = randomID;
    res.redirect('/urls');
    console.log(users);
  }	else {
    res.status(404).json({Error: 'Invalid email/Password OR email already used to register account.'});
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

// renders login page when header button is pressed.
app.post("/login", (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  const loginId = help.fetchUserIdFromDatabase(users, loginEmail)
  const dbHashedPassword = users[loginId].password
  // console.log('users object to get password', users[loginId].password)
  // const hashedLoginPassword = bcrypt.hashSync(loginPassword, 10)
  // console.log('Login Password', hashedLoginPassword)
  if (help.checkIfEmailExists(users, loginEmail) && bcrypt.compareSync(loginPassword, dbHashedPassword)) {
    const matchedId = help.fetchUserIdFromDatabase(users, loginEmail);
    req.session.user_id = matchedId;
    res.redirect("/urls");
  } else {
    res.status(403).json({Error: 'Invalid email/Password Combination'});
  }
});

//when Logout is clicked
//need to clear the user_id cookie and redirect to /urls
app.get("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});



















