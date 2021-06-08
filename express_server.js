const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomNumbers = [];
  let randomString = '';
  for(let i=0; i<=5; i++) {
    let randomNumber = Math.floor(Math.random()*61)
    randomNumbers.push(randomNumber)
  }
  for (let number of randomNumbers) {
  randomString += characters[number]
  }
  return randomString
  }

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let tempShortUrl = generateRandomString();
  let longUrl = req.body.longURL;
  urlDatabase[tempShortUrl] = longUrl;
  res.redirect(`/urls/${tempShortUrl}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
  
});

app.get("/u/:shortURL", (req, res) => {
  
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
const idToBeDeleted = req.params.shortURL;
delete urlDatabase[idToBeDeleted];

res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});