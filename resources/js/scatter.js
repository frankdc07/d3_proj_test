// Various accessors that specify the four dimensions of data to visualize.
function xsc(d) { return d.Deforestacion; }
function ysc(d) { return d.Cultivos_ilicitos; }
function colorsc(d) { return d.Region; }
function key(d) { return d.Municipio; }

// Chart dimensions.
var marginsc = {top: 19.5, right: 4, bottom: 19.5, left: 42},
    widthsc = 600 - marginsc.right - marginsc.left,
    heightsc = 450 - marginsc.top - marginsc.bottom;
   
// Various scales. These domains make assumptions of data, naturally.
var xScale = d3.scale.linear().domain([0, 100000]).range([0, widthsc]),
    yScale = d3.scale.linear().domain([0, 100000]).range([heightsc, 0]),
    colorScale = d3.scale.category10();

d3.json("resources/data/data2.json", function(Municipios) {

	// Create the SVG container and set the origin.
	var svg = d3.select(".scatter").append("svg")
					.attr("width", widthsc + marginsc.left + marginsc.right)
					.attr("height", heightsc + marginsc.top + marginsc.bottom)
			.append("g")
					.attr("transform", "translate(" + marginsc.left + "," + marginsc.top + ")");

	// The x & y axes.
	var xAxis = d3.svg.axis().orient("bottom").scale(xScale),
					yAxis = d3.svg.axis().scale(yScale).orient("left");

	// Add the x-axis.
	svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + heightsc + ")")
					.call(xAxis);

	// Add the y-axis.
	svg.append("g")
					.attr("class", "y axis")
					.call(yAxis);

	// Add an x-axis label.
	svg.append("text")
					.attr("class", "x label")
					.attr("class", "x label")
					.attr("text-anchor", "end")
					.attr("x", widthsc)
					.attr("y", heightsc - 6)
					.text("Deforestacion (Ha)");

	// Add a y-axis label.
	svg.append("text")
					.attr("class", "y label")
					.attr("text-anchor", "end")
					.attr("y", 6)
					.attr("dy", ".75em")
					.attr("transform", "rotate(-90)")
					.text("Cultivos ilicitos (Ha)");

	// Add the year label; the value is set on transition.
	var label = svg.append("text")
					.attr("class", "year label")
					.attr("text-anchor", "end")
					.attr("y", heightsc - 24)
					.attr("x", widthsc)
					.text(2005);

	var bisect = d3.bisector(function(d) { return d[0]; });

	// Add a dot per Municipio. Initialize the data at 1950, and set the colors.
	var dot = svg.append("g")
					.attr("class", "dots")
			.selectAll(".dot")
					.data(interpolateData(2005))
			.enter().append("circle")
					.attr("class", "dot")
					.attr("id", function(d) { return d.Municipio; })
					.style("fill", function(d) { return colorScale(colorsc(d)); })
					.call(position);

	// Add a label for each dot. 
	var dotlabel = svg.append("g")
					.attr("class", "dotlabels")
			.selectAll(".dotlabel")
					.data(interpolateData(2005))
			.enter().append("text")
					.attr("class", "dotlabel")
					.attr("id", function(d) { return d.Municipio; })
					.attr("text-anchor", "end")
					.text(function(d) { return d.Municipio; })
					.call(positionlabel);

	// Add a title.
	dot.append("title")
				.text(function(d) { return d.Municipio; });

	// Add an overlay for the year label.
	var box = label.node().getBBox();

	var overlay = svg.append("rect")
				.attr("class", "overlay")
				.attr("x", box.x)
				.attr("y", box.y)
				.attr("width", box.width)
				.attr("height", box.height)
				.on("mouseover", enableInteraction);
	
	var startingTranstion =	svg.transition()
					.delay(500)
					.duration(25000)
					.ease("easePolyOut")
					.tween("year", tweenYear)
					.each("end", enableInteraction);

	// Positions the dots based on data.
	function position(dot) {
			dot.attr("cx", function(d) { return xScale(xsc(d)); })
						.attr("cy", function(d) { return yScale(ysc(d)); })
						.attr("r", 5);
	}

	function positionlabel(dot) {
			dot.attr("x", function(d) { return xScale(xsc(d)); })
						.attr("y", function(d) { return yScale(ysc(d)); })
						.attr("dx",  -5 )
						.attr("dy", 4 );
	}

	// After the transition finishes, you can mouseover to change the year.
	function enableInteraction() {
				
		var yearScale = d3.scale.linear()
						.domain([2005, 2017])
						.range([box.x + 10, box.x + box.width - 10])
						.clamp(true);

			// Cancel the current transition, if any.
			svg.transition().duration(0);

			overlay
							.on("mouseover", mouseover)
							.on("mouseout", mouseout)
							.on("mousemove", mousemove)
							.on("touchmove", mousemove);

			function mouseover() {
					label.classed("active", true);
			}

			function mouseout() {
					label.classed("active", false);
			}

			function mousemove() {
					displayYear(Math.round(yearScale.invert(d3.mouse(this)[0])));
			}
	}

	// Tweens the entire chart by first tweening the year, and then the data.
	// For the interpolated data, the dots and label are redrawn.
	function tweenYear() {
			var year = d3.interpolateNumber(2005, 2017);
			return function(t) { displayYear(year(t)); };
	}

	// Updates the display to show the specified year.
	function displayYear(year) {
			dot.data(interpolateData(year), key).call(position);
			dotlabel.data(interpolateData(year), key).call(positionlabel);
			label.text(Math.round(year));
	}

	// Interpolates the dataset for the given (fractional) year.
	function interpolateData(year) {
			return Municipios.map(function(d) {
					return {
							Municipio: d.Municipio,
							Region: d.Region,
							Deforestacion: interpolateValues(d.Deforestacion, year),
							Cultivos_ilicitos: interpolateValues(d.Cultivos_ilicitos, year)
					};
			});
	}

	// Finds (and possibly interpolates) the value for the specified year.
	function interpolateValues(values, year) {
			var i = bisect.left(values, year, 0, values.length - 1),
							a = values[i];
			if (i > 0) {
					var b = values[i - 1],
									t = (year - a[0]) / (b[0] - a[0]);
					return a[1] * (1 - t) + b[1] * t;
			}
			return a[1];
	}
});
