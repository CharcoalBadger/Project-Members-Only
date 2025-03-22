const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { createUser } = require("../models/user");
const pool = require("../db/pool");
const passport = require("passport");

// Show login form
router.get("/login", (req, res) => {
  res.render("login", { error: req.flash("error") });
});

// Handle login with Passport
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

// Handle logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Show the "Join the Club" form
router.get("/join", (req, res) => {
  res.render("secret_code", { error: null });
});

// Handle the form submission
router.post("/join", async (req, res) => {
  const { code } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.redirect("/auth/login");

  if (code === process.env.MEMBER_PASSCODE) {
    await pool.query(`UPDATE users SET is_member = true WHERE id = $1`, [
      userId,
    ]);
    return res.redirect("/");
  } else {
    return res.render("secret_code", { error: "Incorrect code." });
  }
});

router.get("/admin", (req, res) => {
  res.render("admin", { error: null });
});

router.post("/admin", async (req, res) => {
  const { code } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.redirect("/auth/login");

  if (code === process.env.ADMIN_PASSCODE) {
    await pool.query(`UPDATE users SET is_admin = true WHERE id = $1`, [
      userId,
    ]);
    return res.redirect("/");
  } else {
    return res.render("admin", { error: "Incorrect admin code." });
  }
});

router.get("/signup", (req, res) => {
  res.render("signup", { errors: [], formData: {} });
});

router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  const errors = [];

  // Validation
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    errors.push("All fields are required.");
  }
  if (password !== confirmPassword) {
    errors.push("Passwords do not match.");
  }
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  }

  if (errors.length > 0) {
    return res.render("signup", {
      errors,
      formData: { firstName, lastName, email },
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser({ firstName, lastName, email, hashedPassword });
    res.redirect("/auth/login");
  } catch (err) {
    console.error(err);
    errors.push("Email might already be in use.");
    res.render("signup", { errors, formData: { firstName, lastName, email } });
  }
});

module.exports = router;
