const express = require('express');
const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const PORT = process.env.PORT || 3000;
const app = express();

// Passport config
require('./config/passport')(passport);


// EpressLayout & EJS setn up
app.use(expressLayouts);
app.set('view engine', 'ejs');



// Connect to mongodb
connectToDb((err) => {
  if (!err) {
    app.listen(PORT, () => {
      console.log(`listening on port ${PORT}`)
    })
    db = getDb()
  }
})

// Body parser
app.use(express.urlencoded({ extended: false }));
// app.use(express.json());




// 1. Epress session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));

// Passport middleware. Initialization our local Strategy needs to sit here after the session middleware.
app.use(passport.initialize());
app.use(passport.session());

// 2. Connect flash
app.use(flash());
// with these 2 pieces of middleware set up - express session + connect flash - we should now have access to req.flash.
// Now since we want different colors for different messages we need to create some global variables.

// Global vars
// We can set global variables by doing res.locals.variableName and we want to set that equal to req.flash
// because since we implemented connect-flash we have this flash object - passing in the variable name as a string.
// and then we just need to call next. Now we should be able to call success_msg and error_msg and it's going to come from flash.
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});







let errors



// GET routes
app.get('/', (req, res) => {
  res.render('welcome');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login', {
    errors,
  });
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});





// Validate register route
app.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;

  // Create array to store errors
  // what we're doing here with the error messages is simply rendering a views and passing the messages in using boostrap alerts.
  errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields.'});
    res.status(400)
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match'});
    res.status(400)
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters.'});
    res.status(400)
  }

  // Check if errors array has errors if so we render register again passing through all field vaLues along with errors
  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
     // first check if the user already exists
     db.collection('users')
     .findOne({email: email})
     .then(user => {
       if (user) {
          // if user already exists
          errors.push({ msg: 'A user has already registered with that email.'})
          res.status(409)
          res.render('register', {
             errors,
             name,
             email,
             password,
             password2
          });
        } else {
            // if user doesn't exist create new user, here we need to use bycrpt to hash our password.
            const salt = bcrypt.genSalt(10)
            .then(salt => {
               const hash = bcrypt.hash(password, salt)
                .then((hash) => {

                db.collection('users')
                .insertOne({
                   name,
                   email,
                   password: hash
                })
              })
            })
            .then(() => {
               // Now since we want a success message to be shown after a redirect we need to known as a
               // flash message which basically stores the message in a session and then displays it to
               // the user after the redirect. So we have to implement connect-flash which has it's own
               // middleware and express-session. see top.
               req.flash('success_msg', 'You are now registered and can log in.');
               // Now this takes care of creating the flash message but now we have to display it. So to do
               // that we need to head over to messages.ejs and do the same type of thing we did for the errors
               // that were passed in.
               return res.status(201).redirect('/login');
            })
            .catch(err => {
              errors.push({ msg: `Server error: ${err.message}`});
              res.status(500).redirect('/register');
            })
          }
      });
    }
});


// Login handle
app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});



// let users = [];
//
// app.get('/users', (req, res) => {
//     db.collection('users')
//     .find()
//     .sort({name: 1})
//     .forEach(user => users.push(user))
//     .then(() => {
//       res.status(200).json(users);
//     })
//     .catch(() => {
//       res.status(500).json({msg: 'could not fetch documents.'});
//     })
// });



// app.get('/users/:id', (req, res) => {
//
//   if (ObjectId.isValid(req.params.id)) {
//      db.collection('users')
//       .findOne({_id: ObjectId(req.params.id)})
//       .then(doc => {
//          res.status(200).json(doc);
//       })
//       .catch((err) => {
//         res.status(500).json({error: 'could not fetch documents.'})
//       })
//   } else {
//       res.status(500).json({error: 'document id is not valid.'})
//   }
// })
