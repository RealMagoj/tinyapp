// Generate a random string

function generateRandomString() {
  return Math.random().toString(20).substr(2, 6);
}

// Retreive user data with user email address

const getUserByEmail = function(email, database) {
  let found;
  for (const user in database) {
    if (database[user].email === email) {
      found = database[user];
    }
  }
  return found;
};

// Validate user email address and password

function validateUser(email, password, users) {
  if (email === "" || password === "") {
    return { error: "Email and password must not be blank.", success: null };
  }
  for (const user in users) {
    if (users[user].email === email) {
      return { error: "User already exists.", success: null };
    }
  }
  return { error: null, success: "User registered." };
}

// Retreive user urls with user id

function urlsForUser(id, urlDatabase) {
  const urls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
}

module.exports = {
  generateRandomString,
  getUserByEmail,
  validateUser,
  urlsForUser
}