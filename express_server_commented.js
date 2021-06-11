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

//   GET /home was created as a practice, the header was changed to to make a TinyApp logo return to home page
app.get("/home", (req, res) => {
  const userId = req.session.id;

  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };

  res.render("home", templateVars);
});

//   GET / -> redirects users to /urls page
app.get("/", (req, res) => {
  const userId = req.session.id;

  // to redirect unloged users to login page:
  if (!userId) {
    return res.redirect('/login');
  }

  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };

  res.redirect('/urls');
});

//  GET /urls -> restriction unlogged users is implemented using if in line 14 of 'urls_index.ejs'
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

//   GET /urls/:id -> restriction unlogged users is implemented using if in line 15 of 'urls_show.ejs'
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.id;
  const shortURL = req.params.shortURL;

  //to restrict loged users only view their urls
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

  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});

//   POST /urls
app.post("/urls", (req, res) => {
  const userId = req.session.id;
  let tempShortUrl = generateRandomString();
  let longURL = req.body.longURL;
// to ensure that all longURL in database contain http protocol in their url
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

  //urlsForUser function creates an object containing only urls for the logged in user
  let urls = urlsForUser(userId, urlDatabase);
  const idToBeDeleted = req.params.shortURL;

  //looping through only users urls to check if the requested url is there and is possible to delete 
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
  //to compare the hash created in POST /register with the one entered in login form (retrieved from req.body)
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
  
  //to check if email and password were entered (if req.body contains them)
  if (!email || !password) {
    return res.status(400).send("Please enter your email and password");
  }
  
  //to check if the users database already contains the email entered (retrieved from req.body)
  if (getUserByEmail(email, users)) {
    return res.status(400).send("The user is already registered");
  }

  let id = generateRandomString();

  //if the user was not found in the user database, the new user will be added to it with hased password by bcrypt and cookie will be encrypted by req.session
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