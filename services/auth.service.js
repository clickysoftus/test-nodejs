const { User } = require("../models");
const validator = require("validator");
const { to, TE } = require("./util.service");

const getUniqueKeyFromBody = function(body) {
  // this is so they can send in 3 options unique_key, email, or phone and it will work
  let unique_key = body.unique_key;
  if (typeof unique_key === "undefined") {
    if (typeof body.email != "undefined") {
      unique_key = body.email;
    } else if (typeof body.phone != "undefined") {
      unique_key = body.phone;
    } else {
      unique_key = null;
    }
  }

  return unique_key;
};
module.exports.getUniqueKeyFromBody = getUniqueKeyFromBody;

const createUser = async userInfo => {
  let unique_key, auth_info, err;

  auth_info = {};
  auth_info.status = "create";

  unique_key = getUniqueKeyFromBody(userInfo);
  if (!unique_key) TE("An email or phone number was not entered.");

  if (validator.isEmail(unique_key)) {
    auth_info.method = "email";
    userInfo.email = unique_key;

    [err, user] = await to(User.create(userInfo));
    if (err) TE("User already exists with that email");

    return user;
  } else if (validator.isMobilePhone(unique_key, "any")) {
    //checks if only phone number was sent
    auth_info.method = "phone";
    userInfo.phone = unique_key;

    [err, user] = await to(User.create(userInfo));
    if (err) TE("User already exists with that phone number");

    return user;
  } else {
    TE("A valid email or phone number was not entered.");
  }
};
module.exports.createUser = createUser;

const authUser = async function(userInfo) {
  //returns token
  let unique_key;
  let auth_info = {};
  auth_info.status = "login";
  unique_key = getUniqueKeyFromBody(userInfo);

  if (!unique_key) TE("Please enter email address");

  if (!userInfo.password) TE("Please enter password");

  let user;
  if (validator.isEmail(unique_key)) {
    auth_info.method = "email";

    [err, user] = await to(
      User.findOne({
        where: { email: unique_key }
      })
    );
    if (err) TE(err.message);
  } else {
    TE("A valid email was not entered");
  }

  if (!user) TE("Invalid Email/Password");

  [err, user] = await to(user.comparePassword(userInfo.password));

  if (err) TE(err.message);

  return user;
};

module.exports.authUser = authUser;
