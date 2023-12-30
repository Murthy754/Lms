var createError = require("http-errors");
var express = require("express");
var cors = require("cors");
var path = require("path");
const chalk = require('chalk');
var logger = require("morgan");
var schedule = require("node-schedule");
//Redis for catching user
var redis = require("redis");
var client = redis.createClient();
var poll = require("./models/Poll");
var indexRouter = require("./routes/index");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cookieParser = require('cookie-parser');
const routes = require('./routes/app.routes');
const adminRoutes = require('./routes/admin.routes');

var app = express();
app.use(cors());
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(cookieParser());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require('./middlewares/responseInterceptor'));
app.use("/api", indexRouter);
app.use("/api", routes);
app.use("/api", adminRoutes);

// Switching server based env
if (process.env.server === "admin") {
  console.log(chalk.green('✓'), "Serving admin app");
  app.use('/', express.static('../admin-app/dist/browser'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('../admin-app/dist/browser/index.html'), { req });
  });
} else {
  console.log(chalk.green('✓'), "Serving client app");
  app.use('/', express.static('../html-resources/dist/browser'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('../html-resources/dist/browser/index.html'), { req });
  });
}

app.post("/uploadVideo", (req, res) => {
  // console.log(req.body.files);
  var fs = require("fs");
  var readline = require("readline");
  var { google } = require("googleapis");
  var OAuth2 = google.auth.OAuth2;
  var youtube = google.youtube("v3");
  var SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];
  var TOKEN_DIR = __dirname + "/.credentials/";
  var TOKEN_PATH = TOKEN_DIR + "youtube-nodejs-quickstart.json";
  var FILE_PATH = __dirname + "/client_secrets.json";
  fs.readFile(FILE_PATH, function processClientSecrets(err, content) {
    if (err) {
      return;
    }
    authorize(JSON.parse(content), videoinsert);
  });
  function authorize(credentials, callback) {
    var clientSecret = credentials.client_secret;
    var clientId = credentials.client_id;
	var redirectUrl = "https://counting-api.trunums.com/";
	// var redirectUrl = "http://localhost:3002/";
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {
        getNewToken(oauth2Client, callback);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        callback(oauth2Client);
      }
    });
  }
  function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES
    });
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question("Enter the code from that page here: ", function(code) {
      rl.close();
      oauth2Client.getToken(code, function(err, token) {
        if (err) {
          return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
        callback(oauth2Client);
      });
    });
  }
  function storeToken(token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != "EEXIST") {
        throw err;
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
      if (err) throw err;
    });
  }

  function videoinsert(auth) {
    var file1 = __dirname + "/mad.mp4";

    var fileStream = fs.createReadStream(file1);
    var params = {
      auth: auth,
      part: "snippet,status,id",

      resource: {
        //    kind: "youtube#channel",
        snippet: {
          title: "Carrot Title 1",
          // title: "test file",
          description: "Carrot Videos 1"
        },
        status: {
          privacyStatus: "Public"
        }
      },
      media: {
        mimeType: "video/*",
        body: fileStream
      }
    };

    youtube.videos.insert(params, function(err, result) {
      if (err) {
        // console.log(err);
        res.json(result);
      } else {
        // console.log(result);
        res.json(result);
      }
    });
  }
});




schedule.scheduleJob("0 * * * *", function() {
  poll
    .updateMany(
      { expires: { $lt: new Date() } },
      { $set: { status: "Expired" } }
    )
    .exec((err, data) => {});
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Mongo connection
require('./config/mongoose');

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  // render the error page
  res.status(err.status || 500);
  res.render("error");
  next();
});

module.exports = app;
