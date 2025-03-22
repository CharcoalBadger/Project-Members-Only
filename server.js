const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
require("dotenv").config();

const app = express();

const { initPassport } = require("./middleware/auth");
initPassport(passport);

// Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Make the logged-in user available in all views
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
// Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));

app.listen(3000, () => console.log("Server on http://localhost:3000"));
