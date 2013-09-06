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
	function loadTable() {

		if (progress.data && typeof progress.data != 'undefined') {
			// data is ready and willing to be modified
			console.log('data is ready and willing to be modified');
			loadOldWay(progress.data);
			clearInterval();
		}
		else
		{
			// no data yet sir
			console.log('no data yet sir');
			setInterval(loadTable(), 300);
		}

	}

	loadTable();

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

			if (data.hasOwnProperty(module) ) {

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

			var i = 0;

			// now loop over each modules pieces of work and append those
			for(var work in data[module]) {

				if (data[module].hasOwnProperty(work) && typeof data[module].work !== undefined) {

				var tmpNames, tmpWeights, tmpMarks;

				if(typeof data[module][work].names !== undefined) {
					tmpNames = data[module].work.names.map(function(value) {
						return value;
					});
				}

				if(typeof data[module][work].weights !== undefined) {
					tmpWeights = data[module].work.weights.map(function(value) {
						return value;
					});
				}

				if(typeof data[module][work].marks !== undefined) {
					tmpMarks = data[module].work.marks.map(function(value) {
						return value;
					});
				}

				for(var i = 0; i < tmpNames.length; i++) {
					var tr = document.createElement('tr');

					var tdName = document.createElement('td');
					tdName.innerHTML = tmpNames[i];
					var tdWeight = document.createElement('td');
					tdWeight.innerHTML = tmpWeights[i];
					var tdMark = document.createElement('td');
					tdMark.innerHTML =tmpWeights[i] + '%';

					// append to the tr
					tr.appendChild(tdName);
					tr.appendChild(tdWeight);
					tr.appendChild(tdMark);

					tbody.appendChild(tr);

					i++;
				}
			
			}

		}

		}

		}

		// append the table head and body to the table
		table.appendChild(thead);
		table.appendChild(tbody);

		$('#oldway').append(table);

		console.log(table);
	}

});