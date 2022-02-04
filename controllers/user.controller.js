const authService = require("../services/auth.service");
const {
  User,
} = require("../models");
const {
  to,
  ReE,
  ReS,
} = require("../services/util.service");
const bcrypt = require("bcrypt");
const {
  validateRegisterInput,
  validateUserProfileInput,
} = require("../validation/register");

const isImage = require("../validation/image_file");
const isEmpty = require("../validation/is-empty");
// const Sequelize = require("sequelize");
const fs = require("fs");
// const gravatar = require("gravatar");
const uniqid = require("uniqid");

const create = async (req, res) => {
  const body = req.body;

  // Validation
  const { errors, isValid } = validateRegisterInput(body);

  // Check Validation
  if (!isValid) {
    return ReE(res, errors, 400);
  }

  let err, user;

  
  [err, user] = await to(User.create(body));

  if (err) {
    return ReE(res, { email: "Email address already in used" }, 400);
  }

  return ReS(
    res,
    {
      message: "Successfully created new user.",
      user: user.toWeb(),
      token: user.getJWT(),
    },
    201
  );
};

module.exports.create = create;

const get = async (req, res) => {
  let user = req.user.toWeb();
  delete user["password"];
  return ReS(res, { user });
};

module.exports.get = get;

const getAllUser = async (req, res) => {
  page = req.params.page || 1;
  recordPerPage = 9;

  options = {
    attributes: [
      "id",
      "full_name",
      "email",
      "avatar",
      "description",
    ],
    page,
    paginate: recordPerPage,
    order: [["id", "DESC"]],
  };

  User.paginate(options)
    .then((users) => {
      allUsers = [];
      users.docs.forEach((user) => {
        allUsers.push(user.toWeb());
      });

      return ReS(
        res,
        {
          users: allUsers,
          totalRecords: users.total,
          recordPerPage,
        },
        200
      );
    })
    .catch((err) => ReE(res, "No useer found (" + err.message + ")", 400));
};

module.exports.getAllUser = getAllUser;

const getUser = async (req, res) => {
  id = parseInt(req.params.user_id) > 0 ? req.params.user_id : 0;

  if (id > 0) {
    // Get user by id
    let user = await User.findOne({
      where: { id },
    });

    if (user) {
      user = user.toWeb();
      return ReS(res, { user });
    } else {
      return ReE(res, { message: "Invalid User ID." });
    }
  } else {
    return ReE(res, { message: "User ID is required." });
  }
};

module.exports.getUser = getUser;

const update = async (req, res) => {
  let err, user, data;
  user = req.user;
  data = req.body;

  // Validation
  const { errors, isValid } = validateUserProfileInput(data);

  // Check Validation
  if (!isValid) {
    return ReE(res, errors, 400);
  }
  const profileInfo = {};
  if (req.files !== null && req.files?.avatar) {
    thisFile = req.files["avatar"];
    if (!isImage(thisFile)) {
      return ReE(res, { avatar: "Only image files are allowed!" }, 400);
    }

    if (thisFile.size / 1024 / 1024 > 5) {
      return ReE(res, { avatar: "File size can not be greater than 5MB" }, 400);
    }

    avatar =
      Date.parse(Date()) * Math.floor(Math.random() * 9999) +
      user.id +
      "." +
      thisFile.name.split(".").pop();
    if (!isEmpty(user.avatar)) {
      fs.unlink("uploads/user/" + user.avatar, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
    thisFile.mv("uploads/user/" + avatar);
    profileInfo.avatar = avatar;
  }

  profileInfo.full_name = data.full_name;
  profileInfo.email = data.profile_email;
  profileInfo.description = data.description;

  user
    .update(profileInfo)
    .then((user) => {
      userInfo = user.toWeb();
      return ReS(res, {
        token: user.getJWT(),
        user: userInfo,
        message: "Profile has been updated",
      });
    })
    .catch((err) => {
      if (err.message == "Validation error") {
        return ReE(
          res,
          { profile_email: "The email address is already in use" },
          400
        );
      } else {
        return ReE(
          res,
          {
            profile_email:
              "Could not update profile, something went wrong (" +
              err.message +
              ")",
          },
          400
        );
      }
    });
};
module.exports.update = update;

const login = async (req, res) => {
  const body = req.body;
  let err, user;

  [err, user] = await to(authService.authUser(req.body));
  if (err) return ReE(res, { lpassword: err.message }, 422);

  let userInfo = user.toWeb();
  delete userInfo["password"];
  delete userInfo["created_at"];
  delete userInfo["updated_at"];
  return ReS(res, {
    token: user.getJWT(),
    user: userInfo,
  });
};

module.exports.login = login;
