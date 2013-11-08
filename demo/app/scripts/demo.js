$('#content').hide();

$(document).ready(function() {

	// find container and hide it
	var $container = $('#content');
	$container.hide();

	// store dom variables
	var $slide = $('.slide');
	var $next = $('.next');
	var $slideWrap = $('.slideWrap');
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

});