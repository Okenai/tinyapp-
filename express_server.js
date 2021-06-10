const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('./helpers')

app.use(cookieSession({
  name: 'session', 
  keys: ['secretKey1', 'secretKey2'],
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$VMlGy4Eh7cZF7vxS725x3u7Te4brjvrDCcNcP7r3G2YLUnD8rN8Se"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$ZGpGqo46bP8tGyp8ffhVOeXJfjxWNCMOqZZlAhzdNsvtauv91Bxk2"
  }
};

function generateRandomString() {
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomNumbers = [];
  let randomString = '';
  for (let i = 0; i <= 5; i++) {
    let randomNumber = Math.floor(Math.random() * 61)
    randomNumbers.push(randomNumber)
  }
  for (let number of randomNumbers) {
    randomString += characters[number]
  }
  return randomString
}

//this pages were created as a practice, the header was changed to to make a TinyApp logo return to home page
app.get("/home", (req, res) => {
  const userId = req.session.id;
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render("home", templateVars);
});
app.get("/", (req, res) => {
  const userId = req.session.id;
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render("home", templateVars);
});

const urlsForUser = function (id) {
  let URLS = {};
  for (let shortUrl in urlDatabase) {
    if (id === urlDatabase[shortUrl].userId) {
      URLS[shortUrl] = urlDatabase[shortUrl].longURL;
    }
  }
  return URLS;
};

//the page that has a table with our urlDatabase table and possibility to edit or delete the links
app.get("/urls", (req, res) => {
  const userId = req.session.id;
  const templateVars = {
    urls: urlsForUser(userId),
    user: users[userId]
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const userId = req.session.id;
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render("urls_new", templateVars);
});

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

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.id;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[userId]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);

});

app.post("/urls/:shortURL", (req, res) => {
  const longUrlChanged = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = longUrlChanged;
  res.redirect("/urls")
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.session.id;
  let urls = urlsForUser(userId);
  const idToBeDeleted = req.params.shortURL;

  for (let url in urls) {
    if (url === idToBeDeleted) {
    delete urlDatabase[idToBeDeleted]
  }}

  res.redirect('/urls')
});

app.get('/register', (req, res) => {
  const userId = req.session.id;
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render('register', templateVars)
})

app.post('/register', (req, res) => {
  let email = req.body.email
  let password = req.body.password

  if (!email || !password) {
    return res.status(400).send("Please enter your email and password")
  }

  if (getUserByEmail(email)) {
    return res.status(400).send("The user is already registered")
  }

  let id = generateRandomString();

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      users[id] = { id, email, 
        password: hash };

        req.session.id = id
      
        res.redirect("/urls");
    });
  });
});

app.get('/login', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.session.id,
  };
  res.render('login', templateVars)
})

app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let user = getUserByEmail(email);

  if (!user) {
    return res.status(403).send("No user found.")
  }
  
  bcrypt.compare(password, user.password, (err, result) => {
    if (!result) {
      return res.status(403).send("Wrong password.")
    }

    req.session.id = user.id
    res.redirect("/urls");
  }) 
})

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});