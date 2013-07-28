/*
 *  Project: Progress.js
 *  Authors: Connor Atherton, Jordan Kirby
 *  License: 
 */

progress = function() {

  var progress = {
    version: "0.0.1",
    data: "Haven't received any data yet"
  };

  var el;

  // public functions
  progress.init = function(element, url) {

    var id;

    // error checking
    if( arguments.length === 0 ) throw new TypeError('Function expects two parameters, none given.');
    typeof element === "string" ? el = document.getElementById( element ) : el = element;
    // error check the url

    id = el.getAttribute('data-user-id');
    if ( id.trim() === "undefined" || id.trim() === "" ) throw new Error('A user id cannot be undefined or empty');

    // get data from url 
    getData( url );

   }

  progress.pie = {

    show: function() {
      progress.svg  = d3.select( el ).append('svg').attr({ 'width': 960});

      var circles = progress.svg.append('g').selectAll('circle').data(progress.data).enter()
      .append('circle');
      circles.attr("cx", function(d, i) {
        return ( i * 50 ) + 130 ;
      })
      .attr("cy", 100)
      .attr("r", function(d) {
        return d.overallMark / 4;
      });
    },

    hide : function() {

    }

  }

  // private functions ( internal use only )
  function getData(url) {
    
    d3.json( url , function(err, json) {

      if( err ) return console.log(err.message);
      console.log(json);
      progress.data = json;

      //

      arrayify(json);

      //

    });

  }

  function arrayify(json) {


    var tmpNames = [], tmpMarks = [], tmpWeights = [];

    json.forEach(function(value, index, array) {

        tmpNames = [], tmpMarks = [], tmpWeights = [];

        for(workName in value.work)
        {
          // push assessment names to tmp array
          tmpNames.push(workName);

          for(key in value.work[workName])
          {
            if( key == "mark") 
              tmpMarks.push(value.work[workName][key]);
            else 
              tmpWeights.push(value.work[workName][key]);

          }
        }

        // overide what the work object was
        value.work = {},
        // assign new arrays
        value.work.names = tmpNames,
        value.work.weights = tmpWeights,
        value.work.marks = tmpMarks;

    }, this);


  }

  function objectExtract(obj, callback) {

    for (i in obj) {
            value = callback.call(obj[i], i, obj[i]);

            if (value === false) break;

        }
  }

  return progress;

}();