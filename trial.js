var mongoClient = require('mongodb').MongoClient
var url = "mongodb://localhost:27017/mynode-app" //database name: mynode-app

mongoClient.connect(url, function (err, client) {
  if (err) { // throwing the err
    console.log("Sorry Couldn't connect! ('_') \nSome error occured")
    throw err
  }
  const db = client.db("mynode-app")
  db.createCollection("user", function (err, res) {
    if (err) {
      console.log('some error occured')
      throw err;
    } else {
      console.log("success!")
    }
    client.close(function () {
      console.log('connection terminated')
    })
  })


})