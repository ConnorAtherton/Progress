progress = function() {
    'use strict';

      var progress = {
      version: '0.0.1',
      data: 'Haven\'t received any data yet'
    };

    var el;

    /**
    *
    * Progress constructor, takes an element you pass it and stores it as a global plugin
    * variable used as a container for all the visualisations. Doesn\'t actually displays the data
    * but calls getData() which does that.
    *
    **/
    
    progress.init = function(element, url) {

      // error checking
      if( arguments.length === 0 ) throw new TypeError('Function expects two parameters, none given.');
      // error check for arguments of length 1

      typeof element === 'string' ? el = document.getElementById( element ) : el = element;
      
      /**
      
        TODO:
        - USE RegExp to error check the url (maybe?)
      
      **/
      
      // store it, maybe use it for later 
      var id = el.getAttribute('data-user-id');
      if ( id.trim() === 'undefined' || id.trim() === '' ) throw new Error('A user id cannot be undefined or empty');

      el.setAttribute('id', 'progress');

      // get data from url 
      getData( url, id );

    }

    progress.pie = {

      vars: {
        drawn: false,
        status: 'marks',
        svgWidth : 750,
        pieWidth: 180,
        pieHeight : 180,
        outerRadius : 75,
        innerRadius: 70,
        pieEl: document.createElement('div'),
        paths: null,
        svg: null,
        text: null,
        clickTarget: null,
        tooltip: null,
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
          * Create a new DOM element that will be the click trigger and give it a 
          * some custom
          * attributes so it can be targeted within the script and
          * in CSS.
          *
          **/
          
          progress.pie.vars.clickTarget = document.createElement('div');
          progress.pie.vars.clickTarget.classList.add('btn');
          progress.pie.vars.clickTarget.setAttribute('data-update', 'weights');
          progress.pie.vars.clickTarget.innerHTML = 'Show Weights';
          progress.pie.vars.pieEl.appendChild( progress.pie.vars.clickTarget );

          /**
          *
          * Add a click event listener and based on the clicktarget's 
          * 'data-update' attribute choose to update the weights or the
          * marks.
          *
          **/
          
          d3.select(progress.pie.vars.clickTarget).on('click', function() {
            progress.pie.vars.status === 'marks' ? progress.pie.updateWeights(this) : progress.pie.updateMarks(this);
          });

          // Append created DOM element to the element used for the plugin.
          progress.pie.vars.pieEl.setAttribute('id', 'progressPie');
          progress.pie.vars.pieEl.classList.add('progressPieMarks');
          el.appendChild( progress.pie.vars.pieEl );

          // Show the initial state of the pie charts and add the module names.
          progress.pie.showOverallMarks();
          progress.pie.showModuleNames();

          // create the tooltip, hide it and append it to the dom
          progress.pie.vars.tooltip = document.createElement('div');
          progress.pie.vars.tooltip.setAttribute('id', 'pieTooltip');
          progress.pie.vars.tooltip.classList.add('tooltip');
          progress.pie.vars.tooltip.style.display = 'none';
          document.body.appendChild( progress.pie.vars.tooltip );

          // add an event listener to each path
          d3.selectAll('path').on('mouseover', function(d, i) {

            // change the inner html depending on the data
            if(progress.pie.vars.status === 'marks')
            { 
              progress.pie.vars.tooltip.innerHTML = 'Overall Mark: ' + d.value + '%';
            }
            else
            {
              progress.pie.vars.tooltip.innerHTML = 'Module weight: ' + d.value + '%';
            }

            progress.pie.showTooltip();
          });

          // add an event listener to each path
          d3.selectAll('path').on('mouseout', function(d, i) {
              progress.pie.removeTooltip();
          });

          progress.pie.vars.drawn = true;

      },

      hide: function() {
        console.log('hide the pie charts');
      },

      showTooltip: function() {

        var coords = d3.mouse(document.body);

        // add initial inline styles
        progress.pie.vars.tooltip.style.position = 'absolute';
        progress.pie.vars.tooltip.style.left = (coords[0] - 50 )+ 'px';
        progress.pie.vars.tooltip.style.top = (coords[1] + 15) + 'px';

        // show the tooltip on the page
        progress.pie.vars.tooltip.style.display = 'inline';

      },

      removeTooltip: function() {

        // hide the tooltip from the page
        progress.pie.vars.tooltip.style.display = 'none';

        // reset the tooltip coords
        progress.pie.vars.tooltip.style.left = 0;
        progress.pie.vars.tooltip.style.top = 0;

        // reset d3.event so we can register other events
        d3.event = '';

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

        progress.pie.vars.clickTarget.innerHTML = 'Show Marks';

        var pie = d3.layout.pie().sort(null);

        var pieData = [];
        progress.data.forEach( function(value, index, array) {
          pieData.push(value.work.weights);
        });

        // change status to overall marks
        progress.pie.vars.status = 'weights';

        progress.pie.vars.svg = progress.pie.vars.svg
                .data(pieData);

        progress.pie.vars.paths = progress.pie.vars.paths
            .data(function(d, i){ return pie(d) });

        progress.pie.vars.paths.exit().remove();
        progress.pie.vars.paths.enter().append('path')
          .attr('class', 'weights')
          .attr('transform', 'translate(' + (progress.pie.vars.pieWidth / 2) + ', ' + (progress.pie.vars.pieHeight / 2) + ')');

        progress.pie.vars.paths.transition()
            .ease('sin')
             .duration(250)
             .attrTween('d', progress.pie.tweenPie);

        progress.pie.vars.paths.on('mouseover', function(d, i) {

            // change the inner html depending on the data
            if(progress.pie.vars.status === 'marks')
            { 
              progress.pie.vars.tooltip.innerHTML = 'Overall Mark: ' + d.value + '%';
            }
            else
            {
              progress.pie.vars.tooltip.innerHTML = 'Module weight: ' + d.value + '%';
            }
            
            progress.pie.showTooltip(d, this);

          });

        progress.pie.vars.paths.on('mouseout', function(d, i) {
              progress.pie.removeTooltip();
          });

        // clear the container's class lits then update class to represent pie state
        progress.pie.vars.pieEl.className = '';
        progress.pie.vars.pieEl.classList.add('progressPieWeights');

      },

      updateMarks: function(that) {

        progress.pie.vars.clickTarget.innerHTML = 'Show Weights';

        var pie = d3.layout.pie().sort(null);

        var pieData = [];
        progress.data.forEach( function(value, index, array) {
          var tmpArray = [value.overallMark];
          tmpArray.push(100 - value.overallMark);
          pieData.push(tmpArray);
        });

        // change attribute to weights
        progress.pie.vars.status = 'marks';

        progress.pie.vars.svg = progress.pie.vars.svg
            .data(pieData);

        progress.pie.vars.paths = progress.pie.vars.paths
            .data(function(d, i){ return pie(d) });

        // handle exit and enter selections
        progress.pie.vars.paths.exit().remove();
        progress.pie.vars.paths.enter().append('path');

        progress.pie.vars.paths.transition()
            .ease('sin')
             .duration(250)
             .attrTween('d', progress.pie.tweenPie);

        // clear the container's class lits then update class to represent pie state
        progress.pie.vars.pieEl.className = '';
        progress.pie.vars.pieEl.classList.add('progressPieMarks');

      },

      showOverallMarks: function() {

        var pie = d3.layout.pie().sort(null);

        var pieData = [];
        progress.data.forEach( function(value, index, array) {
          var tmpArray = [value.overallMark];
          tmpArray.push(100 - value.overallMark);
          pieData.push(tmpArray);
        });

        progress.pie.vars.svg = d3.select( progress.pie.vars.pieEl ).selectAll('svg')
                .data(pieData)
                .enter()
                .append('svg')
                  .attr('width', progress.pie.vars.pieWidth)
                  .attr('height', progress.pie.vars.pieHeight);

        progress.pie.vars.paths = progress.pie.vars.svg.selectAll('path')
          .data(function(d, i){ return pie(d) })
          .enter().append('path')
            .attr('transform', 'translate(' + (progress.pie.vars.pieWidth / 2) + ', ' + (progress.pie.vars.pieHeight / 2) + ')');
        progress.pie.vars.paths.transition()
            .ease('linear')
             .duration(5000)
             .attrTween('d', progress.pie.tweenPie)
             .each(function(d) { this._current = d; }); // store the initial angles

      },

      showModuleNames: function() {

        // collect names of modules in array
        var moduleNames = [];
        progress.data.forEach(function(value, index, array) {
          var tmpArray = [value.name];
          moduleNames.push(tmpArray);
        });

        var svgns = 'http://www.w3.org/2000/svg'; // SVG namespace
        var textNode; // node for module name
        var svgs = progress.pie.vars.pieEl.getElementsByTagName('svg');

        var i = 0;
        while(i < moduleNames.length) {

          // create text element and append a text node inside that
          // with the correct module name
          var textEl = document.createElementNS(svgns, 'text'),
          textNode = document.createTextNode( moduleNames[i] );
          textEl.appendChild(textNode);

          // set attributes to place it in the middle of the pie charts
          textEl.setAttribute('transform', 'translate(' + (progress.pie.vars.pieWidth / 2) + ', ' + (progress.pie.vars.pieHeight / 2) + ')');
          textEl.setAttribute('text-anchor', 'middle');
          textEl.setAttribute('alignment-baseline', 'middle');

          // finally append it to the svg element
          svgs[i].insertBefore(textEl, svgs[i].firstChild);
      
          i++;
        }

      }

    }

    progress.scatter = {

      vars: {
        data: {},
        svg: null,
        circles: null,
        width: 650,
        height: 550,
        padding: 35,
        scatterEl: document.createElement('div'),
        scatterCurrentPercentEl: document.createElement('div'),
        scatterForecastPercentEl: document.createElement('div'),
        scatterListEl: document.createElement('div'),
        xScale: null,
        yScale: null,
        xAxis: null,
        yAxis: null,
        line: null,
        tooltip: null
      },

      show: function() {

        var self = progress.scatter;

        // build scatter data
        self.formatData();

        // build scatter list of modules
        self.populateModules();

        // create all elements
        self.vars.scatterCurrentPercentEl.innerHTML = '<h2>Current Percentage</h2>';
        self.vars.scatterForecastPercentEl.innerHTML = '<h2>Forecasted Percentage</h2>';

        self.addIDToDisplayElements();

        // append all elements to the scatter element before appending to page
        self.vars.scatterEl.appendChild( self.vars.scatterCurrentPercentEl );
        self.vars.scatterEl.appendChild( self.vars.scatterForecastPercentEl );

        // draw the axis and data on to the svg
        progress.scatter.createScatterGraph();

        // create the tooltip, hide it and append it to the dom
        progress.scatter.vars.tooltip = document.createElement('div');
        progress.scatter.vars.tooltip.setAttribute('id', 'scatterTooltip');
        progress.scatter.vars.tooltip.classList.add('tooltip');
        progress.scatter.vars.tooltip.style.display = 'none';
        document.body.appendChild( progress.scatter.vars.tooltip );

        // append all elements to the scatter element before appending to page
        self.vars.scatterEl.appendChild( self.vars.scatterListEl );
        self.vars.scatterEl.appendChild( self.vars.scatterCurrentPercentEl );
        self.vars.scatterEl.appendChild( self.vars.scatterForecastPercentEl );

        // finally install the parent element to the page
        el.appendChild( this.vars.scatterEl );

        d3.selectAll('.scatterModule').on('click' , function() {
          // find the currently selected module and remove it
          var selected = d3.select('.scatterCurrent')[0][0];
          selected.classList.remove('scatterCurrent');

          // add the selected class to the clicked module
          this.classList.add('scatterCurrent');

          if( this.innerHTML == 'Overall Modules')
          {
            progress.scatter.update(progress.scatter.vars.data.overall);
          }
          else
          {
            progress.scatter.update(progress.scatter.vars.data[this.innerHTML]);
          }

        });

        // listen for hovers
        progress.scatter.vars.circles.on('mouseover', function (d) {
          progress.scatter.showTooltip(d);
        });

        progress.scatter.vars.circles.on('mouseout', function (d) {
          progress.scatter.removeTooltip();
        });


      },

      update: function(d) {

        // remove the scatter line
        d3.select('.scatterLine')
          .remove();

        // update x axis domain
        progress.scatter.vars.xScale
          .domain( d.map( function(d) { return d.name }))

        progress.scatter.createLine(d);

        // Update x-axis values
        progress.scatter.vars.svg.select(".x.axis")
            .transition()
            .duration(300)
            .call(progress.scatter.vars.xAxis);

        // Update all circles
        progress.scatter.vars.svg.selectAll("circle")
           .data(d)
           .transition()
           .duration(500)
           .attr('cx', function(d) {
             return progress.scatter.vars.xScale(d.name);
           })
           .attr('cy', function(d) {
             return progress.scatter.vars.yScale(d.mark);
           });

        // enter selection
        progress.scatter.vars.circles = progress.scatter.vars.svg.selectAll("circle")
          .data(d)
          .enter()
          .append('circle')
          .attr('fill', function(d) { return '#fff'})
          .attr('cx', function(d) {
            return progress.scatter.createRandomPoint();
          })
          .attr('cy', function(d) {
            return progress.scatter.createRandomPoint();
          })
          .transition()
          .duration(500)
          .attr('fill', '#f7505a')
          .attr('cx', function(d) {
            return progress.scatter.vars.xScale(d.name);
          })
          .attr('cy', function(d) {
            return progress.scatter.vars.yScale(d.mark);
          })
          .attr('r', 4)
          .attr('class', 'scatterData');

        // handle exit selections
        progress.scatter.vars.circles = progress.scatter.vars.svg.selectAll("circle")
          .data(d)
          .exit()
          .transition()
                .duration(250)
                .style("fill-opacity", 1e-6)
                .remove();
        
        // listen for hovers
        progress.scatter.vars.svg.selectAll("circle").on('mouseover', function (d) {
          progress.scatter.showTooltip(d);
        });

       progress.scatter.vars.svg.selectAll("circle").on('mouseout', function (d) {
          progress.scatter.removeTooltip();
        });

           
      },

      createScatterGraph: function() {

        progress.scatter.vars.svg = d3.select( progress.scatter.vars.scatterEl )
          .append("svg")
          .attr("width", progress.scatter.vars.width)
          .attr("height", progress.scatter.vars.height);

        progress.scatter.vars.xScale = d3.scale.ordinal()
          .domain( progress.scatter.vars.data.overall.map( function(d) { return d.name }))
          .rangePoints([progress.scatter.vars.padding, progress.scatter.vars.width - (progress.scatter.vars.padding)]);

        progress.scatter.vars.yScale = d3.scale.linear()
          .domain([0, 100])
          .range([progress.scatter.vars.height - progress.scatter.vars.padding, progress.scatter.vars.padding]);

        progress.scatter.vars.xAxis = d3.svg.axis()
          .scale( progress.scatter.vars.xScale )
          .orient('bottom');

        progress.scatter.vars.yAxis = d3.svg.axis()
          .scale( progress.scatter.vars.yScale )
          .orient('left')
          .ticks(10);

        progress.scatter.vars.svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + (progress.scatter.vars.height - progress.scatter.vars.padding) + ')')
          .call( progress.scatter.vars.xAxis );

        progress.scatter.vars.svg.append('g')
          .attr('class', 'y axis')
          .attr('transform', 'translate(' + progress.scatter.vars.padding + ',0)')
          .call( progress.scatter.vars.yAxis );

        // add the line going through the data points
        progress.scatter.createLine(progress.scatter.vars.data.overall);

        // actually add the data here
        progress.scatter.vars.circles = progress.scatter.vars.svg.selectAll('circle')
          .data( progress.scatter.vars.data.overall )
          .enter()
          .append('circle')
          .attr('cx', function(d) {
            return progress.scatter.vars.xScale(d.name);
          })
          .attr('cy', function(d) {
            return progress.scatter.vars.yScale(d.mark);
          })
          .attr('r', 4)
          .attr('class', 'scatterData');


      },

      hide: function() {

      },

      addIDToDisplayElements: function() {

        progress.scatter.vars.scatterForecastPercentEl.setAttribute('id', 'scatterForecastElement')
        progress.scatter.vars.scatterCurrentPercentEl.setAttribute('id', 'scatterCurrentElement')
        progress.scatter.vars.scatterListEl.setAttribute('id', 'scatterListElement');
        progress.scatter.vars.scatterEl.setAttribute('id', 'progressScatter');

      },

      createLine: function(data) {

        progress.scatter.vars.line = d3.svg.line()
          .x( function(d) { 
              return progress.scatter.vars.xScale(d.name);
          })
          .y( function(d) { 
               return progress.scatter.vars.yScale(d.mark);
          })
          .interpolate('cardinal');

        progress.scatter.vars.linegroup = progress.scatter.vars.svg.append('svg:g');

        // create a group element for the line
        progress.scatter.vars.line = progress.scatter.vars.linegroup
          .append('svg:path')
          .attr('stroke', function(d) { return '#ffffff'; })
          .transition()
          .duration(500)
          .attr("fill", function(d) { return "none"; })
          .attr("stroke-width", function(d) { return "1.5px"; }) 
          .attr("stroke", function(d) { return "#666"; })
          .attr("z-index", function() { return -100 })
          .attr('d', progress.scatter.vars.line(data))
          .attr('class', 'scatterLine');

      },

      populateModules: function() {

        var tmpEl = document.createElement('div');
        tmpEl.innerHTML = 'Overall Modules';
        tmpEl.classList.add('scatterModule');
        tmpEl.classList.add('scatterCurrent');
        // append the module to the list in the DOM
        progress.scatter.vars.scatterListEl.appendChild(tmpEl);

          // loop through data
          progress.scatter.vars.data.overall.forEach( function( value, index, array) {
            var tmpEl = document.createElement('div');
            tmpEl.innerHTML = value.name;
            tmpEl.classList.add('scatterModule');
            tmpEl.classList.add(value.name);

            // append the module to the list in the DOM
            progress.scatter.vars.scatterListEl.appendChild(tmpEl);
          }, this);

      },

      formatData: function() {

        progress.scatter.vars.data.overall = [];

        progress.data.forEach( function( value ) {

          // add the module name and overall mark to date in the overall array
          var tmpObj = {'name': value.name, 'mark': value.overallMark}
          progress.scatter.vars.data.overall.push(tmpObj)

          // create a new array in data object for this module
          progress.scatter.vars.data[value.name] = [];

          var tmpNames = [];
          var tmpMarks = [];

          value.work.names.forEach( function(work) {
            tmpNames.push(work);
          });

          value.work.marks.forEach( function(marks) {
            tmpMarks.push(marks);
          });

          for (var i = 0; i < tmpMarks.length; i++) {
            var tmpObj = {'name': tmpNames[i], 'mark': tmpMarks[i]}
            progress.scatter.vars.data[value.name].push(tmpObj);
          };

        }, this);

      },

      createRandomPoint: function() {
        return Math.floor(Math.random() * progress.scatter.vars.height);
      },

      showTooltip: function(data) {

        var coords = d3.mouse(document.body);

        // add initial inline styles
        progress.scatter.vars.tooltip.style.position = 'absolute';
        progress.scatter.vars.tooltip.style.left = (coords[0] - 50 )+ 'px';
        progress.scatter.vars.tooltip.style.top = (coords[1] + 15) + 'px';

        // set the inner html to the module name
        progress.scatter.vars.tooltip.innerHTML = data.mark + '%';

        // show the tooltip on the page
        progress.scatter.vars.tooltip.style.display = 'inline';

      },

      removeTooltip: function() {

        // hide the tooltip from the page
        progress.scatter.vars.tooltip.style.display = 'none';

        // reset the tooltip coords
        progress.scatter.vars.tooltip.style.left = 0;
        progress.scatter.vars.tooltip.style.top = 0;

        // reset d3.event so we can register other events
        d3.event = '';

      },

    }

    progress.force = {

      vars: {
        data: {},
        svg: null,
        tooltip: null,
        width: 900,
        height: 550,
        forceEl: document.createElement('div'),
        charge: -120,
        friction: 0.8,
        distance: 50
      },

      show: function() {

        // format the data
        progress.force.vars.data = progress.force.formatData(progress.data);

        var color = d3.scale.category20();

        // create the tooltip, hide it and append it to the dom
        progress.force.vars.tooltip = document.createElement('div');
        progress.force.vars.tooltip.setAttribute('id', 'forceTooltip');
        progress.force.vars.tooltip.classList.add('tooltip');
        progress.force.vars.tooltip.style.display = 'none';
        document.body.appendChild( progress.force.vars.tooltip );

        // store d3 force layout in a force variables for reuse
        progress.force.vars.force = d3.layout.force()
          .charge(progress.force.vars.charge)
          .linkDistance(35)
          .friction(progress.force.vars.friction)
          .distance(progress.force.vars.distance)
          .size([ progress.force.vars.width, progress.force.vars.height ]);

        // create the svg element and store
        progress.force.vars.forceEl.setAttribute('id', 'progressForce');
        el.appendChild( progress.force.vars.forceEl );

        progress.force.vars.svg = d3.select( progress.force.vars.forceEl ).append('svg')
          .attr('width', progress.force.vars.width)
          .attr('height', progress.force.vars.height);

        progress.force.vars.force
          .nodes(progress.force.vars.data.nodes)
          .links(progress.force.vars.data.links)
          .start();

        var link = progress.force.vars.svg.selectAll('.link')
          .data(progress.force.vars.data.links)
        .enter().append('line')
          .attr('class', 'link');

        var node = progress.force.vars.svg.selectAll('.node')
          .data(progress.force.vars.data.nodes)
        .enter().append('circle')
          .attr('class', 'node')
          .attr('r', 4)
          .style('fill', function(d) { return color(d.group); })
          .call(progress.force.vars.force.drag)
          .on('mouseover', function(d) {
            progress.force.showTooltip(d);
          })
          .on('mouseout', function(d) {
            progress.force.removeTooltip();
          });

        // try reduce the inital bounce
        forwardAlpha(progress.force.vars.force, 0.2);

        progress.force.vars.force.on('tick', function() {
          link.attr('x1', function(d) { return d.source.x; })
              .attr('y1', function(d) { return d.source.y; })
              .attr('x2', function(d) { return d.target.x; })
              .attr('y2', function(d) { return d.target.y; });

          node.attr('cx', function(d) { return d.x; })
              .attr('cy', function(d) { return d.y; });
    });


      },

      hide: function() {

      },

      formatData: function(data) {

        // create a temporary array to build up our data object
        var tmpObj = {'nodes':[], 'links':[]}

        // variable that assigns a group to nodes of same module
        var i = 2;
        // holds ths current position of the array node
        var arrayPos = 1;

        tmpObj['nodes'].push({'name': 'you', 'group': 1});

        for (var module in progress.data) {

          // actual module node that module work has to link too
          var currentParentNode = arrayPos;

            // add module name to nodes and link back to root node
            tmpObj['nodes'].push({'name': progress.data[module].name, 'group': i });
            tmpObj['links'].push({'source': arrayPos, 'target': 0});

            // pushed another so update array position
            arrayPos++;

            // loop through assesment names and link them to their parent module
            progress.data[module].work.names.forEach( function(workName) {

              tmpObj['nodes'].push({'name': workName, 'group': i});
              tmpObj['links'].push({'source': arrayPos, 'target': currentParentNode});
              arrayPos++;

            });

          // increment the counters
          i++;

        }

          return tmpObj;

      }, 

      showTooltip: function(data) {

        var coords = d3.mouse(document.body);

        // add initial inline styles
        progress.force.vars.tooltip.style.position = 'absolute';
        progress.force.vars.tooltip.style.left = (coords[0] - 50 )+ 'px';
        progress.force.vars.tooltip.style.top = (coords[1] + 15) + 'px';

        // show the tooltip on the page
        progress.force.vars.tooltip.style.display = 'inline';

        // set the inner html to the module name
        progress.force.vars.tooltip.innerHTML = data.name;

        // show the tooltip on the page
        progress.force.vars.tooltip.style.display = 'inline';

      },

      removeTooltip: function() {

        // hide the tooltip from the page
        progress.force.vars.tooltip.style.display = 'none';

        // reset the tooltip coords
        progress.force.vars.tooltip.style.left = 0;
        progress.force.vars.tooltip.style.top = 0;

        // reset d3.event so we can register other events
        d3.event = '';

      },

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

        // save the data into a module var to be used elsewhere
        progress.data = arrayify(json);

        // show pie charts on the page
        progress.pie.show();

        // show force diagram on the page
        progress.force.show();

        // show scatter diagram on page
        progress.scatter.show();

      });

    }

    /**
    *
    * Functiomn to reduce the initial 'bouncing' of the force layout
    *
    **/
    function forwardAlpha(layout, alpha, max) {
      alpha = alpha || 0;
      max = max || 1000;
      var i = 0;
      while(layout.alpha() > alpha && i++ < max) layout.tick();
    }

    /**
    *
    * Block comment
    *
    **/
    
    function arrayify(json) {

      json.forEach( function(module, index, array) {

          var tmpNames = [], tmpMarks = [], tmpWeights = [];

          for( var workName in module.work)
          {
            // push assessment names to tmp array
            tmpNames.push(workName);

            for( var key in module.work[workName])
            {
              if( key == 'mark') 
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