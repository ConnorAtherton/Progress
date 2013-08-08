progress = function() {

  var progress = {
    version: "0.0.1",
    data: "Haven't received any data yet"
  };

  var el;

  /**
  *
  * Progress constructor, takes an element you pass it and stores it as a global plugin
  * variable used as a container for all the visualisations. Doesn't actually displays the data
  * but calls getData() which does that.
  *
  **/
  
  progress.init = function(element, url) {

    // error checking
    if( arguments.length === 0 ) throw new TypeError('Function expects two parameters, none given.');
    // error check for arguments of length 1

    typeof element === "string" ? el = document.getElementById( element ) : el = element;
    
    /**
    
      TODO:
      - USE RegExp to error check the url (maybe?)
    
    **/
    
    // store it, maybe use it for later 
    var id = el.getAttribute('data-user-id');
    if ( id.trim() === "undefined" || id.trim() === "" ) throw new Error('A user id cannot be undefined or empty');

    // get data from url 
    getData( url, id );

  }

  progress.pie = {

    vars: {
      drawn: false,
      svgWidth : 750,
      pieWidth: 184,
      pieHeight : 150,
      outerRadius : 75,
      innerRadius: 70,
      pieEl: document.createElement('div'),
      pieId: 'pieCharts',
      paths: null,
      svg: null,
      text: null,
      startValue: {startAngle: 6.28, endAngle: 0}
    },

    /**
    *
    * Creates a new DOM element used to change between
    * the two pie states and appends it to the page. 
    *
    **/
    
    show: function() {

        // If the pie chart is already drawn don't redraw
        if(progress.pie.vars.drawn) return;
 
        /**
        *
        * Create a new DOM element and give it a some custom
        * attributes so it can be targeted within the script and
        * in CSS.
        *
        **/
        
        var clickTarget = document.createElement('div');
        clickTarget.setAttribute('id', 'pieClick');
        clickTarget.setAttribute('data-update', 'weights');
        clickTarget.innerHTML = "Show Weights";
        progress.pie.vars.pieEl.appendChild( clickTarget );

        /**
        *
        * Add a click event listener and based on the clicktarget's 
        * 'data-update' attribute choose to update the weights or the
        * marks.
        *
        **/
        
        d3.select(clickTarget).on("click", function() {
          this.getAttribute("data-update") === "weights" ? progress.pie.updateWeights(this) : progress.pie.updateMarks(this);
        });

        // Append created DOM element to the element used for the plugin.
        progress.pie.vars.pieEl.setAttribute('id', progress.pie.vars.pieId);
        el.appendChild( progress.pie.vars.pieEl );

        // Show the initial state of the pie charts and add the module names.
        progress.pie.showOverallMarks();
        progress.pie.showModuleNames();

        progress.pie.vars.drawn = true;

    },

    hide: function() {

    },

    tweenPie: function(b) {
      var arc = d3.svg.arc()
                  .innerRadius(progress.pie.vars.innerRadius)
                  .outerRadius(progress.pie.vars.outerRadius);
         
         var i = d3.interpolate((this._current || progress.pie.vars.startValue),  b);
         this._current = i(0);
         return function(t) {
           return arc(i(t));
      };
    },

    /**
    *
    * Block comment
    *
    **/
    
    updateWeights: function(that) {

      var color = d3.scale.category20c();
      var pie = d3.layout.pie().sort(null);
      var pieData = [[25, 25, 50], [30, 30, 40], [70, 10, 10, 10], [95, 4, 1], [80, 15, 5]];

      // change attribute to overall
      that.setAttribute("data-update", "overall")

      progress.pie.vars.svg = progress.pie.vars.svg
              .data(pieData);

      progress.pie.vars.paths = progress.pie.vars.paths
          .data(function(d, i){ return pie(d) });

      progress.pie.vars.paths.exit().remove();
      progress.pie.vars.paths.enter().append("path")
      .attr("fill", function(d, i) { return color(i); })
        .attr("transform", "translate(" + 92 + ", " + 75 + ")");

      progress.pie.vars.paths.transition()
          .ease("sin")
           .duration(250)
           .attrTween("d", progress.pie.tweenPie);

    },

    updateMarks: function(that) {

      var pie = d3.layout.pie().sort(null);

      var pieData = [];
      progress.data.forEach( function(value, index, array) {
        var tmpArray = [value.overallMark];
        tmpArray.push(100 - value.overallMark);
        pieData.push(tmpArray);
      });

      // change attribute to overall
      that.setAttribute("data-update", "weights");

      progress.pie.vars.svg = progress.pie.vars.svg
          .data(pieData);

      progress.pie.vars.paths = progress.pie.vars.paths
          .data(function(d, i){ return pie(d) });

      // handle exit and enter selections
      progress.pie.vars.paths.exit().remove();
      progress.pie.vars.paths.enter().append("path")
        .attr("fill", function(d, i) { if(i % 2){ return "#f7505a"; }else{ return "#f34400"; } });

      progress.pie.vars.paths.transition()
          .ease("sin")
           .duration(250)
           .attrTween("d", progress.pie.tweenPie);

    },

    showOverallMarks: function() {

      var color = d3.scale.category20();
      var pie = d3.layout.pie().sort(null);

      var pieData = [];
      progress.data.forEach( function(value, index, array) {
        var tmpArray = [value.overallMark];
        tmpArray.push(100 - value.overallMark);
        pieData.push(tmpArray);
      });

      progress.pie.vars.svg = d3.select( progress.pie.vars.pieEl ).selectAll("svg")
              .data(pieData)
              .enter()
              .append("svg")
                .attr("width", progress.pie.vars.pieWidth)
                .attr("height", progress.pie.vars.pieHeight);

      progress.pie.vars.paths = progress.pie.vars.svg.selectAll("path")
        .data(function(d, i){ return pie(d) })
        .enter().append("path")
          .attr("fill", function(d, i) { if(i % 2 === 0 ){ return "#f7505a"; }else{ return "#e8e8e8"; } })
          .attr("transform", "translate(" + (progress.pie.vars.pieWidth / 2) + ", " + (progress.pie.vars.pieHeight / 2) + ")");

      progress.pie.vars.paths.transition()
          .ease("linear")
           .duration(5000)
           .attrTween("d", progress.pie.tweenPie)
           .each(function(d) { this._current = d; }); // store the initial angles

    },

    showModuleNames: function() {

      // collect names of modules in array
      var moduleNames = [];
      progress.data.forEach(function(value, index, array) {
        var tmpArray = [value.name];
        moduleNames.push(tmpArray);
      });

      var svgns = "http://www.w3.org/2000/svg"; // SVG namespace
      var textNode; // node for module name
      var svgs = progress.pie.vars.pieEl.getElementsByTagName('svg');

      var i = 0;
      while(i < moduleNames.length) {

        // create a new text element and append a text node inside it
        // with the correct module name
        var textEl = document.createElementNS(svgns, 'text'),
        textNode = document.createTextNode( moduleNames[i] );
        textEl.appendChild(textNode);

        // set attributes to place it in the middle of the pie charts
        textEl.setAttribute("transform", "translate(" + 92 + ", " + 75 + ")");
        textEl.setAttribute('text-anchor', "middle");
        textEl.setAttribute('alignment-baseline', "middle");
        textEl.classList.add("moduleName");

        // finally append it to the svg element
        svgs[i].appendChild(textEl);
    
        i++;
      }

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

  /**
  *
  * Fetch the module data asynchronously
  * and if the call is successful modify the data
  * into the required format (with arrays) and show all
  * the graphs on the page.
  *
  **/
  
  function getData(url) {
    
    d3.json( url , function(err, json) {

      /**
      *
      * If an error occurs from the url
      * log it to the console
      *  
      *  TODO
      *
      *  - Append an error message to the page instead of
      *    just logging it to the console.
      *
      **/
      
      if( err ) return console.log(err.message);

      // return json into array form 
      progress.data = arrayify(json);

      // show pie charts on the page
      progress.pie.show();

    });

  }

  /**
  *
  * Block comment
  *
  **/
  
  function arrayify(json) {

    json.forEach( function(module, index, array) {

        var tmpNames = [], tmpMarks = [], tmpWeights = [];

        for(workName in module.work)
        {
          // push assessment names to tmp array
          tmpNames.push(workName);

          for(key in module.work[workName])
          {
            if( key == "mark") 
              tmpMarks.push(module.work[workName][key]);
            else 
              tmpWeights.push(module.work[workName][key]);

          }
        }

        // overide what the work object was
        module.work = {},

        // assign new arrays to object properties
        module.work.names = tmpNames,
        module.work.weights = tmpWeights,
        module.work.marks = tmpMarks;

    }, this);

    return json;

  }

  function toArray(list) {
    var i, array = [];
    for  (i=0; i<list.length;i++) {array[i] = list[i];}
    return array;
  }

  function populateArray(property) {
    // create a temporary array
    var tmpArray = [];

    progress.data.forEach(function(value, index, array) {
      tmpArray.push(value.property);
    });

    // return the array  
    return tmpArray;
  }

  /**
  *
  * Return the progress object
  *
  **/
  return progress;

}();