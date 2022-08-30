const LocalStrategy = require('passport-local').Strategy;
const bycrpt = require('bcryptjs');
const { ObjectId } = require('mongodb');


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

  // take users id and stuff in cookie
  passport.serializeUser((user, done) => {
    let id = user._id;
    done(null, id);
  });

  // when browser makes request for a protected resources cookie comes back and we deserialize it and grab the user from that id
  passport.deserializeUser((id, done) => {
    if (ObjectId.isValid(id)) {
       db.collection('users')
        .findOne({_id: ObjectId(id)})
        .then(user => {
          done(null, user);
        })
    }
  });
}
