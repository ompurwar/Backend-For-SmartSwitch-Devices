const mongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/mynode-app" //database name: mynode-app
const bodyParser = require("body-parser")

const express = require("express")
const app = express()
//setting up the server
const server = app.listen(1245, function () {
  console.log("listening to the port\t:" + server.address().port)
})

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  next()
})
app.use(bodyParser.json())
app.get('/', function (req, res) {
  res.sendFile(__dirname+'/login/index.html')
})
app.post('/', function(req, res){
  console.log("\n \t:/js/index.html\t file requested!")
  res.sendFile(__dirname+'/login/index.html')
})
app.get('/js/index.js', function(req, res){
  console.log("\n \t:/js/index.js\t file requested!")
  res.sendFile(__dirname+'/login/js/index.js')
})

app.get('/css/style.css', function(req, res){
  console.log("\n \t:/css/style.css\t file requested!")
  res.sendFile(__dirname+'/login/css/style.css')
})

app.post('/api/addData/', function (req, res) {
  console.log('wellcome! to mongoDb app')
  console.log(req.body)
  if (req.body == undefined || req.body == null) {
    console.log('\nSorry!\tnoting to add please send some data!')
  } else {
    var body = req.body
    mongoClient.connect(url, function (err, client) {
      if (err) { // throwing the err
        console.log("Sorry Couldn't connect! ('_') \nSome error occured")
        throw err
      } else {
        const db = client.db("mynode-app") //Declaring a db object
        db.createCollection("user", function (err) {
          if (err) { //Checking for the error while creating collection
            console.log('some error occured')
            throw err; //Throwing if any exixts
          } else {

            console.log("collection success!")
            //console.log(body)
            var myobj = body /// Data abject to enter

            db.collection("user").insertOne(myobj, function (err) { //Inserting an objet to collection

              if (err) {
                console.log('error on line:\t44', optionalParams)
                throw err
              } else {

                console.log("object insearted")

                db.collection("user").find(req.body).toArray(function (err, result) {

                  if (err) {
                    throw err;
                  } else {
                    console.log(JSON.stringify(result))
                    res.json(result)
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
  }
})