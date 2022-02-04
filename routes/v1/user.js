const express = require("express");
const router = express.Router();

const UserController = require("../../controllers/user.controller");

const passport = require("passport");

require("../../middleware/passport")(passport);

// @route   POST /v1/user/register
// @desc    Register User
// @access  Public
router.post("/register", UserController.create);

// @route   GET /v1/user
// @desc    Get current user
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  UserController.get
);

// @route   GET /v1/user/details/:user_id
// @desc    Get user details by ID
// @access  Private
router.get(
  "/details/:user_id",
  passport.authenticate("jwt", { session: false }),
  UserController.getUser
);
// @route   GET /v1/user/all/:page?
// @desc    Get user details by ID
// @access  Private
router.get(
  "/all/:page?",
  passport.authenticate("jwt", { session: false }),
  UserController.getAllUser
);

// @route   PUT /v1/user
// @desc    Update current user
// @access  Private
router.put(
  "/update",
  passport.authenticate("jwt", { session: false }),
  UserController.update
);

// @route   POST /v1/user/login
// @desc    Login user
// @access  Public
router.post("/login", UserController.login);


module.exports = router;
