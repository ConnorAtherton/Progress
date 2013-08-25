  
  var w = 670,
      h = 550,
      padding = 30,
      url = 'data/scatter.json';

  var svg = d3.select("body")
              .append("svg")
              .attr("width", w)
              .attr("height", h);


  var dataset = [
      {
        "Name" : "ICTF210",
        "OverallMark" : 52
      },
      {
        "Name" : "SCC 201",
        "OverallMark" : 58
      },
      {
        "Name" : "SCC 202",
        "OverallMark" : 63
      },
      {
        "Name" : "SCC 203",
        "OverallMark" : 56
      },
      {
        "Name" : "SCC 204",
        "OverallMark" : 60
      },
      {
        "Name" : "SCC 205",
        "OverallMark" : 57
      },
      {
        "Name" : "SCC 240",
        "OverallMark" : 70
      },
      {
        "Name" : "SCC 241",
        "OverallMark" : 99
      }
  ];


  var x = d3.scale.ordinal() // Setting XScale
                  .domain(dataset.map(function (d) {return d.Name; }))
                  .rangeRoundBands([40, w-1]),
      y = d3.scale.linear() // Setting YScale
                  .domain([0, 100])
                  .range([h - padding, padding]);

  var xAxis = d3.svg.axis().scale(x).orient("bottom");


  var yAxis = d3.svg.axis().scale(y).orient("left")
                    .ticks(10); // Set rough # of ticks  


  // Calling XAxis
  svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0, " + (h - padding) + ")")
      .call(xAxis);

  // Calling YAxis
  svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + padding + ",0)")
      .call(yAxis);


    d3.json(url, function (scatter_data) {

      // SVG Circles
      svg.selectAll("circle")
         .data(dataset)
         .enter()
         .append("circle")
         .attr("class", "circle")
         .attr("cx", function(d) {
              return x(d.Name);
         })
         .attr("cy", function(d) {
              return y(d.OverallMark);
         })
         .attr("r", 4); // Set size of circle
   });
