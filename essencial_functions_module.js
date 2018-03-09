function essencial_function() {
  this.JSON_validator = function(req, res) {
    var ajv = require('ajv');
    var myValidator = new ajv({$data: true});

    var schema = require('./schema.json');
    var schema1 = {};
    var validData = req.body;
    /* {
        smaller: 5,
        larger: 7
      };*/

    var a = myValidator.validate(schema1, validData);  // true
    if (a) {
      console.log('[JSON_validator] data validated');
    } else {
      console.log('[JSON_validator] validation failed');
      res.json(myValidator.errorsText());
      res.close;
    }
  };
  this.hashit = function(data) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return (hash.digest('hex'));
  };
}

module.exports = essencial_function;

console.log('')