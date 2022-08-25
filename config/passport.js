const LocalStrategy = require('passport-local').Strategy;
const bycrpt = require('bcryptjs');
// const { ObjectId } = require('mongodb');

// // Load database
// const { connectToDb, getDb } = require('../db');
//
// // Connect to mongodb
// connectToDb((err) => {
//   if (!err) {
//     db = getDb()
//   }
// });


module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email'}, (email, password, done) => {
      // Match user
      db.collection('users')
      .findOne({email: email})
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered.' });
        }

        // Match password
        bycrpt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;

          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password is incorrect' });
          }
        });
      })
      .catch(err => console.log(err));
    })
  );


  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((_id, done) => {
    db.collection('users')
    .findOne({_id: _id})
    .then((err, user) => {
       done(err, true);
    })
  });
}
