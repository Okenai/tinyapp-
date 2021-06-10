const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

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

//this feature was created as a practice, the header was changed to to make a TinyApp logo return to home page
app.get("/home", (req, res) => {
  const userId = req.cookies['id']
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render("home", templateVars);
});
app.get("/", (req, res) => {
  const userId = req.cookies['id']
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render("home", templateVars);
});

//the page that has a table with our urlDatabase table and possibility to edit or delete the links
app.get("/urls", (req, res) => {
  const userId = req.cookies['id']
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const userId = req.cookies['id']
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let tempShortUrl = generateRandomString();
  let longUrl = req.body.longURL;
  urlDatabase[tempShortUrl] = longUrl;
  res.redirect(`/urls/${tempShortUrl}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['id']
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[userId]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);

});

app.post("/urls/:shortURL", (req, res) => {
  const longUrlChanged = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longUrlChanged;
  res.redirect("/urls")
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const idToBeDeleted = req.params.shortURL;
  delete urlDatabase[idToBeDeleted];
  res.redirect('/urls')
});

app.get('/register', (req, res) => {
  const userId = req.cookies['id']
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render('register', templateVars)
})

const getUserByEmail = (email) => {
  for (let id in users) {
    const user = users[id];
    if (user.email === email) {
      return user
    }
  }
  return null;
}

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
  users[id] = { id, email, password };
 
  res.cookie('id', id);

  res.redirect("/urls");
})

app.get('/login', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies['id'],
  };
  res.render('login', templateVars)
})

app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let user = getUserByEmail(email);

  if(!user) {
   return res.status(403).send("No user found.")
  }

  if(password !== user.password) {
    return res.status(403).send("Wrong password")
  } 
 
  res.cookie('id', user.id);

  res.redirect("/urls");
})

app.post('/logout', (req, res) => {
  res.clearCookie('id')
  res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});