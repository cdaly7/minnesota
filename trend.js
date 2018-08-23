const X_VALUE = 'Split';
const SVG_MARGIN = {
	top: 20,
	right: 50,
	bottom: 30,
	left: 50
};

const SVG_OVERALL_WIDTH = 300;
const SVG_OVERALL_HEIGHT = 225;
const SVG_WIDTH = SVG_OVERALL_WIDTH - SVG_MARGIN.left - SVG_MARGIN.right;
const SVG_HEIGHT = SVG_OVERALL_HEIGHT - SVG_MARGIN.top - SVG_MARGIN.bottom;

/**
 * @param {Object} g
 * @param {Function} x
 * @param {Function} y
 * @param {Number} height
 */
const buildAxes = (g, x, y, height) => {
	g.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	g.append("g")
		.attr("class", "axis axis--y")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.attr("fill", "#000")
};

/**
 * @param {Object} g
 * @param {Function} x
 * @param {Function} y
 * @param {Array} data
 * @param {String} dataKey
 */
const buildLinesCircles = (g, x, y, data, dataKey) => {
	let div = d3.select('.tooltip');

	// Function for building the graph lines
	const line = d3.line()
		.x((d) => x(d[X_VALUE]))
		.y((d) => y(d[dataKey]));

	let split = g.selectAll(".split")
		.data(data)
		.enter()
		.append("g")
		.attr("class", "split");

	split.append("path")
		.attr("class", "line")
		.attr("d", (d) => line(d.values));

	split.selectAll("circle")
		.data((d) => d.values)
		.enter()
		.append("circle")
		.attr("r", 3)
		.attr("cx", (d) => x(d[X_VALUE]))
		.attr("cy", (d) => y(d[dataKey]))
		.on("mouseover", (d) => {
			div.transition()
				.duration(200)
				.style("opacity", .9);
			div.html(d[dataKey])
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout", () => {
			div.transition()
				.duration(500)
				.style("opacity", 0);
		});
};

/**
 * @param {Array} data
 * @param {String} playerId
 * @param {Array} players
 * @param {Array} splits
 * @param {String} dataKey
 */
const build = (data, playerId, players, splits, dataKey) => {
	let y = d3.scaleLinear().range([SVG_HEIGHT, 0]);
	let x = d3.scalePoint()
		.domain(splits)
		.range([0, SVG_WIDTH]);

	// Setting max and min values for y Axis
	y.domain([
		0,
		d3.max(data, (c) => d3.max(c.values, (d) => d[dataKey]))
	]);

	// Removing old graph
	d3.select(`#${playerId} .trends-container svg`).remove();

	// Adding new svg to page
	let svg = d3.select(`#${playerId} .trends-container`)
		.append("svg:svg")
		.attr("width", SVG_OVERALL_WIDTH)
		.attr("height", SVG_OVERALL_HEIGHT);
	let g = svg.append("g").attr("transform", "translate(" + SVG_MARGIN.left + "," + SVG_MARGIN.top + ")");

	// Building Graph
	buildAxes(g, x, y, SVG_HEIGHT);
	buildLinesCircles(g, x, y, data, dataKey);
};

export default {
	build
};