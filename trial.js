var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mynode-app";        //database name: mynode-app

mongoClient.connect(url, function (err, db) {
  if (err) {                                              // throwing the err
    console.log("Sorry Couldn't connect! ('_') \nSome error occured");
    throw err;
  }

  console.log("connected to mongodb: mynode-app")
  db.close(function () { console.log('connection terminated'); });
});
