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
	$container.fadeIn(550);

	// load the tabular data
	loadOldWay(progress.data);

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


		if(!showLoad && href === '#thirdSlide') {
			showLoad = true;
			loadProgress();
		}

	});

	var loadProgress = function() {
		console.log('loading....');
	}

	function loadOldWay(data) {

		// create the table
		var table = document.createElement('table');
		var tbody = document.createElement('tbody');
		var thead = document.createElement('thead');

		for(var module in data) {

			var tr = document.createElement('tr');
			tr.classList.add('oldModule');

			var tdName = document.createElement('td');
			tdName.classList.add('moduleName');
			tdName.innerHTML = data[module].name;
			var tdWeight = document.createElement('td');
			tdWeight.classList.add('moduleWeight');
			tdWeight.innerHTML = data[module].weight;
			var tdMark = document.createElement('td');
			tdMark.classList.add('moduleMark');
			tdMark.innerHTML = data[module].overallMark + '%';

			// append to the tr
			tr.appendChild(tdName);
			tr.appendChild(tdWeight);
			tr.appendChild(tdMark);

			// append the tr to the table element
			tbody.appendChild(tr);

			// now loop over each modules pieces of work and append those
			for(var work in data[module]) {
				var tmpWork, tmpWeights, tmpMarks;

				console.log(data[module][work].names);
				console.log(data[module][work].weights);
				console.log(data[module][work].marks);

				// for (var i = 0; i < data[module][work].marks.length; i++) {
				// 	// console.log(data[module][work][mark][i]);
				// };
			}

		}

		// append the table head and body to the table
		table.appendChild(thead);
		table.appendChild(tbody);

		$('#oldway').append(table);

		console.log(table);
	}

});