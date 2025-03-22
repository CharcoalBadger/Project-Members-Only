const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const pool = require("../db/pool");

function initPassport(passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const res = await pool.query("SELECT * FROM users WHERE email = $1", [
            email,
          ]);
          const user = res.rows[0];
          if (!user)
            return done(null, false, { message: "No user with that email" });

          const match = await bcrypt.compare(password, user.password);
          if (match) return done(null, user);
          else return done(null, false, { message: "Incorrect password" });
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, res.rows[0]);
  });
}
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/auth/login");
}

function ensureMember(req, res, next) {
  if (req.user && req.user.is_member) return next();
  res.redirect("/auth/join");
}

function ensureAdmin(req, res, next) {
  if (req.user && req.user.is_admin) return next();
  res.redirect("/");
}

module.exports = {
  initPassport,
  ensureAuthenticated,
  ensureMember,
  ensureAdmin,
};
