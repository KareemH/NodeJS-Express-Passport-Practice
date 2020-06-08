const LocalStrategy = require("passport-local").Strategy;
const mongose = require("mongoose");
const bcrypt = require("bcryptjs");

// Load User model
const User = require("./models/User");

module.exports = function (passport) {
  passport.use(
    // http://www.passportjs.org/docs/username-password/ for more explanation
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      User.findOne({ email: email }).then((user) => {
        if (!user) {
          // Null error, false user, optional message
          return done(null, false, { message: "That email is not registered" });
        }

        // Match password
        // @param password: the password the user entered
        // @param user.password: hashed password on the database
        // @param callback function: determines if there is match
        bcrypt
          .compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "The password entered is incorrect",
              });
            }
          })
          .catch((err) => console.log(err));
      });
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
