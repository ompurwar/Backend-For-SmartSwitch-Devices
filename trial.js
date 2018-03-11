// https://github.com/epoberezkin/ajv#some-packages-using-ajv
// https://spacetelescope.github.io/understanding-json-schema/reference/null.html
const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://192.168.43.104:27017';  // database name:
// mynode-app
const crypto = require('crypto');
// const pass = 'Ee332MEd8cJBVDpX';
// const url = 'mongodb+srv://turbo:' + pass +
//  '@cluster0-ztclp.mongodb.net'; // database name: SwitchGrid
const myModules = require('./essencial_functions_module');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const express = require('express');
const app = express();
const MyFunctions = new myModules();
const ObjectId = require('mongodb').ObjectId;
const timeStamp = require('mongodb').Timestamp;
// setting up the server
const server = app.listen(8080, function() {
  console.log('listening to the port\t:' + server.address().port);
});

// attaching bodyparser middleware
app.use(bodyParser.json());

// setting header
app.use(function(req, res, next) {
  //     Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  //     Request methods you wish to allow
  res.setHeader(
      'Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  //     Request headers you wish to allow
  res.setHeader(
      'Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  //     Set to true if you need the website to include cookies in the requests
  //     sent
  //     to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  //     Pass to next layer of middleware
  next();
});
// using morgan a as middleware for logging purposes
app.use(morgan('combined'));

// sending UI page
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

const InsertAndFindData = (req, res, next) => {
  if (req.body === undefined || req.body === null || req.body === {}) {
    console.log('\nSorry!\tnoting to add please send some data!');
  } else {
    var myobj = req.body;
    // connecting to the server
    mongoClient.connect(
        url, {
          poolSize: 10,
          // ssl: true
        },
        function(err, client) {
          if (err) {
            // throwing the err
            console.log(
                'Sorry Couldn\'t connect! (\'_\') \nSome error occured');
            throw err;
          } else {
            console.log('Connected correctly to server');
            // Declaring a db object
            var db = client.db('SwitchGrid');
            // Inserting an objet to collection
            db.collection('users').insertOne(myobj, function(err) {
              if (err) {
                console.log('error on line:\t44', err);
                res.json(err);
              } else {
                console.log('object insearted');
                res.json('object insearted:\t' + JSON.stringify(myobj));
                /*client.close(function () {
                  console.log('connection terminated');
                });*/
              }
            });
          }
        });
  }
  next();
};

const FindData = (req, res, next) => {
  const myobj = req.body;
  mongoClient.connect(
      url, {
        poolSize: 10,
        // ssl: true
      },
      function(err, client) {
        if (err) {
          // throwing the err
          console.log('Sorry Couldn\'t connect! (\'_\') \nSome error occured');
          throw err;
        } else {
          console.log('Connected correctly to server');
          // Declaring a db object
          var db = client.db('SwitchGrid');
          db.collection('users').find(myobj).toArray(function(err, result) {

            if (err) {
              throw err;
            } else {
              console.log(JSON.stringify(result));
              res.json(result);
            }
            /* client.close(function () {
               console.log('connection terminated');
             });*/
          });
        }
      });
  next();
};

// middleware for dele
const DeleteData = (req, res, next) => {
  mongoClient.connect(
      url, {
        poolSize: 10,
        // ssl: true
      },
      function(err, client) {
        if (err) {
          // throwing the err
          console.log('Sorry Couldn\'t connect! (\'_\') \nSome error occured');
          throw err;
        } else {
          console.log('Connected correctly to server');
          // Declaring a db object
          var db = client.db('SwitchGrid');
          var myquery = req.body;
          db.collection('users').deleteOne(myquery, function(err, obj) {
            // throwing the err
            if (err) throw err;
            console.log('deleted:\t ' + obj.deletedCount);
            /* client.close(function () {
               console.log('connection terminated');
             });*/
            res.json('deleted:\t ' + obj.deletedCount);
          });
        }
      });
  next();
};


// Json validator middle-ware
var Validate_JSON = function(req, res, next) {
  // JSON_validator from my custom module
  MyFunctions.JSON_validator(req, res);
  next();
};

// adding the validator middleware to the app
app.use(Validate_JSON);

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

// Api to register devices
app.post('/api/RegisterDevice', function(req, res) {
  console.log('wellcome! to mongoDb app \t/api/RegisterDevice');
  console.log(req.body);

  var hash = MyFunctions.hashit(req.body.SHA256);

  var t0 = new Date().getMilliseconds();
  mongoClient.connect(
      url, {
        poolSize: 20,
        // ssl: true
      },
      function(err, client) {
        var t1 = new Date().getMilliseconds();
        console.log('Call to hashit took ' + (t1 - t0) + ' milliseconds.');
        if (err) {
          // throwing the err
          console.log('Sorry Couldn\'t connect! (\'_\') \nSome error occured');
          throw err;
        } else {
          console.log('Connected correctly to server');
          // Declaring a db object
          var db = client.db('SwitchGrid');
          db.collection('firmware')
              .find({'firmware_secret': hash})
              .toArray(function(err, result_firmware) {
                if (err) {
                  throw err;
                } else if (result_firmware[0]._id !== undefined) {
                  console.log(
                      '[Db Response] ' + JSON.stringify(result_firmware[0]));
                  db.collection('Devices')
                      .find({'sta_mac': req.body.sta_mac})
                      .toArray(function(err, result_device) {
                        if (result_device[0]) {
                          var myDevice_id = result_device[0]._id;
                          db.collection('device_credentials')
                              .find({'device_id': myDevice_id})
                              .toArray(function(err, credentials) {
                                if (credentials[0]) {
                                  console.log(
                                      '[device is already registered]\n' +
                                      credentials[0]._id);
                                  res.json('[device is already registered]');
                                  /* client.close(function () {
                                     console.log('connection terminated');
                                   });*/
                                } else if (credentials[0] === undefined) {
                                  var device_id = myDevice_id;
                                  var passkey =
                                      crypto.randomBytes(32).toString('hex');
                                  var salt =
                                      crypto.randomBytes(10).toString('hex');
                                  var device_credentials = {
                                    'device_id': device_id,
                                    'pass': MyFunctions.hashit(passkey + salt),
                                    'salt': salt
                                  };
                                  db.collection('device_credentials')
                                      .insertOne(
                                          device_credentials,
                                          function(err, result) {
                                            res.json({
                                              'databox': {
                                                'login': device_id,
                                                'pass': passkey
                                              }
                                            });
                                            /* client.close(function () {
                                               console.log('connection
                                             terminated');
                                             });*/
                                            console.log(
                                                'device registered successfully\n[db Response]' +
                                                result[0]);
                                          });
                                }
                              });
                          console.log(result_device[0]._id);
                        } else if (result_device[0] === undefined) {
                          db.collection('Devices').insertOne(
                              {
                                'sta_mac': req.body.sta_mac,
                                'ap_mac': req.body.ap_mac,
                                'chip_Id': req.body.chip_Id,
                                'device_type': req.body.device_type,
                                'chip_name': req.body.chip_name,
                                'chip_version': req.body.chip_version,
                                'chip_size': req.body.chip_size,
                                'free_size': req.body.free_size,
                                'sketch_size': req.body.sketch_size,
                                'sdk_version': req.body.sdk_version,
                                'timeStamp': new Date()
                              },
                              function(err, result_create_device) {
                                if (err) {
                                  res.json('soemerror occured');
                                  console.log(JSON.stringify(err.message));
                                  /* client.close(function () {
                                     console.log('connection terminated');
                                   });*/
                                } else if (result_create_device[0]) {
                                  // res.json('Device registered');
                                  var device_id = result_create_device[0]._id;
                                  var passkey =
                                      crypto.randomBytes(32).toString('hex');
                                  var salt =
                                      crypto.randomBytes(10).toString('hex');
                                  var device_credentials = {
                                    'device_id': device_id,
                                    'pass': MyFunctions.hashit(passkey + salt),
                                    'salt': salt
                                  };
                                  db.collection('device_credentials')
                                      .insertOne(
                                          device_credentials,
                                          function(err, result) {
                                            res.json({
                                              'databox': {
                                                'login': device_id,
                                                'pass': passkey
                                              }
                                            });
                                            /* client.close(function () {
                                               console.log('connection
                                             terminated');
                                             });*/
                                            console.log(
                                                'device registered successfully\n[db Response]' +
                                                result[0]);
                                          });
                                }
                              });
                        } else if (result[0]._id === undefined) {
                          /*client.close(function () {
                            console.log('connection terminated');
                          });*/
                          console.log('unautharised device');
                          res.json('unautharised device');
                        }
                      });
                }
              });
        }
      });
});

// Api to sync the states of device to the server
app.post('/api/syncstate/', function(req, res) {
  console.log('wellcome! to mongoDb app \t/api/syncstate/');
  console.log(req.body);

  if (req.body.SessionId && !req.body.state_array) {
    mongoClient.connect(url, function(err, client) {
      if (err) {
        throw err;
      } else {
        var myObjectId = new ObjectId();
        var db = client.db('SwitchGrid');
        db.collection('session_store')
            .findOneAndUpdate(
                {SessionID: req.body.SessionId}, {$inc: {counter: -1}},
                function(err, result) {
                  console.log(JSON.stringify(result));
                  var myDevice_id = new ObjectId(result.value.device_id);
                  db.collection('State_storage')
                      .find(
                          {'device_id': result.value.device_id},
                          {$sort: {'dateEntry_timeStamp': 1}})
                      .toArray(function(err, result_State_store) {
                        if (err) {
                          throw err;
                        } else {
                          if (result_State_store[0]) {
                            res.json(
                                {'databox':{'state_array':result_State_store[0].state_array} });
                          }
                        }
                      });
                });
      }
    });
  } else if (req.body.SessionId && req.body.state_array) {
    mongoClient.connect(url, function(err, client) {
      if (err) {
        throw err;
      } else {
        var myObjectId = new ObjectId();
        var db = client.db('SwitchGrid');
        db.collection('session_store')
            .findOneAndUpdate(
                {SessionID: req.body.SessionId}, {$inc: {counter: -1}},
                function(err, result) {
                  console.log(JSON.stringify(result));
                  var myDevice_id = new ObjectId(result.value.device_id);
                  db.collection('State_storage')
                      .insertOne(
                          {
                            'device_id': myDevice_id,
                            'state_array': req.body.state_array,
                            'dateEntry_timeStamp': new timeStamp()
                          },
                          function(err, result) {
                            res.json({
                              'databox': {
                                'errFlag': '0',
                                'state_array': req.body.state_array
                              }
                            });
                          });

                });
      }
    });
  }
});



// 1. Api to authenticate the device
// 2. And provide it a token valid for limited
// 3. no. of sysncStates attempts.
app.post('/api/authenticate', function(req, res) {
  console.log('wellcome! to mongoDb app \t/api/authenticate');
  console.log(req.body);
  mongoClient.connect(url, function(err, client) {
    if (err) {
      console.log(JSON.stringify(err));
    } else {
      var db = client.db('SwitchGrid');
      var myObjectId = new ObjectId(req.body.login);
      db.collection('device_credentials')
          .find({'device_id': myObjectId})
          .toArray(function(err, result_credentials) {
            if (err) {
              console.log(JSON.stringify(err));
            } else if (result_credentials[0] !== undefined) {
              if (MyFunctions.hashit(
                      req.body.pass + result_credentials[0].salt) ===
                  result_credentials[0].pass) {
                // Creating Session_ID
                SessionID = crypto.randomBytes(20).toString('hex');
                db.collection('session_store')
                    .insertOne(
                        {
                          'device_id': new ObjectId(req.body.login),
                          'SessionID': SessionID,
                          'counter': 20,
                          'dateEntry_timeStamp': new timeStamp()
                        },
                        function(err, result) {
                          if (err) {
                            console.log(JSON.stringify(err));
                          } else {
                            res.json({
                              'databox': {
                                'ResponseCode': '200',
                                'SessionID': SessionID
                              }
                            });
                          }
                        });
              } else {
                res.json(
                    {'ResponseCode': '400', 'errDecr': 'invalid credentils'});
              }
            } else {
              console.log('\nCredentials dosen\'t exists!');
              res.json({
                'databox': {
                  'ResponseCode': '404',
                  'errDecr': 'Credential dosen\'t exists!'
                }
              });
            }
          });
    }
  });
});

// Api for client side to fetch the states
app.get('/api/getStates', function(req, res) {
  console.log('wellcome! to mongoDb app \t/api/getStates');
  console.log(req.body);
  res.json(req.body);
});

// Api for client side to send the new states
app.post('/api/setStates', function(req, res) {
  console.log('wellcome! to mongoDb app \t/api/setStates');
  console.log(req.body);
  if (!res.finished) {
    res.json(req.body);
  }
});