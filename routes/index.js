var express = require('express');
var router = express.Router();
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const AuthController = require('../controllers/AuthController');

router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/auth/facebook', (req, res, next) => {
  AuthController.facebookAuth(req, res, next);
});

router.get('/auth/facebook/callback', passport.authenticate('facebook', { 
  successRedirect: '/success', 
  failureRedirect: '/' })
);

router.get('/auth/google', (req, res, next) => {
  AuthController.googleAuth(req, res, next);
})

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/success');
  });

router.get('/success', (req, res, next) => {
  res.render('success');
}); 

module.exports = router;
