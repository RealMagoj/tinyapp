const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const {
  generateRandomString,
  getUserByEmail,
  validateUser,
  urlsForUser
} = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// GET //

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect(`/urls`);
  } else {
    res.redirect(`/login`);
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("register", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  if (templateVars.user === undefined) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urlID: urlDatabase[req.params.shortURL].userID,
    user: users[req.session["user_id"]] 
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

// POST //

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const validated = validateUser(email, password, users);
  if (validated.error === 'User already exists.') {
    const found = getUserByEmail(email, users);
    if (bcrypt.compareSync(password, found.password)) {
      req.session.user_id = found.id;
      res.redirect(`/urls`);
    } else {
      res.render('error', { user: undefined, error_message: "Incorrect password"});
    }
  } else {
    res.render('error', { user: undefined, error_message: "User not found"});
  }
})

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
})

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const validated = validateUser(email, password, users);
  if (validated.success) {
    const id = generateRandomString();
    users[id] =  {
      id,
      email,
      password: bcrypt.hashSync(password, 10)
    }
    req.session.user_id = id;
    res.redirect(`/urls`);
  } else {
    res.render('error', { user: undefined, error_message: validated.error});
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  if (
    users[req.session["user_id"]] &&
    urlDatabase[req.params.id].userID === users[req.session["user_id"]].id
  ) {
    delete urlDatabase[req.params.id];
  }
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  if (
    users[req.session["user_id"]] &&
    urlDatabase[req.params.id].userID === users[req.session["user_id"]].id
  ) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
  }
  res.redirect(`/urls`);
});