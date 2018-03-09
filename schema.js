var a = {
  'properties': {
    'active_flag': {'type': 'boolean'},
    'adhaar_no': {'type': 'string', 'pattern': '[0-9]{4}-[0-9]{4}-[0-9]{4}$'},
    'age': {'type': 'number', 'minimum': 18},
    'contact': {
      'type': 'object',
      'properties': {
        'address': {
          'address': 'object',
          'properties': {
            'country': {'type': 'string'},
            'state': {'type': 'string'},
            'city': {'type': 'string'},
            'pin_code': {
              'type': 'string',
              'pattern': '([0-9]{6}$|[0-9]{3}\s[0-9]{3}$)'
            },
            'street': {'type': 'string'},
            'landmark': {'type': 'string'}
          }
        },
        'email': {
          'type': 'string',
          'pattern':
              '/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/'
        },
        'mob_no': {
          'type': 'string',
          'pattern':
              '((\+*)((0[ -]+)*|(91 )*)(\d{12}+|\d{10}+))|\d{5}([- ]*)\d{6}'
        }
      }
    }
  },
  'required': ['active_flag', 'adhaar_no', 'age'],
  'additionalProperties': false
};
console.log(JSON.stringify(a));