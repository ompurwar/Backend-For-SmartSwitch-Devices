
// https://github.com/epoberezkin/ajv#some-packages-using-ajv
// https://spacetelescope.github.io/understanding-json-schema/reference/null.html
var mongoClient = require('mongodb').MongoClient;
var mongodb = require('mongodb');
var url = 'mongodb://localhost:27017';  // database name:
// mynode-app
var crypto = require('crypto');
// var pass = 'Ee332MEd8cJBVDpX';
// var url = 'mongodb+srv://turbo:' + pass +
//   '@cluster0-ztclp.mongodb.net';  // database name: SwitchGrid
var myModules = require('./include/essencial_functions_module');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var express = require('express');
var app = express();
var MyFunctions = new myModules();
var ObjectId = require('mongodb').ObjectId;
var timeStamp = require('mongodb').Timestamp;
var valid_session_attempts = 10000;
// var user = require('./include/models/user');
// variable to store global database connection
var mydb;
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



// setting up the server
var server = app.listen(8080, function() {
  console.log('listening to the port\t:' + server.address().port);
});
// Json validator middle-ware
var Validate_JSON = function(req, res, next) {
  // JSON_validator from my custom module
  MyFunctions.JSON_validator(req, res);
  next();
};

// adding the validator middleware to the app
app.use(Validate_JSON);

// Api to register devices
app.post('/api/RegisterDevice', function(req, res) {
  console.log('wellcome! to mongoDb app \t/api/RegisterDevice');
  console.log(req.body);

  var hash = MyFunctions.hashit(req.body.SHA256);

  mongoClient.connect(
      url, {
        poolSize: 20,
        // ssl: true
      },
      function(err, client) {
        if (err) {
          // throwing the err
          console.log('Sorry Couldn\'t connect! (\'_\') \nSome error occured');
          console.log(JSON.stringify(err));
        } else {
          console.log('Connected correctly to server');
          // Declaring a db object
          var db = client.db('SwitchGrid');
          // validating the device authenticity by checking secret hash
          db.collection('firmware')
              .find({'firmware_secret': hash})
              .toArray(function(err, result_firmware) {
                if (err) {
                  throw err;
                } else
                    // if secret matches
                    if (result_firmware[0]._id !== undefined) {
                  console.log(
                      '[Db Response] ' + JSON.stringify(result_firmware[0]));
                  // checking if device already registered ?
                  db.collection('Devices')
                      .find({'sta_mac': req.body.sta_mac})
                      .toArray(function(err, result_device) {
                        // if registered than check if device credentials exist
                        if (result_device[0]) {
                          var myDevice_id = result_device[0]._id;
                          db.collection('device_credentials')
                              .find({'device_id': myDevice_id})
                              .toArray(function(err, credentials) {
                                // if device credentials exists than respond
                                // device already registered
                                if (credentials[0]) {
                                  console.log(
                                      '[device is already registered]\n' +
                                      credentials[0]._id);
                                  res.json('[device is already registered]');
                                  /* client.close(function () {
                                     console.log('connection terminated');
                                   });*/
                                } else
                                    // else if credentials dosen't exist, insert
                                    // new credentials and send it as respond to
                                    // the request
                                    if (credentials[0] === undefined) {
                                  var device_id = myDevice_id;
                                  var passkey =
                                      crypto.randomBytes(32).toString('hex');
                                  var salt =
                                      crypto.randomBytes(10).toString('hex');
                                  // new credentials
                                  var device_credentials = {
                                    'device_id': device_id,
                                    'pass': MyFunctions.hashit(passkey + salt),
                                    'salt': salt
                                  };
                                  // inserting the credentials
                                  db.collection('device_credentials')
                                      .insertOne(
                                          device_credentials,
                                          function(err, result) {
                                            // sending the credentials in
                                            // response
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
                        } else
                            // if device not already registered insert the
                            // device record into database
                            if (result_device[0] === undefined) {
                          // inserting new device in the record
                          db.collection('Devices').insert(
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
                                console.log(
                                    JSON.stringify(result_create_device));
                                if (err) {
                                  res.json('soemerror occured');
                                  console.log(JSON.stringify(err.message));
                                  /* client.close(function () {
                                     console.log('connection terminated');
                                   });*/
                                } else
                                    // If new device record inserted
                                    // successfully
                                    // than create its credential
                                    if (result_create_device.ops[0]) {
                                  // res.json('Device registered');
                                  console.log(result_create_device.ops[0]._id);
                                  var device_id =
                                      result_create_device.ops[0]._id;
                                  var passkey =
                                      crypto.randomBytes(32).toString('hex');
                                  var salt =
                                      crypto.randomBytes(10).toString('hex');
                                  // new credential
                                  var device_credentials = {
                                    'device_id': device_id,
                                    'pass': MyFunctions.hashit(passkey + salt),
                                    'salt': salt
                                  };
                                  // Inserting new credentials
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

                                  // inserting the device state record into
                                  // database
                                  var device_state = {
                                    device_id: device_id,
                                    dateEntry_timeStamp: new timeStamp()
                                  };
                                  db.collection('state_storage')
                                      .insertOne(
                                          device_state, function(err, result) {
                                            if (err) {
                                              throw err;
                                            } else {
                                              console.log(
                                                  '[device register] device state registed successfully!' +
                                                  result[0])
                                            }
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

  mongoClient.connect(url, function(err, client) {
    if (err) {
      throw err;
    } else {
      var db = client.db('SwitchGrid');

      if (req.body.SessionId) {
        /*
         *checking sessionId in record
         *if exist decrement the counter by one
         *and obtain the objectid of device
         */

        db.collection('session_store')
            .findOneAndUpdate(
                {SessionID: req.body.SessionId}, {$inc: {counter: -1}},
                function(err, result) {
                  if (err) {
                    throw err;
                  } else {
                    console.log(JSON.stringify((result)));
                    if (result.value !== null) {
                      var myDevice_id = new ObjectId(result.value.device_id);
                      // checking if SessionId expired or not?
                      if (result.value.counter >= 0) {
                        // checking if request contains state_array
                        if (req.body.state_array) {
                          // Updateing the device state record
                          db.collection('state_storage')
                              .findOneAndUpdate(
                                  {'device_id': myDevice_id}, {
                                    'device_id': myDevice_id,
                                    'state_array': req.body.state_array,
                                    'dateEntry_timeStamp': new timeStamp()
                                  },
                                  function(err, result) {
                                    // sending response to device
                                    res.json({
                                      'databox': {
                                        'errFlag': '0',
                                        'state_array': req.body.state_array
                                      }
                                    });
                                  });

                          // now inserting the states into the log store
                          db.collection('state_log')
                              .insertOne(
                                  {
                                    'device_id': myDevice_id,
                                    'state_array': req.body.state_array,
                                    'dateEntry_timeStamp': new timeStamp()
                                  },
                                  function(err, result) {
                                    console.log(
                                        '[synch State API]\tstates added to the log ');
                                  });



                        }  // if request dosen't contains state array
                        else if (!req.body.state_array) {
                          db.collection('state_storage')
                              .find(
                                  {'device_id': myDevice_id},
                                  {$sort: {dateEntry_timeStamp: -1}})
                              .toArray(function(err, result_State_store) {
                                if (err) {
                                  throw err;
                                } else {
                                  if (result_State_store[0]) {
                                    res.json({
                                      'databox': {
                                        'errFlag': '0',
                                        'state_array':
                                            result_State_store[0].state_array,
                                        'timeStamp': result_State_store[0]
                                                         .dateEntry_timeStamp
                                      }
                                    });
                                  }
                                }
                              });
                        }
                      } else {
                        // response when session expires
                        res.json({
                          databox: {
                            errFlag: 402,
                            errDecr: 'Sesssion Expired UnAutharised request!'
                          }
                        });
                        console.log(
                            '[synch State API]\tSesssion Expired UnAutharised request! ');
                      }

                    } else {
                      console.log('[] SessionId does not exist');
                      res.json({
                        databox: {
                          errFlag: 402,
                          errDecr: 'SessionId does not exist!'
                        }
                      });
                    }
                  }
                });
      }
    }
  });
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
                          'counter': valid_session_attempts,
                          'dateEntry_timeStamp': new timeStamp()
                        },
                        function(err, result) {
                          if (err) {
                            console.log(JSON.stringify(err));
                          } else {
                            console.log(JSON.stringify({
                              'databox': {
                                'ResponseCode': '200',
                                'SessionID': SessionID
                              }
                            }));
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

// data entry bu UI
app.post('/api/postData', function(req, res) {
  console.log(req.body);
  res.send(200);
});
// Api for client side to send the new states
app.post('/api/setStates', function(req, res) {
  console.log('wellcome! to mongoDb app \t/api/setStates');
  console.log(req.body);
  if (!res.finished) {
    res.json(req.body);
  }
});