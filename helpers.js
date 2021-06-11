const getUserByEmail = (email, database) => {
  for (let id in database) {
    const user = database[id];
    if (user.email === email) {
      return id
    }
  }
  return null;
};

module.exports = {getUserByEmail};


const testUsers = {
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

console.log(getUserByEmail("user@example.com", testUsers))