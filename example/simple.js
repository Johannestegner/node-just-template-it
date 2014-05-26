var templates = require('../main.js');
templates.init('templates/');

var util = require('util');

templates.getTemplate("welcome", {
  "package": "just-template-it"
  , "user": "Johannes"
  , "project": {
    "name": "example project"
    , "id": "1"
  }
}, function(error, formattedText){
  if(error) {
    util.error(error);
  } else {
    util.debug(formattedText);
  }
});
