const mongoClient = require('mongodb').MongoClient;
// const url = "mongodb://localhost:27017/mynode-app" //database name:
// mynode-app
const pass = 'Ee332MEd8cJBVDpX';
const url = 'mongodb+srv://turbo:' + pass +
    '@cluster0-ztclp.mongodb.net';  // database name: SwitchGrid

const bodyParser = require('body-parser');
const express = require('express');
const app = express();

// setting up the server
const server = app.listen(8080,function() {
  console.log('listening to the port\t:' + server.address().port);
});

// attaching bodyparser middleware
app.use(bodyParser.json());

// setting header
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

/*// sending UI page
app.get(
    '', function(req, res) { res.sendFile(__dirname + '/login/index.html'); });
app.get(
    '/', function(req, res) { res.sendFile(__dirname + '/login/index.html'); });
app.get('/js/index.js', function(req, res) {
  console.log('\n \t:/js/index.js\t file requested!');
  res.sendFile(__dirname + '/login/js/index.js');
});
app.get('/css/style.css', function(req, res) {
  console.log('\n \t:/css/style.css\t file requested!');
  res.sendFile(__dirname + '/login/css/style.css');
});
*/
const InsertAndFindData = (req, res, next) => {
  if (req.body === undefined || req.body === null || req.body === {}) {
    console.log('\nSorry!\tnoting to add please send some data!');
  } else {
    var myobj = req.body;
    // connecting to the server
    mongoClient.connect(url, {poolSize: 10, ssl: true}, function(err, client) {
      if (err) {
        // throwing the err
        console.log('Sorry Couldn\'t connect! (\'_\') \nSome error occured');
        throw err;
      } else {
        console.log('Connected correctly to server');
        // Declaring a db object
        var db = client.db('SwitchGrid');
        // Inserting an objet to collection
        db.collection('user').insertOne(myobj, function(err) {
          if (err) {
            console.log('error on line:\t44', err);
            res.json(err);
          } else {
            console.log('object insearted');
            res.json('object insearted:\t' + JSON.stringify(myobj));
            client.close(function() { console.log('connection terminated'); });
          }
        });
      }
    });
  }
  next();
};

const FindData = (req, res, next) => {
  const myobj = req.body;
  mongoClient.connect(url, {poolSize: 10, ssl: true}, function(err, client) {
    if (err) {
      // throwing the err
      console.log('Sorry Couldn\'t connect! (\'_\') \nSome error occured');
      throw err;
    } else {
      console.log('Connected correctly to server');
      // Declaring a db object
      var db = client.db('SwitchGrid');
      db.collection('user').find(myobj).toArray(function(err, result) {

        if (err) {
          throw err;
        } else {
          console.log(JSON.stringify(result));
          res.json(result);
        }
        client.close(function() { console.log('connection terminated'); });
      });
    }
  });
  next();
};

//middleware for dele
const DeleteData = (req, res, next) => {
  mongoClient.connect(url, {poolSize: 10, ssl: true}, function(err, client) {
    if (err) {
      // throwing the err
      console.log('Sorry Couldn\'t connect! (\'_\') \nSome error occured');
      throw err;
    } else {
      console.log('Connected correctly to server');
      // Declaring a db object
      var db = client.db('SwitchGrid');
      var myquery = req.body;
      db.collection('user').deleteOne(myquery, function(err, obj) {
        // throwing the err
        if (err) throw err;
        console.log("deleted:\t "+obj.deletedCount);
        client.close(function() { console.log('connection terminated'); });
        res.json("deleted:\t "+obj.deletedCount);
      });
    }
  });
  next();
};


/* call with:
{
	"Human":{
		"name":"Om Purwar1",
		"age":36,
		"DOB":"12/06/1998"
	}
}*/
app.use('/api/addData', InsertAndFindData);
app.post('/api/addData', function(req, res) {
  console.log('wellcome! to mongoDb app \t/api/addData');
  console.log(req.body);
});

// call with  {"Human.name":"Om Purwar singh"}
// call with  {"Human.age":"23"}
app.use('/api/findData', FindData);
app.post('/api/findData', function(req, res) {
  console.log('wellcome! to mongoDb app \t/api/findData');
  console.log(req.body);
});

// call with  {"Human.name":"Om Purwar singh"}
app.use('/api/deleteData', DeleteData);
app.post('/api/deleteData', function(req, res) {
  console.log('wellcome! to mongoDb app \t/api/deleteData');
  console.log(req.body);
});
