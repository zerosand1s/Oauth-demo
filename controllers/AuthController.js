const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user._id);
});
  
passport.deserializeUser((id, done) => {
    const _id = mongoose.Schema.Types.ObjectId(id);
    User.findById(_id, (err, user) => {
      done(err, user);
    });
});

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'email', 'name']
    }, (accessToken, refreshToken, profile, done) => {
        return User.getOrCreateUser('facebook', profile)
                .then((user) => {
                    done(null, user);
                })
                .catch(err => {
                    done(err);
                });
    }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
        return User.getOrCreateUser('google', profile)
            .then((user) => {
                done(null, user);
            })
            .catch(err => {
                done(err);
            });
    }
));
  
const facebookAuth = (req, res, next) => {
    passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
}

const googleAuth = (req, res, next) => {
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] })(req, res, next);
}

module.exports = {
    facebookAuth: facebookAuth,
    googleAuth: googleAuth
}