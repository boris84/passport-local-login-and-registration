const express = require('express');
const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');
const expressLayouts = require('express-ejs-layouts');
const bcrypt = require('bcryptjs');
const PORT = process.env.PORT || 3000;
const app = express();



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
  errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields.', type: 'warning' });
    res.status(400)
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match', type: 'warning' });
    res.status(400)
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters.', type: 'warning' });
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
          errors.push({ msg: 'A user has already registered with that email.', type: 'warning' })
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
               errors.push({ msg: 'You are registered and can now login.', type: 'success' });
               return res.status(201).redirect('/login');
            })
            .catch(err => {
              errors.push({ msg: `Server error: ${err.message}`, type: 'warning'});
              res.status(500).redirect('/register');
            })
          }
      });
    }
});


app.post('/login', (req, res) => {

});
