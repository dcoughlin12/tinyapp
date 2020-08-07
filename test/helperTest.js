const { assert } = require('chai');

const { checkIfEmailExists } = require('../helpers.js');

const testUsers = {
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

describe('checkIfEmailExists', function() {
  it('should return true with valid email', function() {
    const user = checkIfEmailExists(testUsers, "user@example.com");
    const expectedOutput = true;
  });
  it('returns false when given an email that is not in database', () => {
    let result = checkIfEmailExists(testUsers, "fake@email.com");
    assert.strictEqual(result, false);
  });
  it('returns false when given an empty string', () => {
    let result = checkIfEmailExists(testUsers, "");
    assert.strictEqual(result, false);
  });
});