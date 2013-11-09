Progress = (function(opts) {
  "use strict";

  opts = opts || {};

  // Global private variables 
  var _globalElement,
      _tooltip,
      _data,
      _converter = opts.converter || converter;

  // d3 global variables
  var _color = d3.scale.category20(),
      _pie = d3.layout.pie().sort(null);

  var init = function() {

    try {

      // create tooltip 
      createTooltip();

      if(!('element' in opts)){
        throw new Error('An element must be supplied');
        return;
      }
      else {
        typeof opts.element === 'string' ? _globalElement = document.getElementById( opts.element ) : _globalElement = opts.element;
      }

      if(!('url' in opts)) {
        throw new Error('A URL must be supplied');
        return;
      }

      getData(opts.url);
      
                
    } catch(e) {

      console.error('Error initializing Progress - ', e.message, opts);

    }

  }

  // create namespaces
  var pie = {},
      scatter = {},
      force = {};

  pie.vars = {
        drawn: false,
        status: 'marks',
        svgWidth : 750,
        pieWidth: 180,
        pieHeight : 180,
        outerRadius : 75,
        innerRadius: 68,
        pieEl: document.createElement('div'),
        paths: null,
        svg: null,
        text: null,
        clickTarget: null,
        startValue: {startAngle: 6.28, endAngle: 0}
  }

        pie.show = function() {

            // If the pie chart is already drawn don't redraw
            if(pie.vars.drawn) return;
     
            /**
            *
            * Create a new DOM element that will be the click trigger and give it a 
            * some custom
            * attributes so it can be targeted within the script and
            * in CSS.
            *
            **/
            
            pie.vars.clickTarget = document.createElement('div');
            pie.vars.clickTarget.setAttribute('id', 'progressPieClickTarget');
            pie.vars.clickTarget.innerHTML = 'Show Weights';
            pie.vars.pieEl.appendChild( pie.vars.clickTarget );

            // Append created DOM element to the element used for the plugin.
            pie.vars.pieEl.setAttribute('id', 'progressPie');
            pie.vars.pieEl.classList.add('progressPieMarks');
            _globalElement.appendChild( pie.vars.pieEl );

            // Show the initial state of the pie charts and add the module names.
            pie.showOverallMarks();
            pie.showModuleNames();

            /**
            *
            * Add a click event listener and based on the clicktarget's 
            * 'data-update' attribute choose to update the weights or the
            * marks.
            *
            **/
            
            d3.select(pie.vars.clickTarget).on('click', function() {
              pie.vars.status === 'marks' ? pie.updateWeights(this) : pie.updateMarks(this);
            });

            // change the pie charts state so they won't be redrawn
            pie.vars.drawn = true;

        },

        pie.tweenPie = function(b) {
          var arc = d3.svg.arc()
                      .innerRadius(pie.vars.innerRadius)
                      .outerRadius(pie.vars.outerRadius);
             
          var i   = d3.interpolate((this._current || pie.vars.startValue),  b);

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
        
        pie.updateWeights = function(that) {

          pie.vars.clickTarget.innerHTML = 'Show Marks';

          var pieData = [];
          _data.forEach( function(value, index, array) {

            pieData.push(value.work.weights);

          });

          // change status to overall marks
          pie.vars.status = 'weights';
          
          pie.vars.svg = pie.vars.svg
              .data(pieData);

          pie.vars.paths = pie.vars.paths
              .data(function(d, i){ return _pie(d) });

          // handle exit and enter selections
          pie.vars.paths.exit().remove();
          pie.vars.paths.enter().append('path')
              .attr('transform', 'translate(' + (pie.vars.pieWidth / 2) + ', ' + (pie.vars.pieHeight / 2) + ')');

          pie.vars.paths.transition()
              .ease('sin')
               .duration(300)
               .attrTween('d', pie.tweenPie);

          pie.vars.paths.on('mouseover', function(d, i) {

              var data;

              // change the inner html depending on the data
              if(pie.vars.status === 'marks')
              { 
                data = 'Overall Mark: ' + d.value + '%';
              }
              else
              {
                console.log(d);
                data = 'Module: ' + d.name + '\n Weight: ' + d.value + '%';
              }
              
              showTooltip(data);

            });

          pie.vars.paths.on('mouseout', function(d, i) {
                removeTooltip();
            });

          // clear the container's class lits then update class to represent pie state
          pie.vars.pieEl.className = '';
          pie.vars.pieEl.classList.add('progressPieWeights');

        },

        pie.updateMarks = function(that) {

          _pie = d3.layout.pie().sort(null);

          pie.vars.clickTarget.innerHTML = 'Show Weights';

          var pieData = [];
          _data.forEach( function(value, index, array) {
            var tmpArray = [value.overallMark];
            tmpArray.push(100 - value.overallMark);
            pieData.push(tmpArray);
          });

          // change attribute to weights
          pie.vars.status = 'marks';

          pie.vars.svg = pie.vars.svg
              .data(pieData);

          pie.vars.paths = pie.vars.paths
              .data(function(d, i){ return _pie(d) });

          // handle exit and enter selections
          pie.vars.paths.exit().remove();
          pie.vars.paths.enter().append('path')
              .attr('transform', 'translate(' + (pie.vars.pieWidth / 2) + ', ' + (pie.vars.pieHeight / 2) + ')');

          pie.vars.paths.transition()
              .ease('sin')
               .duration(250)
               .attrTween('d', pie.tweenPie);;

          // clear the container's class lits then update class to represent pie state
          pie.vars.pieEl.className = '';
          pie.vars.pieEl.classList.add('progressPieMarks');

        },

        pie.showOverallMarks = function() {

          _pie = d3.layout.pie().sort(null);

          var pieData = [];
          _data.forEach( function(value, index, array) {
            var tmpArray = [value.overallMark];
            tmpArray.push(100 - value.overallMark);
            pieData.push(tmpArray);
          });

          pie.vars.svg = d3.select( pie.vars.pieEl ).selectAll('svg')
                  .data(pieData)
                  .enter()
                  .append('svg')
                    .attr('width', pie.vars.pieWidth)
                    .attr('height', pie.vars.pieHeight);

          pie.vars.paths = pie.vars.svg.selectAll('path')
            .data(function(d, i){ return _pie(d) })
            .enter().append('path')
              .attr('transform', 'translate(' + (pie.vars.pieWidth / 2) + ', ' + (pie.vars.pieHeight / 2) + ')');

          pie.vars.paths.transition()
              .ease('linear')
               .duration(5000)
               .attrTween('d', pie.tweenPie)
               .each(function(d) { this._current = d; }); // store the initial angles

        },

        pie.showModuleNames = function() {

          // collect names of modules in array
          var moduleNames = [];
          _data.forEach(function(value, index, array) {
            var tmpArray = [value.name, value.overallMark];
            moduleNames.push(tmpArray);
          });

          var svgns = 'http://www.w3.org/2000/svg'; // SVG namespace
          var nameNode, markNode; // node for module name
          var svgs = pie.vars.pieEl.getElementsByTagName('svg');

          var i = 0;
          while(i < moduleNames.length) {

            // create text elements and append a text node inside that
            // with the correct module name
            var nameEl = document.createElementNS(svgns, 'text'),
                markEl = document.createElementNS(svgns, 'text');

            nameNode = document.createTextNode( moduleNames[i][0] );
            markNode = document.createTextNode( moduleNames[i][1] + '%' );

            nameEl.appendChild(nameNode);
            markEl.appendChild(markNode);

            // set attributes to place it in the middle of the pie charts
            nameEl.setAttribute('transform', 'translate(' + (pie.vars.pieWidth / 2) + ', ' + ((pie.vars.pieHeight / 2) - 10) + ')');
            markEl.setAttribute('transform', 'translate(' + (pie.vars.pieWidth / 2) + ', ' + ((pie.vars.pieHeight / 2) + 15) + ')');
            markEl.classList.add('pieMarkPercentage');

            // finally append it to the svg element
            svgs[i].insertBefore(nameEl, svgs[i].firstChild);
            svgs[i].insertBefore(markEl, svgs[i].firstChild);
        
            i++;
          }

        }

  scatter.vars =  {
    data: {},
    drawn: false,
    svg: null,
    circles: null,
    width: 650,
    height: 550,
    padding: 35,
    scatterEl: document.createElement('div'),
    scatterCurrentPercentEl: document.createElement('div'),
    scatterForecastPercentEl: document.createElement('div'),
    scatterListEl: document.createElement('div'),
    currentPercentEl: document.createElement('div'),
    forecastPercentEl: document.createElement('div'),
    xScale: null,
    yScale: null,
    xAxis: null,
    yAxis: null,
    line: null,
    lineData: null,
    currentModule: null,
    currentWork: 0
  }

  scatter.show = function() {

    // build scatter data
    scatter.format(_data);

    // build scatter list of modules
    scatter.populateModules();

    // create all elements
    scatter.vars.scatterCurrentPercentEl.innerHTML = '<h2>Current Percentage</h2>';
    scatter.vars.scatterForecastPercentEl.innerHTML = '<h2>Forecasted Percentage</h2>';

    scatter.vars.currentPercentEl.setAttribute('id', 'currentPercentEl');
    scatter.vars.forecastPercentEl.setAttribute('id', 'forecastPercentEl');

    scatter.vars.scatterCurrentPercentEl.appendChild(scatter.vars.currentPercentEl);
    scatter.vars.scatterForecastPercentEl.appendChild(scatter.vars.forecastPercentEl);

    scatter.addIDToDisplayElements();

    // append all elements to the scatter element before appending to page
    scatter.vars.scatterEl.appendChild( scatter.vars.scatterCurrentPercentEl );
    scatter.vars.scatterEl.appendChild( scatter.vars.scatterForecastPercentEl );

    // draw the axis and data on to the svg
    scatter.createScatterGraph();

    // append all elements to the scatter element before appending to page
    scatter.vars.scatterEl.appendChild( scatter.vars.scatterListEl );
    scatter.vars.scatterEl.appendChild( scatter.vars.scatterCurrentPercentEl );
    scatter.vars.scatterEl.appendChild( scatter.vars.scatterForecastPercentEl );

    // finally install the parent element to the page
    _globalElement.appendChild( scatter.vars.scatterEl );

    d3.selectAll('.scatterModule').on('click' , function() {
      // find the currently selected module and remove it
      var selected = d3.select('.scatterCurrent')[0][0];
      selected.classList.remove('scatterCurrent');

      // if another module is clicked on then reset the 
      // forecasted percentage
      scatter.updateForecastPercent(undefined);

      var mark = undefined;

      // add the selected class to the clicked module
      this.classList.add('scatterCurrent');

      if( this.innerHTML == 'Overall Modules')
      {
        scatter.update(scatter.vars.data.overall);
        scatter.updateCurrentPercent(scatter.vars.data.overall.overall);

        scatter.currentModule = scatter.vars.data.overall;
        // work out the overall based on some normalization method
        // call the same method but with the current data
      }
      else
      {
        scatter.update(scatter.vars.data[this.innerHTML]);
        scatter.updateCurrentPercent(scatter.vars.data[this.innerHTML].overall);

        scatter.currentModule = scatter.vars.data[this.innerHTML];

       for(var count = 0; count < scatter.vars.data.overall.length; count++) {

          if(scatter.vars.data.overall[count].name === this.innerHTML) {
            mark = scatter.vars.data.overall[count].mark;
            break;
          }

        }

        if(mark !== (undefined || null)) {
          scatter.updateCurrentPercent(mark);
        } 

      }

    });

    // listen for hovers
    scatter.vars.circles.on('mouseover', function (d) {
      showTooltip(d.mark);
    });

    scatter.vars.circles.on('mouseout', function (d) {
      removeTooltip();
    });

    scatter.vars.drawn = true;

  },

  scatter.update = function(d) {

    // remove the scatter line
    d3.select('.scatterLine').remove();

    // update x axis domain
    scatter.vars.xScale
      .domain( d.map( function(d) { return d.name }))

    // pass the array by value so the node information is not 
    // modified
    scatter.createLine(d.slice());

    // Update x-axis values
    scatter.vars.svg.select(".x.axis")
        .transition()
        .duration(300)
        .call(scatter.vars.xAxis);

    // Update all circles
    scatter.vars.svg.selectAll("circle")
       .data(d)
       .transition()
       .duration(300)
       .attr('cx', function(d) {
         return scatter.vars.xScale(d.name);
       })
       .attr('cy', function(d) {
         return scatter.vars.yScale(d.mark);
       })
       .attr('class', function(d) {
         return scatter.checkForIncompleted(d)
       })

    // enter selection
    scatter.vars.circles = scatter.vars.svg.selectAll("circle")
      .data(d)
      .enter()
      .append('circle')
      .attr('fill', 'green')
      .transition()
      .duration(3000)
      .attr('fill', function(d) { return '#fff'})
      .attr('cx', function(d) {
        return scatter.createRandomPoint();
      })
      .attr('cy', function(d) {
        return scatter.createRandomPoint();
      })
      .attr('fill', '#f7505a')
      .attr('cx', function(d) {
        return scatter.vars.xScale(d.name);
      })
      .attr('cy', function(d) {
        return scatter.vars.yScale(d.mark);
      })
      .attr('r', 4)
      .attr('class', function(d) {
        return scatter.checkForIncompleted(d)
      })

    // handle exit selections
    scatter.vars.circles = scatter.vars.svg.selectAll("circle")
      .data(d)
      .exit() 
      .transition()
      .duration(100)
      .remove();

    var incompletes = scatter.vars.svg.selectAll('.scatterIncomplete').call(drag);
    
    // listen for hovers
    scatter.vars.svg.selectAll("circle").on('mouseover', function (d) {
      showTooltip(d.mark, true);
    });

   scatter.vars.svg.selectAll("circle").on('mouseout', function (d) {
      removeTooltip();
    });

  },

  scatter.createScatterGraph = function() {

    scatter.vars.svg = d3.select( scatter.vars.scatterEl )
      .append("svg")
      .attr("width", scatter.vars.width)
      .attr("height", scatter.vars.height);

    scatter.vars.xScale = d3.scale.ordinal()
      .domain( scatter.vars.data.overall.map( function(d) { return d.name }))
      .rangePoints([scatter.vars.padding, scatter.vars.width - (scatter.vars.padding)]);

    scatter.vars.yScale = d3.scale.linear()
      .domain([0, 100])
      .range([scatter.vars.height - scatter.vars.padding, scatter.vars.padding]);

    scatter.vars.xAxis = d3.svg.axis()
      .scale( scatter.vars.xScale )
      .orient('bottom');

    scatter.vars.yAxis = d3.svg.axis()
      .scale( scatter.vars.yScale )
      .orient('left')
      .ticks(10);

    scatter.vars.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (scatter.vars.height - scatter.vars.padding) + ')')
      .call( scatter.vars.xAxis );

    scatter.vars.svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + scatter.vars.padding + ',0)')
      .call( scatter.vars.yAxis );

    // add the line going through the data points
    scatter.createLine(scatter.vars.data.overall.slice());

    // actually add the data here
    scatter.vars.circles = scatter.vars.svg.selectAll('circle')
      .data( scatter.vars.data.overall )
      .enter()
      .append('circle')
      .attr('cx', function(d) {
        return scatter.vars.xScale(d.name);
      })
      .attr('cy', function(d) {
        return scatter.vars.yScale(d.mark);
      })
      .attr('r', 4)
      .attr('class', 'scatterData')
      .attr('class', function(d) {
        return scatter.checkForIncompleted(d)
      })

      // set the two mark values initially to blank 
      scatter.updateCurrentPercent(undefined);
      scatter.updateForecastPercent(undefined);


  }

  scatter.addIDToDisplayElements = function() {

    scatter.vars.scatterForecastPercentEl.setAttribute('id', 'scatterForecastElement')
    scatter.vars.scatterCurrentPercentEl.setAttribute('id', 'scatterCurrentElement')
    scatter.vars.scatterListEl.setAttribute('id', 'scatterListElement');
    scatter.vars.scatterEl.setAttribute('id', 'progressScatter');
    scatter.vars.currentPercentEl.setAttribute('id', 'currentPercentEl');
    scatter.vars.forecastPercentEl.setAttribute('id', 'forecastPercentEl');

  }

  scatter.checkForIncompleted = function(data) {

    // if the data is incomplete..
    if(!data.completed) return 'scatterIncomplete';

    // ..otherwise return that it is complete
    return 'scatterComplete';

  }

  // data is passed by value rather than by reference
  // because we don't want to modify the original data
  scatter.createLine = function(data) {

    data = scatter.removeIncompleted(data);

    scatter.vars.line = d3.svg.line()
      .x( function(d) { 
          return scatter.vars.xScale(d.name);
      })
      .y( function(d) { 
           return scatter.vars.yScale(d.mark);
      })
      .interpolate('cardinal');

    scatter.vars.linegroup = scatter.vars.svg.append('svg:g');

    // create a group element for the line
    scatter.vars.line = scatter.vars.linegroup
      .append('svg:path')
      .attr('stroke', function(d) { return '#ffffff'; })
      .transition()
      .duration(500)
      .attr("fill", function(d) { return "none"; })
      .attr("stroke-width", function(d) { return "1.5px"; }) 
      .attr("stroke", function(d) { return "#666"; })
      .attr("z-index", function() { return -100 })
      .attr('d', scatter.vars.line(data))
      .attr('class', 'scatterLine');

  }

  scatter.removeIncompleted = function(data) {
    // tmp array to hold indexes of the value we want to splice
    var removeIndex = [];

    // loop through original array finding indexes of work that is incomplete
    data.forEach(function(value, index){
      if(!value.completed) {
        removeIndex.push(index);
      }
    })

    // reverse sort to make sure higher indexes are spliced first
    removeIndex.sort(function(a, b) { return a - b })

    // splice the array...
    for(var i = removeIndex.length - 1; i >= 0; i--) {
      data.splice(removeIndex[i], 1);
    }

    // return the new array with modules removed
    return data;

  }

  scatter.populateModules = function() {

    var tmpEl = document.createElement('div');
    tmpEl.innerHTML = 'Overall Modules';
    tmpEl.classList.add('scatterModule');
    tmpEl.classList.add('scatterCurrent');

    // append the module to the list in the DOM
    scatter.vars.scatterListEl.appendChild(tmpEl);

      // loop through data
      scatter.vars.data.overall.forEach( function( value, index, array) {
        var tmpEl = document.createElement('div');
        tmpEl.innerHTML = value.name;
        tmpEl.classList.add('scatterModule');
        tmpEl.classList.add(value.name);

        // append the module to the list in the DOM
        scatter.vars.scatterListEl.appendChild(tmpEl);
      }, this);

  }

  scatter.format = function(data) {

    scatter.vars.data.overall = [];

    data.forEach( function( value ) {

      var name = value.name;
      var overall = value.overallMark;

      // add the module name and overall mark to date in the overall array
      // assert that the module is completed to start with
      var tmpObj = {'name': value.name, 'mark': value.overallMark, 'completed': true}

      // create a new array in data object for this module
      scatter.vars.data[value.name] = [];

      var tmpNames = [];
      var tmpMarks = [];
      var tmpWeights = [];

      value.work.names.forEach( function(work) {
        tmpNames.push(work);
      });

      value.work.marks.forEach( function(marks) {
        tmpMarks.push(marks);
      });

      value.work.names.forEach( function(work) {
        tmpNames.push(work);
      });

      value.work.weights.forEach( function(marks) {
        tmpWeights.push(marks);
      });

      for (var i = 0; i < tmpMarks.length; i++) {

        if( tmpMarks[i] === (undefined || null) ) {
          tmpObj.completed = false;
        }

        var tmpWorkObj = {'name': tmpNames[i], 'mark': tmpMarks[i], 'weight': tmpWeights[i], 'completed': isComplete(tmpMarks[i])}
        scatter.vars.data[value.name].push(tmpWorkObj);

      };

      scatter.vars.data.overall.push(tmpObj);

    }, this);


  }

  scatter.createRandomPoint = function() {
    return Math.floor(Math.random() * scatter.vars.height);
  }

  scatter.updateCurrentPercent = function(current) {

    if( current === undefined ) {
      current = '-';
    } else {
      // convert the number to correct mark form
      current = _converter(current);
    }

    // update the current percent element div
    scatter.vars.currentPercentEl.innerHTML = current;
  }

  scatter.updateForecastPercent = function(forecast) {
    
    if( forecast === undefined || forecast === NaN ) {
      forecast = '-';
    } else {
      // convert the number to correct mark form
      forecast = _converter(forecast);
    }

    // update the forecast percent element div
    scatter.vars.forecastPercentEl.innerHTML = forecast;
  }

  scatter.ModifyGrades = function(newMark) {

      var incomplete = [];

      // loop through current module 
      // and create new array containing all
      // incomplete pieces of work
      scatter.currentModule.forEach(function(value, index) {
        if (!value.completed) incomplete.push(value);
      }); 

      // using the current index of the module that
      // has been adjusted on the scatter graph modify the mark
      incomplete[scatter.currentWork].mark = newMark;

  }

  scatter.forecast = function(module) {

      var weights = [],
          forecast = 0,
          weightfactor = 0;

      module.forEach(function(assessment) {
        // just return is mark is falsey because
        // we don't want to include it in our calculations
        // HOWEVER if the mark is zero we assume the user
        // has started scrolling and so we allow it
        if(assessment.mark !== 0 && !assessment.mark) return;

        // remember the weight for later
        weights.push(assessment.weight);
        // add the weight * mark to the forecast
        forecast += (assessment.weight * assessment.mark);

        console.log(assessment);

      })

      // calculate the weight factor by adding up all the weights
      for (var i = 0; i < weights.length; i++) {
        weightfactor += weights[i];
      };

      console.log(weightfactor);

      // finally divide the foreacast by the weight factor..
      forecast /= weightfactor;

      console.log('the forcast is ' + forecast);

      // .. and return it
      return forecast;
  }

  force.vars = {
    data: {},
    svg: null,
    width: 900,
    height: 550,
    forceEl: document.createElement('div'),
    charge: -3000,
    friction: 0.8,
    distance: 50,
    keyEl: document.createElement('div')
  }

  force.show = function() {
      // format the data
      force.vars.data = force.format(_data);

      // store d3 force layout in a force variables for reuse
      force.vars.force = d3.layout.force()
        .charge(force.vars.charge)
        .linkDistance(45)
        .gravity(1)
        .friction(force.vars.friction)
        .distance(force.vars.distance)
        .size([ force.vars.width, force.vars.height ]);

      // create the svg element and store
      force.vars.forceEl.setAttribute('id', 'progressForce');
      force.vars.keyEl.setAttribute('id', 'forceKey');
      // append the key to force svg element
      force.vars.forceEl.appendChild(force.vars.keyEl);

      force.vars.svg = d3.select( force.vars.forceEl ).append('svg')
        .attr('width', force.vars.width)
        .attr('height', force.vars.height);

      force.vars.force
        .nodes(force.vars.data.nodes)
        .links(force.vars.data.links)
        .start();

      var link = force.vars.svg.selectAll('.link')
        .data(force.vars.data.links)
      .enter().append('line')
        .attr('class', 'link');

      var node = force.vars.svg.selectAll('.node')
        .data(force.vars.data.nodes)
      .enter().append('circle')
        .attr('class', 'node')
        .attr('r', function(d, i) { 
          return force.calculateRadius(d); 
        })
        .style('fill', function(d) { return force.fillColor(d) })
        .style('stroke', function(d) { return _color(d.group); })
        .call(force.vars.force.drag)
        .on('mouseover', function(d) {
          d.radius ? showTooltip(d.name + ' - ' + d.radius + '%') : showTooltip(d.name);
        })
        .on('mouseout', function(d) {
          removeTooltip();
        });

        // try reduce the inital bounce
        forwardAlpha(force.vars.force, 0.01);

        force.vars.force.on('tick', function() {
          link.attr('x1', function(d) { return d.source.x; })
              .attr('y1', function(d) { return d.source.y; })
              .attr('x2', function(d) { return d.target.x; })
              .attr('y2', function(d) { return d.target.y; });

          node.attr('cx', function(d) { return d.x; })
              .attr('cy', function(d) { return d.y; });
        });

        _globalElement.appendChild( force.vars.forceEl );
        this.addKey();
  }

  force.calculateRadius = function(d) {
    var radius;

    if(d.radius === undefined) return radius = 5;

    return (d.radius / 4);

  }

  force.format = function(data) {

    console.log(data);

    // create a temporary array to build up our data object
    var tmpObj = {'nodes':[], 'links':[]}

    // variable that assigns a group to nodes of same module
    var i = 2;
    // holds ths current position of the array node
    var arrayPos = 1;
    // holds the current modules position and name
    var currentParentPos, currentParentName, currentParentObj;

    tmpObj['nodes'].push({'name': 'You', 'group': 1});

    data.forEach( function(module, index, array) {

      // actual module node that module work has to link too
      currentParentPos = arrayPos,
      currentParentName = module.name;
      currentParentObj = {'name': module.name, 'group': i, 'completed': isComplete(module.overallMark)};

        // add module name to nodes and link back to root node
        tmpObj['nodes'].push(currentParentObj);
        tmpObj['links'].push({'source': arrayPos, 'target': 0});

        // pushed another so update array position
        arrayPos++;

        var length = module.work.names.length,
            j = 0;

        // loop through assesment names and link them to their parent module
        for( j; j < length; j++) {

          // if just one piece of work is incomplete then 
          // the whole module is also
          if(module.work.marks[j] === (undefined || null)) {
            currentParentObj.completed = false;
          }

          tmpObj['nodes'].push({'name': module.work.names[j], 'radius': module.work.weights[j], 'group': i, 'completed': isComplete(module.work.marks[j])});
          tmpObj['links'].push({'source': arrayPos, 'target': currentParentPos});

          arrayPos++;

        }

      // increment the group counter
      i++;

    })

      return tmpObj;
  }

  force.fillColor = function(module) {
    var color;

    if(module.completed) {
      color = 'ffffff';
    } else {
      color = _color(module.group);
    }

    return !module.completed ? 'ffffff' : _color(module.group);
  }

  force.addKey = function() {

    force.vars.svg = d3.select( force.vars.keyEl ).append('svg');

    var filled = force.vars.svg.append('circle')
                  .attr('class', 'keyFilledCircle')
                  .attr('r', 4)
                  .attr('cy', 25)
                  .attr('cx', 25);

    var radius = force.vars.svg.append('circle')
                  .attr('class', 'keyRadiusCircle')
                  .attr('r', 4)
                  .attr('cy', 75)
                  .attr('cx', 25);

    force.vars.svg.append('text').text(function(d){ return ' Work Completed'})
                  .attr('y', 30)
                  .attr('x', 50);

    force.vars.svg.append('text').text(function(d){ return ' Work Incomplete'})
                  .attr('y', 80)
                  .attr('x', 50);

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
      
      if( err ) return console.log(err.response);

      // save the data into a module var to be used elsewhere
      _data = arrayify(json);

      showGraphs();

    });

  }

  function showGraphs() {

    if (!_data || typeof _data === 'undefined') {
      
      return false;

    } else {
      
      // show pie charts on the page
      pie.show();

      // show force diagram on the page
      force.show();

      // show scatter diagram on page
      scatter.show();
      
      return true;

    }

  }

  /**
  *
  * Function to reduce the initial 'bouncing' of the force layout
  *
  **/
  function forwardAlpha(layout, alpha, max) {

    // provide sensible defaults in case
    // only one arg was passed
    alpha = alpha || 0;
    max = max || 1000;
    var i = 0

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

  // tooltip functions
  function createTooltip() {

    // create the tooltip, hide it and append it to the dom
    _tooltip = d3.select("body").append("div")   
        .attr("class", "tooltip")             
        .style("display", "none");

  }

  function converter(number) {
    return ~~number + '%';
  }

  function showTooltip(data, percent) {

    var coords = d3.mouse(document.body);

    /**
    
      TODO:
      - change to d3 .style() chain
    
    **/
    
    // add initial inline styles
    _tooltip[0][0].style.position = 'absolute';
    _tooltip[0][0].style.left = (coords[0] - 50 ) + 'px';
    _tooltip[0][0].style.top = (coords[1] + 15) + 'px';

    if(percent) {
      // set the tooltip's html
      if (data === null || data === undefined) {
        _tooltip[0][0].innerHTML = 'Not Completed';
      } else {
        _tooltip[0][0].innerHTML = converter(data);
      }
    } 
    else {
        _tooltip[0][0].innerHTML = data;
    }

    _tooltip.style('display', 'inline');

  }


  function removeTooltip() {

    // hide the tooltip from the page
    _tooltip[0][0].style.display = 'none';

    // reset the tooltip coords
    _tooltip.style.left = 0;
    _tooltip.style.top = 0;

    // reset d3.event so we can register other events
    d3.event = '';

  }

  var isComplete = function(mark) {
    return mark === null ? false : true;
  }

  var drag = d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", dragstarted)
      .on("drag", dragged)
      .on("dragend", dragended);

  function dragstarted(d, i) {
    scatter.currentWork = i;
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
  }

  function dragged(d) {

    d3.select(this).attr("cy", function(){
      var newcy = ~~d3.select(this).attr("cy") + ~~d3.event.dy;

      if(newcy < 35) {
        return 35;
      } 
      else if (newcy > 515) {
        return 515;
      } 
      else {
        return newcy;
      }
    });

    // modify the current module to included new temp grade
    var newVal = scatter.vars.yScale.invert(~~d3.select(this).attr("cy"));
    scatter.ModifyGrades(~~newVal);

    var forecast = scatter.forecast(scatter.currentModule);
    scatter.updateForecastPercent(forecast)

  }

  function dragended(d) {

    d3.select(this).classed("dragging", false);
  }

  function getOffset( el ) {
      var _x = 0;
      var _y = 0;
      while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
          _x += el.offsetLeft - el.scrollLeft;
          _y += el.offsetTop - el.scrollTop;
          el = el.offsetParent;
      }
      return { top: _y, left: _x };
  }

  // auto init
  init();

  return {
    // show : show,
    // hide : hide
  }
  

});
    