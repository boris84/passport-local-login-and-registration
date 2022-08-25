const { MongoClient } = require('mongodb')
require('dotenv').config();

let dbConnection

module.exports = {
  connectToDb: (cb) => {
    // atlas connection string
    MongoClient.connect(process.env.localConnectionString)
     .then((client) => {
       dbConnection = client.db()
       console.log('connected to mongodb..');
       return cb()
     })
     .catch(err => {
       console.log(err)
       return cb(err)
     })
  },
  getDb: () => dbConnection
}
