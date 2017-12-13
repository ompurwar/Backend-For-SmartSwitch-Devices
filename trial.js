const mongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/mynode-app" //database name: mynode-app
const bodyParser=require("body-parser")

const express = require("express")
const app=express()
//setting up the server
const server = app.listen(1245, function(){console.log("listening to the port\t:"+ server.address().port)})

app.use(function(req, res, next){ res.setHeader('Access-Control-Allow-Credentials', true); next()})
app.use(bodyParser.json())

mongoClient.connect(url, function (err, client) {
  if (err) { // throwing the err
    console.log("Sorry Couldn't connect! ('_') \nSome error occured")
    throw err
  } else {
    const db = client.db("mynode-app") //Declaring a db object
    db.createCollection("user", function (err, res) {
      if (err) { //Checking for the error while creating collection
        console.log('some error occured')
        throw err; //Throwing if any exixts
      } else {

        console.log("success!")

        var myobj = {
          "name": { // Creating an object to insert
            "first-name": "Om",
            "last-name": "Purwar"
          }
        }

        db.collection("user").insertOne(myobj, function (err, res) { //Inserting an objet to collection

          if (err) {
            throw err
          } else {

            console.log("object insearted")

            db.collection("user").find({}, { '_id': 0 },{}).toArray(function (err, result) {

              if (err) {
                throw err; 
              } else {
                console.log(result)
              }

            });

            client.close(function () {
              console.log('connection terminated')
            })
          }
        })
      }
    })
  }
})