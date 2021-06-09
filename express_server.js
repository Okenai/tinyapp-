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
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies['user_id']
  };
  res.render("home", templateVars);
});
app.get("/", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies['user_id']
  };
  res.render("home", templateVars);
});

//the page that has a table with our urlDatabase table and possibility to edit or delete the links
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies['user_id']
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies['user_id']
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let tempShortUrl = generateRandomString();
  let longUrl = req.body.longURL;
  urlDatabase[tempShortUrl] = longUrl;
  res.redirect(`/urls/${tempShortUrl}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: req.cookies['user_id']
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

// app.post('/login', (req, res) => {
//   res.cookie('username', req.body.username);
//   const templateVars = {
//     urls: urlDatabase,
//     username: req.cookies["username"],
//   };
//   res.render("urls_index", templateVars);

// });

app.get('/register', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies['user_id']
  };
  res.render('register', templateVars)
})

app.post('/register', (req, res) => {
  let newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: req.body.email, 
    password: req.body.password
  };

  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Please enter your email and password")
  }
  
  for (let user in users) {
    if (users[user]['email'] === req.body.email) {
      return res.status(400).send("The user is already registered")
    }
    
  }
 

  res.cookie('user_id', req.body.email);
  
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies['user_id'],
  };
  res.redirect("/urls");
})

app.get('/login', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies['user_id'],
  };
  res.render('login', templateVars)
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});