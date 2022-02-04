const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const passport = require("passport");
const pe = require("parse-error");
const cors = require("cors");
const path = require("path");
const app = express();
const fileUpload = require("express-fileupload");
const fs = require("fs");
const isEmpty = require("./validation/is-empty");
const router = express.Router();

const CONFIG = require("./config/config");
const apiVersion = "v1";

/* Getting all routes - Start*/
const userRoutes = require("./routes/" + apiVersion + "/user");
/* Getting all routes - End*/

//Handling File Uploads
app.use(fileUpload());

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Passport
app.use(passport.initialize());

//Log Env
console.log("Environment:", CONFIG.app);
//DATABASE
const models = require("./models");
models.sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to SQL database:", CONFIG.db_name);
  })
  .catch((err) => {
    console.error("Unable to connect to SQL database:", CONFIG.db_name, err);
  });
if (CONFIG.app === "dev") {
  models.sequelize.sync(); //creates table if they do not already exist
  // models.sequelize.sync({ force: true });//deletes all tables then recreates them useful for testing and development purposes
}
// CORS
app.use(cors());

app.use("/" + apiVersion + "/user", userRoutes);

// @route   GET /v1
// @desc    Default route
// @access  Public
router.get("/", (req, res, next) => {
  res.json({
    status: "success",
    message: "Test APIs",
    data: { version_number: "v1.0.0" },
  });
});

// User Avatar
app.use("/user/image/:file_name?", function (req, res) {
  fileName = req.params.file_name;
  avatarPath = path.join(
    path.resolve(__dirname, "public/images/avatar-gray.jpg")
  );
  profileImgPath = path.join(
    path.resolve(__dirname, "uploads/user/" + fileName)
  );

  img =
    !fs.existsSync(profileImgPath) || isEmpty(fileName)
      ? avatarPath
      : profileImgPath;

  res.sendFile(img);
});



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // var err = new Error("Not Found");
  // err.status = 404;
  // next(err);
  res.status(404);
  res.json({
    status: "error",
    message: "404 Not found",
  });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

//This is here to handle all the uncaught promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Uncaught Error", pe(error));
});
