
const getUserByEmail = (email, database) => {
  for (let id in database) {
    const user = database[id];
    if (user.email === email) {
      return id;
    }
  }
  return null;
};

const generateRandomString = function () {
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomNumbers = [];
  let randomString = '';
  for (let i = 0; i <= 5; i++) {
    let randomNumber = Math.floor(Math.random() * 61);
    randomNumbers.push(randomNumber);
  }
  for (let number of randomNumbers) {
    randomString += characters[number];
  }
  return randomString;
}

const urlsForUser = function (id, urlDatabase) {
  let URLS = {};
  for (let shortUrl in urlDatabase) {
    if (id === urlDatabase[shortUrl].userId) {
      URLS[shortUrl] = urlDatabase[shortUrl].longURL;
    }
  }
  return URLS;
};
module.exports = { getUserByEmail, generateRandomString, urlsForUser };

