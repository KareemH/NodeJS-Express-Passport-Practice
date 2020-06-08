const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Import/bring in the User model
const User = require("../models/User");

// Login Page
router.get("/login", (req, res) => {
  res.render("login");
});

// Register Page
router.get("/register", (req, res) => {
  res.render("register");
});

// Handle register
router.post("/register", (req, res) => {
  // Object destructuring
  const { name, email, password, password2 } = req.body;

  // Validation
  let errors = []; // This array will keep track of all possible errors messages
  // Check for required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }
  // Check if passwords match
  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }
  // Check password length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }
  // If an error message(s) does exist in the errors array
  if (errors.length > 0) {
    // Re-render register.ejs and make the user re-enter their info on the registration form
    // Pass over the data they entered to notify which fields were incorrectly submitted
    res.render("register", { errors, name, email, password, password2 });
  } else {
    // Validation success
    // In the users collection, find a user based on a given email
    User.findOne({ email: email }).then((user) => {
      // If a user exists
      if (user) {
        // An email exists on our database, so the user is previously registered
        errors.push({ msg: "Email is already registered" });
        // Re-render register.ejs and make the user re-enter their info on the registration form
        // Pass over the data they entered to notify which fields were incorrectly submitted
        res.render("register", { errors, name, email, password, password2 });
      }
      // If a user does not exist, create a new one
      else {
        // Hash the user's passowrd
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) throw err;
            // Create a new User instance and save the hashed password
            const newUser = new User({
              name: name,
              email: email,
              password: hash,
            });
            // Save the user
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered! Proceed to login"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Handle login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Handle logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
