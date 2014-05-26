/**
 * Main entry point for the just-template-it module.
 */

var util = require('util');
var fs = require('fs');





module.exports = (function() {
  var _templatePath = ""; // Path to the templates base directory.
  var _loadedFiles = {};  // Files already loaded, stored in memory.

  /**
   * Fetch template file from filesystem.
   * @param {string} type File name (without end or path).
   * @param {function} callback Callback to fire on done: function(error, fileAsString) - where error will be undefined if no error.
   */
  var getFile = function(type, callback) {
    if(_loadedFiles[type] !== undefined) {
      callback(undefined , _loadedFiles[type]);
    } else {
      var path = _templatePath + type + ".jti";
      fs.exists(path, function(exists){
        if(!exists) {
          callback(util.format("Failed to fetch template. File does not exist. (%s)", path));
        } else {
          fs.readFile(path, function(error, data){
            if(error) {
              callback("Failed to fetch template. Failed to read file.");
            } else {
              _loadedFiles[type] = data.toString();
              getFile(type, callback);
            }
          });
        }
      });
    }
  };

  var includeRegex = new RegExp("\\{include\\|(.+)\\}", 'g');

  /**
   * Replaces all {include\} tags with the included file.
   * @param {string} template Loaded template to replace includes in.
   * @param {function} callback Callback to fire on done: function(error, templateAsString) - where error will be undefiend if no error.
   */
  var includes = function(template, callback) {
    if(data.indexOf("{include|") === -1){
      callback(undefined, template);
    } else {
      var match;
      var includes = [];
      while((match = includeRegex.exec(template)) !== null) {
        includes.push(match[1]);
      }
      var isError = null;
      var count = 0;

      for(var i=includes.length;i-->0;) {
        count++;
        var curr = includes[i];
        getFile(curr, function(error, includedFile){
          if(error){

          }
        });
      }


    }
  };



  /**
   * Initialize the Template engine.
   * @param {string} templatePath Path to the template files base directory.
   */
  this.init = function(templatePath) {
    _templatePath = templatePath;

  };

  /**
   * Change the path of the templates base directory.
   * Observe, this will truncate the currently loaded template files.
   * @param {string} newPath Path to the template files base directory.
   */
  this.setTemplatePath = function(newPath) {
    _templatePath = newPath;
    _loadedFiles = [];
  };

  /**
   * Fetch a template and set the parameters with the given data object.
   * @param {string} template Template name.
   * @param {object} data Data object.
   * @param {function} callback Callback to fire on done: function(error, loadedTemplateAsString) - where error will be undefined if no error.
   */
  this.getTemplate = function(template, data, callback) {
    getFile(template, function(error, data){
      if(error){
        callback(error);
      } else {

      }
    });
  };

  return this;
})();

