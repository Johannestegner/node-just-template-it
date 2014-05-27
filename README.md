just-template-it
=====================

A simple template system used for various tasks in internal projects.  

### JavaScript usage.

Initialise the Template system:

```javascript
var templates = require('just-template-it');
templates.init("/path/to/templates", "type");
```

The above code will initialise the system and set the base path to `/path/to/templates`, it will also set the file type of the templates to `.type` (the second param is optional, default filetype is `jti`).  
The path and filetype can be changed by using the `setTemplatePath(path, type)` function.  
**Observe:** *setting new path will remove all currently loaded templates.*

To fetch a template use the `getTemplate` function:

```javascript
templates.getTemplate('nameOfTemplate', {
  "aString": "Some text...",
  "aObj": {"aInt": 5},
  "array": [1,"test",9]
}, function(error, formattedTemplate) {
  if(errror) {
    //
  } else {
    //
  }
});
```

`getTemplate` takes three arguments:  
First is the name of the template, this is without file end, so the `nameOfTemplate`template in the above example should in the filesystem be at:  `/path/to/templates/nameOfTemplate.type`.  
Second parameter is the `data` object that the template system should replace placeholders with (see further down in readme for more info about placeholders in the template files).  
And the third and last parameter is a callback function. The callback takes two args:  
First is error, which will only be set if there was an error during run.  
Second is the template, formatted and ready withe all placeholders replaced with the data passed in.

### The template files.
The template files is quite simple.  
They are basically a text file with placeholders (duh), and depending on what data is passed in, the file will replace the placeholders.  

Simple example:
```
Testing {aString}
{aObj.aInt} is a number.
{array[2]} {array[3]}
```
Using the above js code, this template will be formatted as:
```
Testing Some text...
5 is a number.
test 9
```

Just-template-it supports the following placeholders:  

  * Include (includes another template file): - `{include|filename}`
  * Key-value-pair: `"key": "value"` - `{key}`
  * Objects: `"obj": {"key":"val"}` - `{obj.key}`
  * Arrays: `"arr": [1,2,3]` - `{arr[1]}`


Check out the example code in the example dir if more info about usage is needed.
