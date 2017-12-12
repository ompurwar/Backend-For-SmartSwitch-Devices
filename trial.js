var mongoClient = require('mongodb').MongoClient
var url = "mongodb://localhost:27017/mynode-app" //database name: mynode-app

mongoClient.connect(url, function (err, client) {
  if (err) { // throwing the err
    console.log("Sorry Couldn't connect! ('_') \nSome error occured")
    throw err
  }
  const db = client.db("mynode-app")            //Declaring a db object
  db.createCollection("user", function (err, res) {
    if (err) {                                  //Checking for the error while creating collection
      console.log('some error occured')
      throw err;                                //Throwing if any exixts
    } else {
      console.log("success!")
      var myobj = {
        "name": {                               // Creating an object to insert
          "first-name": "Om",
          "last-name": "Purwar"
        }
      }
      db.collection("user").insertOne(myobj, function (err, res) { //Inserting an objet to collection
        if (err) throw err
        else {
          console.log("object insearted")
          client.close(function () {
            console.log('connection terminated')
          })
        }
      })
    }
  })
})