function generateRandomString() {
  return Math.random().toString(20).substr(2, 6);
}

const getUserByEmail = function(email, database) {
  let found;
  for (const user in database) {
    if (database[user].email === email) {
      found = database[user];
    }
  }
  return found;
};

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