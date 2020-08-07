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

//Function that returns all the urls in the database that have the same ID as the logged in user
// returns an object of the longURL strings from all the objects with matching Id's in the datebase.
//for example: urlsForUser('sample') returns b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'sample' }
const urlsForUser = function(id, datebase) {
  const individualLongUrls = {};
  for (let eachUrlObj in datebase) {
    if (datebase[eachUrlObj].userID === id) {
      individualLongUrls[eachUrlObj] = datebase[eachUrlObj];
    }
  }
  return individualLongUrls;
};

module.exports = {generateRandomString, fetchUserIdFromDatabase, checkIfEmailExists, urlsForUser};