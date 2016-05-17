$(document).ready(drawChartForSelected);

window.addEventListener('hashchange', drawChartForSelected);

function drawChartForSelected() {
	var loc = location.hash.slice(1);
	if(loc == '') {
		loc = 'republican';
	}
	if(loc == "republican") {
		color = "red";
	}
	else {
		color = "blue";
	}
	chart("data/" + loc + "s-stream-week-05-16-2016.csv", color);
}



function chart(csvpath, color) {
	var datearray = [];
	var colorrange = [];
	var siValue = "";
	var lastHoverPosition = null;
	var lastHoverPerson = null;

	var labels = {
		"Donald Trump": {
			color: '#fff',
			x: '75.5%',
			y: '35.33%',
			display: 'Trump',
			cssClass: 'large'
		},
		"Ted Cruz": {
			color: '#fff',
			x: '78.3%',
			y: '69%',
			display: 'Cruz',
			cssClass: 'medium'
		},
		"Marco Rubio": {
			color: '#fff',
			x: '77.19%',
			y: '50.5%',
			display: 'Rubio',			
			cssClass: 'small'
		},
		"John Kasich": {
			color: '#fff',
			x: '79.4%',
			y: '56.3%',
			display: 'Kasich',			
			cssClass: 'super-small'
		},
		"Ben Carson": {
			color: '#fff',
			x: '42%',
			y: '54.4%',
			display: 'Carson',
			cssClass: 'smaller'
		},
		"Carly Fiorina": {
			color: '#fff',
			x: '27.5%',
			y: '50.25%',
			display: 'Fiorina',
			cssClass: 'tiny'
		},
		"Bernie Sanders": {
			color: '#fff',
			x: '75.19%',
			y: '41.17%',
			display: 'Sanders',
			cssClass: 'large'
		},
		"Hillary Clinton": {
			color: '#fff',
			x: '80.75%',
			y: '66.5%',
			display: 'Clinton',
			cssClass: 'medium'
		},

	}

	// 1600  600

	if (color == "blue") {
		colorrange = ["#D0D1E6", "#2B8CBE", "#74A9CF", "#A6BDDB", "#045A8D", "#F1EEF6"];
	}
	else if (color == "red") {
		//  colorrange = ["#953012", "#FF2A2A", "#FF5555", "#FF8080", "#FC8C74", 
		//			"#FEB195", "#FFAAAA", "#FFC9B4", "#FDE5D9", "#FFD5D5", "#D23E00"];
		colorrange = ["#E91D0E", "#B51409", "#860F07", "#D8483E", "#FF7E76", "#E7B4B1"];
	}
	strokecolor = colorrange[0];

	var format = d3.time.format("%m/%d/%Y");

	var margin = {top: 20, right: 10, bottom: 30, left: 10};
	var width = document.body.clientWidth - margin.left - margin.right;

	var height = 600 - margin.top - margin.bottom;

	var tooltip = d3.select(".main-container")
		.append("div")
		.attr("class", "remove")
		.style("position", "absolute")
		.style("z-index", "20")
		.style("visibility", "hidden")
		.style("top", "30px")
		.style("left", "55px");

	var x = d3.time.scale()
		.range([0, width]);

	var y = d3.scale.linear()
		.range([height - 10, 001]);

	var z = d3.scale.ordinal()
		.range(colorrange);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.ticks(d3.time.months);

	var yAxis = d3.svg.axis()
		.scale(y);

	var stack = d3.layout.stack()
		.offset("silhouette")
		.values(function(d) { return d.values; })
		.x(function(d) { return d.date; })
		.y(function(d) { return d.value; });

	var nest = d3.nest()
		.key(function(d) { return d.key; });

	var area = d3.svg.area()
		.interpolate("cardinal")
		.x(function(d) { return x(d.date); })
		.y0(function(d) { return y(d.y0); })
		.y1(function(d) { return y(d.y0 + d.y); });

	$(".streamGraph").fadeOut(250, function() {
		var svg = d3.select(".streamGraph").html("").append("svg")
			.attr("width", '100%')
			.attr("height", '100%')
			.attr('viewBox','0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		$(".streamGraph").fadeIn(250);

		var graph = d3.csv(csvpath, function(data) {
			var dateCutoff = new Date('06/01/2015');
			data.forEach(function(d) {
				d.date = format.parse(d.date);
				d.value = +d.value;
			});
			var data = data.filter(function(d) {
				return d.date.getTime() > dateCutoff.getTime();
			});

			var layers = stack(nest.entries(data));

			x.domain(d3.extent(data, function(d) { return d.date; }));
			y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

			svg.selectAll(".layer")
				.data(layers)
				.enter().append("path")
				.attr("class", "layer")
				.attr("d", function(d) { return area(d.values); })
				.style("fill", function(d, i) { return z(i); });

			// Add Labels
			svg.selectAll(".layerText")
				.data(layers).enter()
				.append('text')
				.attr('x', function(d, i) { return getLabel(d.key).x; })
				.attr('y', function(d) { return getLabel(d.key).y; })
				.attr('fill', function(d) { return getLabel(d.key).color; })
				.attr('class', function(d) { return 'labels ' + (getLabel(d.key).cssClass); })
				.text(function(d) {
					if(labels[d.key] !== undefined) {
						return getLabel(d.key).display;
					}
					return '';
				});

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);

			var vertical = d3.select(".streamGraph")
				  .append("div")
				  .attr("class", "remove vertical")
				  .style("position", "absolute")
				  .style("z-index", "19")
				  .style("width", "1px")
				  .style("height", ((height / 2) - (height / 6)) + "px")
				  .style("top", (height / 5) + "px")
				  .style("left", "0px")
				  .style("background", "#fff")
				  .style("pointer-events", "none");

			// Add annotations
			var annotationData = [
				{date: '08/16/2015', title: 'Ohio GOP Debate' },
				{date: '09/16/2015', title: 'California GOP Debate' },
				{date: '10/13/2015', title: 'Nevada Dem Debate' },
				{date: '02/01/2016', title: 'Iowa Caucus' },
				{date: '02/09/2016', title: 'New Hampshire Primary' },
				{date: '03/01/2016', title: 'Super Tuesday' },
				{date: '04/05/2016', title: 'Wisconsin Primary' }
			];

			// Add annotations
			svg.selectAll("circle")
				.data(annotationData)
				.enter().append("svg:circle")
				.style("stroke", "white")
				.style("stroke-width","2")
				.style("fill", "#314159")
				.attr("r", 5)
				.attr("cx", function(d) { return x(new Date(d.date)) })
				.attr("cy", height / 6)
				.on('mouseover', function(d) {
					var mousex = $(this).attr('cx');
					vertical.style("left", (mousex) + "px" );
					$('.vertical').fadeIn();
				}).
				on('mouseout', function() {
					$('.vertical').fadeOut();
				});

			$('svg circle').tipsy({ 
				gravity: $.fn.tipsy.autoWE, 
				html: true,
				fade: true,
				offset: 2, 
				title: function() {
					var d = this.__data__, title = d.title, date = d.date;
					return '<div class="annotation"><span class="title">' + d.title + '</span>' +
					' <br/><span class="date">' + date + '</span></div>'; 
				}
			});

			svg.selectAll(".layer")
				.attr("opacity", 1)
				.on("mouseover", function(d, i) {
					svg.selectAll(".layer").transition()
					.duration(250)
					.attr("opacity", function(d, j) {
						return j != i ? 0.3 : 1;
					})
				})

				.on("mousemove", function(d, i) {
					mousex = d3.mouse(this);
					mousex = mousex[0];
					var invertedx = x.invert(mousex);
					var tempDate = '' + (invertedx.getMonth() + 1) + '/' + invertedx.getDate() + '/' + invertedx.getFullYear();

					if(lastHoverPosition === tempDate && lastHoverPerson === d.key) {
						return;
					}

					d3.select(this)
						.classed("hover", true)
						.attr("stroke", strokecolor)
						.attr("stroke-width", "0.5px"), 
						tooltip.html(
							"<p class='tooltip'><span class='name'>" + d.key + "</span><br>" + 
							"Search interest on <span class='date'>" + tempDate + "</span></p>" 
						)
						.style("visibility", "visible");
					lastHoverPosition = tempDate;
					lastHoverPerson = d.key;
				})
				
				.on("mouseout", function(d, i) {
					svg.selectAll(".layer")
					.transition()
					.duration(250)
					.attr("opacity", "1");
					d3.select(this)
					.classed("hover", false)
					.attr("stroke-width", "0px"), tooltip.html( "<p class='tooltip'>" + d.key + "</p>" ).style("visibility", "hidden");
				});
		});

		function getLabel(key) {
			if(labels[key] !== undefined) {
				return labels[key];
			}

			return {
				x: '',
				y: '',
				text: '',
				color: ''
			};
		}
	});
}