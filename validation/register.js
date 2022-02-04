const Validator = require("validator"); // https://github.com/validatorjs/validator.js
const isEmpty = require("./is-empty");

module.exports.validateRegisterInput = data => {
  let errors = {};
  data.full_name = !isEmpty(data.full_name) ? data.full_name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";
  data.avatar = !isEmpty(data.avatar) ? data.avatar : "";


  if (!Validator.isLength(data.full_name, { min: 2, max: 30 })) {
    errors.full_name = "Full Name must be between 2 and 30 characters";
  }

  if (Validator.isEmpty(data.full_name)) {
    errors.full_name = "Full Name field is required";
  }
  

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password length must be between 6 and 30 characters";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm Password field is required";
  }

  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports.validateUserProfileInput = data => {
  let errors = {};
  data.full_name = !isEmpty(data.full_name) ? data.full_name : "";
  data.profile_email = !isEmpty(data.profile_email) ? data.profile_email : "";

  if (!Validator.isLength(data.full_name, { min: 2, max: 30 })) {
    errors.full_name = "Full Name must be between 2 and 30 characters";
  }

  if (Validator.isEmpty(data.full_name)) {
    errors.full_name = "Full Name field is required";
  }

  if (!Validator.isEmail(data.profile_email)) {
    errors.profile_email = "Email is invalid";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};


module.exports.validateEmail = req => {
  data = req.body;
  let errors = {};
  data.email = data.email ? data.email : "";

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
