/**
 * formrunner
 * Copyright (c) 2009, 2014 (v2) Mike Botsko, Helion3 LLC (http://www.helion3.com)
 * http://www.botsko.net/blog/2009/04/jquery-form-builder-plugin/
 * Originally designed for AspenMSM, a CMS product from Trellis Development
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 */
var Formrunner = function(opts){

  if( typeof opts.targets !== 'object' || opts.targets.length === 0 ){
    throw new Error('Invalid or missing target element(s)');
  }

  // Define all default options
  var defaultOptions = {

    // Id to refer to this form specifically
    form_id: false,

    // Injected model, allows us to start with an
    // existing form
    model: false,

    // A dom-lib wrapped element
    targets: false,

    // URL to submit form results to
    action: '',

    // Form submission method
    method: 'POST',

    // Language prefix to load localized templates
    lang: 'en',

    // Customizable base for templates
    templateBasePath: 'templates/runner'

  };

  var _privateSelf = this;
  this._opts = $.extend(true, {}, defaultOptions,opts);

  // Dynamically load templates
  if( dust.onLoad === undefined ){
    dust.onLoad = function(name, callback) {
      $.ajax(_privateSelf._opts.templateBasePath + '/' + _privateSelf._opts.lang + '_' + name + '.tpl', {
        success: function(data) {
          callback(undefined, data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          callback(textStatus, undefined);
        }
      });
    };
  }

  this.render();

  return this;

};

// Sort field models by sortOrder
var sortObject = function(obj){
  var arr = [];
  for (var prop in obj){
    if (obj.hasOwnProperty(prop)){
      arr.push({
        'key': prop,
        'value': obj[prop].sortOrder
      });
    }
  }
  arr.sort(function(a, b){ return a.value - b.value; });

  var result = [];
  for( var i = 0, l = arr.length; i < l; i++ ){
    var key = arr[i].key;
    result.push(obj[key]);
  }

  return result;
};

Formrunner.prototype = {

  // store options
  _opts: false,

  /**
   * Render the form editor
   * @return {[type]} [description]
   */
  render: function(){

    var self = this;

    // Pass data to the original rendering
    var frmObj = {
      form_id: self._opts.form_id,
      action: self._opts.action,
      method: self._opts.method
    };

    // Load base form template
    dust.render('base', frmObj, function(err, out) {

      // Cache and append the form
      var form = $(out).appendTo(self._opts.targets),
          fields_wrapper = form.find('.fields-wrapper');

      // Append a fields wrapper to the form
      if (fields_wrapper.length == 0) {
        fields_wrapper = $('<div>', { 'class': 'fields-wrapper' } ).prependTo(form);
      }

      // Sort incoming models
      var sorted = sortObject(self._opts.model);

      // Iterate model and render proper editors
      $.each(sorted,function(index,model){
        self.appendElementForModel( model, fields_wrapper );
      });

      // Appends extra fields if available
      if (self._opts.extra_fields) {
        $.each(self._opts.extra_fields, function (index, value) {
          fields_wrapper.prepend('<input type="hidden" name="' + index + '" value="' + value + '">');
        });
      }

    });
  },

  /**
   * Append a rendered form element for a model
   * @param object model Form model from the builder
   * @param object fields_wrapper fields container
   */
  appendElementForModel: function( model, fields_wrapper ){

    var self = this;

    // Pass data to the template
    var frmObj = {
      id: self.fieldNameToId(model.label),
      label: model.label,
      required: model.required
    };

    // Load and render the html template for the form
    dust.render(model.type, frmObj, function(err, out){

      // Set base template
      var lastField = $(out).appendTo(fields_wrapper);
      
      // Build choices
      if( model.choices !== undefined && model.choices.length > 0 ){
        $.each(model.choices,function(key,choice){

          choice.id = self.fieldNameToId( choice.label );
          choice.name = self.fieldNameToId(model.label);

          // Load choice template
          dust.render(model.type+'-choices', choice, function(err, out){

            if( model.type === 'select' ){
              lastField.find('select').append(out);
            } else {
              lastField.find('.frmb-choices').append(out);
            }
          });
        });
      }
    });
  },

  /**
   * Convert a field label to an html/backend-valid ID/name
   * @param  string name Label to convert
   * @return string HTML/backend-safe string
   */
  fieldNameToId: function( name ){
    return name.toLowerCase().replace(/ /g,'-').replace(/[^a-zA-Z0-9_.-]/g, '');
  }
};
