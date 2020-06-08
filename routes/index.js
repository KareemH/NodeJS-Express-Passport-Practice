const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("welcome");
});

router.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("dashboard", { name: req.user.name });
  } else {
    req.flash("error_msg", "Please log in to view this resource");
    res.redirect("/users/login");
  }
});

module.exports = router;
