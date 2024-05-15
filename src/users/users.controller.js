const User = require("./users.model")

async function list(req, res) {
  const users = await User.find();
  res.send(users);
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
      status: 400,
      message: `Must include a ${propertyName}`
    });
  };
}
// ***CREATE***
async function create(req, res) {
  const { data: { username, email } } = req.body;
  const newUser = new User({
    username: username,
    email: email,
  })
  await newUser.save();
  res.status(201).json({ data: newUser });
}

// ***READ, UPDATE, DESTROY***

//First find if the User exists
async function userExists(req, res, next) {
  const { userId } = req.params;
  const foundUser = await User.findOne({"_id":userId});
  if (foundUser) {
    res.locals.user = foundUser;
    return next();
  }
  next({
    status: 404,
    message: 'User id not found: ${userId}',
  });
};

//Then carry on with READ, UPDATE, and DESTROY functions

// ***READ***
function read(req, res, next) {
  res.json({ data: res.locals.user })
}

// ***UPDATE***
async function update(req, res) {
  // If the user meant to be updated was found, then the user can be retrieved from the res.locals.user object:
  const user = res.locals.user;
  const { data: { username, email} = {} } = req.body;

  // To update, assign the properties from the request to the user object and save:
  // Note: user.usernmame is coming from res.locals.user, and is being reset
  // with username from the request body object.  Same for email.
  user.username = username;
  user.email = email;
  await user.save()

  // Finally, return the updated user as a response:
  res.json({ data: user });
}

/*The destroy() function deletes a user given an id. 
The function uses Mongoose's deleteOne function User.deleteOne({ _id: userId }) 
and responds with a 204 status code.*/
async function destroy(req, res) {
  const { userId } = req.params;
  await User.deleteOne({ _id: userId });
  res.sendStatus(204);
}



// ****EXPORT****
module.exports = {
  list,
  // When POST request comes in, check to see if Username and Email exists. Then fire
  //  create().
  create: [
    bodyDataHas("username"),
    bodyDataHas("email"),
    create
  ],
  // Before reading a record, check to see if it exists, first,
  // by calling userExists(), then
  // read it by calling read().
  read: [
    userExists,
    read
  ],
  // The update function changes the values in a document. Before calling the update() function, you will first need to validate that the user exists. You will also need to validate that the request has the correct properties.
  update: [
    userExists,
    bodyDataHas("username"),
    bodyDataHas("email"),
    update
  ],
  delete: [
    userExists,
    destroy,
  ],
  userExists
};