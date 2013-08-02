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

    vars: {
      width : 750,
      height : 150,
      outerRadius : 75,
      innerRadius: 63
    },

    show: function() {

      progress.pie.showOverallMarks();
      //progress.pie.showModuleNames();

      // add on click listener to button to transition

    },

    hide : function() {

    },

    showOverallMarks: function() {

      var color = d3.scale.category20();
      var arc = d3.svg.arc()
                  .innerRadius(progress.pie.vars.innerRadius)
                  .outerRadius(progress.pie.vars.outerRadius);

      // create new svg element for circles
      var svg = d3.select( el ).append("svg")
            .attr("width", progress.pie.vars.width)
            .attr("height", progress.pie.vars.height)
          .append("g.circles")
            .attr("transform", "translate(" + progress.pie.vars.width + "," + progress.pie.vars.height + ")");

      progress.data.forEach( function(value, index, array) {

        var pie = d3.layout.pie().sort(null);
        var data = [value.overallMark];
        data.push(100 - value.overallMark);

        // Set up groups
        var arcs = svg
          .selectAll('g.circles')
          .data(pie(data));

        arcs.append("path")
            .attr("fill", function(d, i) {
                return color(i);
            })
            .attr("d", arc);

      });

    },

    showWeights: function() {

      var color = d3.scale.category20();


      var arc = d3.svg.arc()
                      .innerRadius(progress.pie.vars.innerRadius)
                      .outerRadius(progress.pie.vars.outerRadius);

      progress.data.forEach( function(value, index, array) {

        var pie = d3.layout.pie();
        var dataset = value.work.weights;

        var svgContainer = d3.select( el )
                              .append('svg')
                              .attr({ 
                                  'width': 150, 
                                  'height' : 150,
                                  'class' : 'pie ' + value.name
                              });

        // Set up groups
        var arcs = svgContainer.selectAll("g." + value.name)
          .data(pie(dataset))
          .enter()
          .append("g")
          .attr("class", "arc")
          .attr("transform", "translate(" + 75 + ", " + 75 + ")");

        arcs.append("path")
            .attr("fill", function(d, i) {
                return color(i);
            })
            .attr("d", arc);

      });

    },

    showModuleNames: function() {

      // collect names of modules in array
      var moduleNames = [];
      progress.data.forEach(function(value, index, array) {
        moduleNames.push(value.name);
      });

      progress.pie.svg.selectAll('text')
          .data(moduleNames)
          .enter()
          .append('text')
          .attr("class", "moduleName")
          .attr("transform", function(d, i) {
            return "translate(" + (( progress.pie.vars.w * i ) + progress.pie.vars.outerRadius) + ", " + progress.pie.values.outerRadius + ")"
          })
          .attr('text-anchor', "middle")
          .attr('alignment-baseline', "middle")
          .text(function(d, i) {
            return d;
          })

    }

  }

  progress.scatter = {

    show: function() {

    },

    hide: function() {

    }

  }

  progress.force = {

    show: function() {

    },

    hide: function() {

    }

  }

  // private functions ( internal use only )
  function getData(url) {
    
    d3.json( url , function(err, json) {

      if( err ) return console.log(err.message);

      // return json into array form 
      progress.data = arrayify(json);

    });

  }

  function arrayify(json) {

    json.forEach( function(value, index, array) {

        var tmpNames = [], tmpMarks = [], tmpWeights = [];

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

    return json;

  }

  function populateArray(property) {
    // collect names of modules in array
      var tmpArray = [];
      progress.data.forEach(function(value, index, array) {
        console.log('value.prop', value.property);
        tmpArray.push(value.property);
      });
      console.log('tmpArray', tmpArray);
      return tmpArray;
  }

  function objectExtract(obj, callback) {

    for (i in obj) {
            value = callback.call(obj[i], i, obj[i]);

            if (value === false) break;

        }
  }

  return progress;

}();