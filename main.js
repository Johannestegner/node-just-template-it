module.exports = (function() {

  var util = require('util');
  var fs = require('fs');
  var _templatePath = null; // Path to the templates base directory.
  var _loadedFiles = {};  // Files already loaded, stored in memory.
  var _fileType = "jti";  // The templates file type.

  /**
   * Fetch template file from filesystem.
   * @param {string} type File name (without end or path).
   * @param {function} callback Callback to fire on done: function(error, fileAsString) - where error will be undefined if no error.
   */
  var _getFile = function(type, callback) {
    if(_loadedFiles[type] !== undefined) {
      callback(undefined , _loadedFiles[type]);
    } else {
      var path = util.format("%s%s.%s", _templatePath, type, _fileType);
      if(fs.existsSync(path)) {
        fs.readFile(path, function(error, data){
          if(error) {
            callback("Failed to fetch template. Failed to read file.");
          } else {
            _loadedFiles[type] = data.toString();
            _getFile(type, callback);
          }
        });
      } else {
        callback(util.format("Failed to fetch template. File does not exist. (%s)", path));
      }
    }
  };

  /**
   * Simple recursive iterator function.
   * Will run an action (function(item, next)) on every item in passed array, and when done with all, call 'done' callback.
   * @param {Array} array List to iterate
   * @param {function} func Action to run: function(item, next) - where next needs to be called to iterate to next object. Error can be passed in next, and if that is done, function will end with errror callback.
   * @param {function} done Callback that runs when the iteration is done: function(error) - where error is set if any error occurred.
   * @param {undefined|string} e Internally used, do not call function with this set.
   */
  var _foreach = function(array, func, done, e) {
    if(array.length === 0){
      return done(e);
    }
    var current = array.splice(0,1);
    func(current, function(error){
      if(error){
        _foreach([], null, done, error);
      } else {
        _foreach(array, func, done, undefined);
      }
    });
  };


  /**
   * Replaces all {include\} tags with the included file.
   * @param {string} template Loaded template to replace includes in.
   * @param {function} callback Callback to fire on done: function(error, templateAsString) - where error will be undefined if no error.
   */
  var _includes = function(template, callback) {
    if(template.indexOf("{include|") === -1){
      callback(undefined, template);
    } else {
      var match;
      var includes = [];
      var includeRegex = new RegExp("\\{include\\|(.+)\\}", 'g');
      while((match = includeRegex.exec(template)) !== null) {
        includes.push(match[1]);
      }
      _foreach(includes, function(templateName, next) {
        _getFile(templateName, function(error, includeAsString){
          if(error){
            util.error(error);
          } else {
            var replaceEx = new RegExp("\\{include\\|" + templateName + "\\}", "g");
            template = template.replace(replaceEx, includeAsString);
          }
          next();
        }.bind(templateName));
      }, function(error) {
        callback(error, template)
      }, undefined);
    }
  };

  /**
   * Recursive replace function, will iterate and replace (then return) the text passed using the "pre", "key" and "val" params for finding what to replace and with what.
   * @param {string} text Text to replace data in.
   * @param {string} pre Used to determine in the template how the key looks. This is the keys above in the object as a string.
   * @param {string} key The object key (property name).
   * @param {object|Array|string|number|boolean} val Value.
   */
  var _replace = function(text, pre, key, val) {
    key = (pre === "" || pre === null || pre === undefined ? key : pre + "." + key); // If the pre param is not set or empty, the object is just the key.
    if(typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
      var regex = new RegExp("\\{" + key + "\\}", 'g');
      text = text.replace(regex, val.toString());
    } else if(util.isArray(val)) {
      var regex = new RegExp("\\{" + key + "\\[(.+)\\]\\}", 'g');
      var match;
      var txt = text; // Create copy, cause the original will be replaced inside the while loop.
      while(match = regex.exec(txt)) {
        if(match.length >= 2) {
          var index = parseInt(match[1], 10);
          if(typeof index === "number") {
            if(val.length <= index || index < 0) {
              util.error("Failed to replace array index, index was out of bounds.");
            } else {
              var replaceRegex = new RegExp("\\{" + key + "\\[" + index.toString() + "\\]\\}", 'g');
              text = text.replace(replaceRegex, val[index].toString());
            }
          } else {
            util.error("Failed to replace array index, index was not a number.");
          }
        }
      }
    } else {
      for(var innerKey in val){
        if (val.hasOwnProperty(innerKey)) {
          text = _replace(text, key, innerKey, val[innerKey]);
        }
      }
    }
    return text;
  };

  /**
   * Initialise the Template engine.
   * @param {string} templatePath Path to the template files base directory.
   * @param {string} fileType File type of the template files, optional, default is jti.
   * @returns {object} the just-template-it object.
   */
  this.init = function(templatePath, fileType) {
    if(fileType !== undefined) {
      _fileType = fileType;
    }
    _templatePath = templatePath;
    if(!fs.existsSync(templatePath)){
      throw new Error("Failed to initialize just-template-it, defined path does not exist.");
    }
    return this;
  };

  /**
   * Change the path of the templates base directory.
   * Observe, this will truncate the currently loaded template files.
   * @param {string} newPath Path to the template files base directory.
   * @param {string} fileType File type of the template files, optional, default is jti.
   */
  this.setTemplatePath = function(newPath, fileType) {
    if(!fs.existsSync(newPath)){
      util.error("Failed to set new template path, defined path does not exist.");
    } else {
      if(fileType !== undefined) {
        _fileType = fileType;
      }
      _templatePath = newPath;
      _loadedFiles = [];
    }
  };

  /**
   * Fetch a template and set the parameters with the given data object.
   * @param {string} template Template name.
   * @param {object} data Data object.
   * @param {function} callback Callback to fire on done: function(error, loadedTemplateAsString) - where error will be undefined if no error.
   */
  this.getTemplate = function(template, data, callback) {
    if(!_templatePath) {
      return callback("Failed to fetch template, Template path have not yet been set. Is the template system initialized?");
    }
    _getFile(template, function(error, text){
      if(error){
        callback(error);
      } else {
        _includes(text, function(error, innerText) {
          if(error) {
            callback(error, innerText);
          } else {
            for(var key in data) {
              if(data.hasOwnProperty(key)) {
                innerText = _replace(innerText, "", key, data[key]);
              }
            }
            callback(undefined, innerText);
          }
        });
      }
    });
  };

  return this;
})();

