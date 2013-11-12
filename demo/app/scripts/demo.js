$('#content').hide();
$('#names').hide();

$(document).ready(function() {

	// find container and hide it
	var $container = $('#content');
	$container.hide();

	// store dom variables
	var $slide = $('.slide');
	var $next = $('.next');
	var $slideWrap = $('.slideWrap');
	var $names = $('#names');
	var showLoad = false;

	// calculate the length and width of window to get what the width should be
	var numSlides = $slide.length;
	var windowWidth = $(window).width();
	
	var containerWidth = numSlides * windowWidth;

	// set the width of the parent container
	$container.css({
		'width': containerWidth
	});

	$slideWrap.css({
		'width': windowWidth
	});

	// safe to show the container now
	$container.fadeIn(600);

	// capture the click event on the links and navigate to correct slide
	$next.children('a').on('click', function(e) {

		e.preventDefault()

		// slice the string so we only have the id remaining
		var location = this.href.indexOf('#');
		var href = this.href.substr(location);

		// scroll to the left
		$('html, body').animate({
		 	scrollLeft: $(href).offset().left,
		 	scrollTop: 0
		}, 600);

	});

	/**
	*
	* This is the master animation method that controls all other animations that 
	* happen during the presentation
	*
	**/
	var animate = function() {
	  var duration = 60000, // animation has to last 60 seconds
	      start = (new Date).getMilliseconds(), // get start value
	      finish = start + duration, // get time when animation will stop
	      interval, counter = 0;

	  interval = setInterval(function() {
	    // get how many seconds are left then invert it
	    // to calculate how far we are 
	    var elapsed = duration - (duration - (counter * 1000));

	    if(elapsed === 5000) $names.fadeIn(300); // fade in names
	    if(elapsed === 10000) $next.first().children('a').trigger('click'); // trigger the next slide
	    if(elapsed === 11000) {
	    	$('html, body').animate({
	    	 	scrollTop: $('#progressPie').offset().top - 50
	    	}, 500);
	    }
	    if(elapsed === 15000) $('#progressPieClickTarget').trigger('click'); // animate the pie charts
	    if(elapsed === 19000) $('#progressPieClickTarget').trigger('click'); // .. and again
	    if(elapsed === 21000)  {
	    	$('html, body').animate({
	    	 	scrollTop: $('#progressForce').offset().top
	    	}, 500); // take half a sec to scroll down to the force graphs
	    }
	    if(elapsed === 25000) $('#progressForce').children('.node:nth-child(6)').trigger('mouseover');
	    if(elapsed === 31000)  {
	    	$('html, body').animate({
	    	 	scrollTop: $('#progressScatter').offset().top
	    	}, 500); // take 2 secs to scroll down to the scatter graphs
	    }
	    if(elapsed === 34000) $('.GEOG204').trigger('click');
	    if(elapsed === 36000) $('.GEOG209').trigger('click');
	    if(elapsed === 39000) $('.scatterIncomplete:first').simulate('drag', { dy: -250, interpolation: {stepCount: 250, shaky: 1, duration: 2500}});
	    if(elapsed === 43000) $('.scatterIncomplete:last').simulate('drag', { dy: -380, interpolation: {stepCount: 250, duration: 2000}});
	    

	    // if we are are at the end then stop animating
	    if (elapsed === duration) {
	      clearInterval(interval);
	    }

	    counter++;

	  }, 1000); // animate every second
	}

	// start the presentation when the first slide is clicked on
	$slide.first().on('click', animate());

	function findCenter(elem) {
	    var offset,
	        document = $(elem.ownerDocument);
	    elem = $(elem);
	    offset = elem.offset();

	    return {
	        x: offset.left + elem.outerWidth() / 2 - document.scrollLeft(),
	        y: offset.top + elem.outerHeight() / 2 - document.scrollTop()
	    };
	}

});