const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

app.use(cookieSession({
  name: 'session',
  keys: ['secretKey1', 'secretKey2'],
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {};
const users = {};

//this page was created as a practice, the header was changed to to make a TinyApp logo return to home page
app.get("/home", (req, res) => {
  const userId = req.session.id;

  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };

  res.render("home", templateVars);
});

//   GET /
app.get("/", (req, res) => {
  const userId = req.session.id;

  if (!userId) {
    res.redirect('/login');
  }

  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };

  res.redirect('/urls');
});

//  GET /urls 
app.get("/urls", (req, res) => {
  const userId = req.session.id;

  const templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId]
  };

  res.render("urls_index", templateVars);
});

//   GET /urls/new
app.get("/urls/new", (req, res) => {
  const userId = req.session.id;

  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };

  res.render("urls_new", templateVars);
});

//   GET /urls/:id
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.id;
  const shortURL = req.params.shortURL;

  if (!urlsForUser(userId, urlDatabase).hasOwnProperty(shortURL)) {
    return res.status(401).send("Sorry you are not authorised");
  }

  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[userId]
  };

  res.render("urls_show", templateVars);
});

//   GET /u/:id
app.get("/u/:shortURL", (req, res) => {
  const userId = req.session.id;
  const shortURL = req.params.shortURL;

  if (!urlsForUser(userId, urlDatabase).hasOwnProperty(shortURL)) {
    return res.status(401).send("Sorry you are not authorised");
  }

  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});

//   POST /urls
app.post("/urls", (req, res) => {
  const userId = req.session.id;
  let tempShortUrl = generateRandomString();
  let longURL = req.body.longURL;

  if (!longURL.includes('http')) { 
    longURL = 'http://' + longURL;
  }

  urlDatabase[tempShortUrl] = { longURL, userId };

  res.redirect(`/urls/${tempShortUrl}`);
});

//   POST /urls/:id
app.post("/urls/:shortURL", (req, res) => {
  const longUrlChanged = req.body.longURL;
  const shortURL = req.params.shortURL;

  urlDatabase[shortURL].longURL = longUrlChanged;

  res.redirect("/urls");
});

//   POST /urls/:id/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.session.id;
  let urls = urlsForUser(userId, urlDatabase);
  const idToBeDeleted = req.params.shortURL;

  for (let url in urls) {
    if (url === idToBeDeleted) {
      delete urlDatabase[idToBeDeleted];
    }
  }

  res.redirect('/urls');
});

//   GET /login
app.get('/login', (req, res) => {
  const userId = req.session.id;
  
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };

  res.render('login', templateVars);
})

//   GET /register
app.get('/register', (req, res) => {
  const userId = req.session.id;

  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render('register', templateVars);
})

//   POST /login
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user_ID = getUserByEmail(email, users);
  let user = users[user_ID];

  if (!user) {
    return res.status(403).send("No user found.");
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (!result) {
      return res.status(403).send("Wrong password.");
    }

    req.session.id = user.id;
    res.redirect("/urls");
  })
});

//   POST /register
app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Please enter your email and password");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("The user is already registered");
  }

  let id = generateRandomString();

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      users[id] = {
        id, email,
        password: hash
      };
      req.session.id = id;
      res.redirect("/urls");
    });
  });
});

//   POST /logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});