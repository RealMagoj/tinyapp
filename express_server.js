const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

function generateRandomString() {
  return Math.random().toString(20).substr(2, 6);
}

function validateUser(email, password) {
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

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const validated = validateUser(email, password);
  if (validated.error === 'User already exists.') {
    let found;
    for (const user in users) {
      if (users[user].email === email) {
        found = users[user];
      }
    }
    if (found.password === password) {
      res.cookie('user_id', found.id);
      res.redirect(`/urls`);
    } else {
      res.status(403).send("Incorrect password");
    }
  } else {
    res.status(403).send("User not found");
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const validated = validateUser(email, password);
  if (validated.success) {
    const id = generateRandomString();
    users[id] =  {
      id,
      email,
      password
    }
    res.cookie('user_id', id);
    res.redirect(`/urls`);
  } else {
    res.status(400).send(validated.error);
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]] 
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});