/*
 *  Project: Progress.js
 *  Description: Progress is a lightweight jquery plugin that allows students to forecast their future grades.
 *  Author: Connor Atherton, Jordan Kirby
 *  License: 
 */

// the semi-colon before function invocation is a safety net against concatenated 
// scripts and other plugins which may not be closed properly.
;(function ( $, window, undefined ) {

  // window and document are passed through as local variables rather than globals
  // as this (slightly) quickens the resolution process and can be more efficiently
  // minified.

  // Create the defaults once
  var document = window.document,
      defaults = {
        url: "connor.json",
        tagname: "div",
      };

  /**
  *
  * The plugin constructor and the actual progress
  * class definition.
  *
  **/
  
  function Progress( element, options ) {
    this.element = element,
    this.modules = [],
    this.id = element.attr('data-user-id').trim(),

    // Use jQuery extend method to extend/override the default options passed in
    // at runtime.
    this.options = $.extend( {}, defaults, options) ;

    this._defaults = defaults;

    this.init();
    this.getData( this, function( mods ) {
                    // store result from ajax request into a plugin 
                    // variable
                    this.modules = mods;
    }); 

    console.log( this.modules );
  }

  Progress.prototype.init = function () {
    // Place initialization logic here
    // Already have access to the DOM element and the options 

    if ( this.id.trim() === "undefined" || this.id.trim() === "" ) 
    {
        throw new Error('A user id cannot be undefined or empty');
    }
 
  };

  Progress.prototype.getData = function(progress, callback) {
    // ajax request to fetch the data
    $.ajax({

      async: false,
      type: "POST",
      dataType: "json",
      url: this.options.url ,
      data: { id: this.id },

      success: function( json ){

        // If its a success instantiate each module object 
        modules = progress.extractModules(progress, json);
        // hand the modules array to callback to store
        callback( modules );

      },

      fail: function() {

        // DO SOMETHING BETTER THAN JUST ALERTING!!
        // Check the cause of the error and give the user some feedback.
        alert('fail');

      }, 

    });

  }

  Progress.prototype.extractModules = function(progress, json) {
    var count = 0;

    // loop through json and instantiate each
    // module and store in the modules array
    $.each(json.modules, function(i, item) {

        progress.modules[count] = new Module( i , item );
        count++;

    });

  }


  /**
  *
  * Individual Module class definition
  *
  **/
  
  function Module(name, assessments) {

    // Public attributes
    this.name = name,
    this.work = assessments,
    this.overallMark;

    // Arrays that will hold all the broken down data
    this.workNames = [], this.marks = [], this.weights = [];

    // Finally extract all the data and populate the three arrays
    // created above. 
    this.extract();
    this.calcOverall();

    }

  Module.prototype.extract = function() {

    // Get list of the modules associated work
    for (var key in this.work){

      if(key !== "overallWeight"){

        // Only add module name and not overall weight
        this.workNames.push(key);
                
      }

      // Get individual marks and weights for modules and store in relevant arrays
      // that were created when the module was instantiated.
      for(var key2 in this.work[key]){
                    
        // key is a weight
        if(key2 == "weight"){
                        
          this.weights.push(this.work[key][key2]);
        
        }
        // key is a mark
        else{

          // Check that mark isn't undefined. May want to do something a bit more
          // sophisticated than just saying it is not completed but it will do for
          // now.
          if(this.work[key][key2] == "undefined"){
                            
            this.marks.push("not completed");
                        
          }
          else{

            this.marks.push(this.work[key][key2]);
                    
          }
        }
      }
    }
  }

  Module.prototype.calcOverall = function() {
          
    this.overall = "overall mark";

  }


  // A really lightweight plugin wrapper around the constructor, 
  // preventing against multiple instantiations
  $.fn.progress = function ( options ) {
    new Progress( this, options );
    return this;
  }

}(jQuery, window));
