const X_VALUE = 'Player';
const BAR_COLORS = ["#0F5738", "#4F628E", "#162955", "#6b486b", "#061539", "#d0743c", "#ff8c00"];
const SVG_MARGIN = {
	top: 20,
	right: 50,
	bottom: 30,
	left: 50
};

/**
 * @param {Object} g
 * @param {Function} x0
 * @param {Function} x1
 * @param {Function} y
 * @param {Function} z
 * @param {Number} height
 * @param {Array} data
 * @param {String} dataKey
 */
const buildBars = (g, x0, x1, y, z, height, data, dataKey) => {
	let div = d3.select('.tooltip');

	g.append("g")
		.selectAll("g")
		.data(data)
		.enter()
		.append("g")
		.attr("transform", (d) => "translate(" + x0(d.key) + ",0)")
		.selectAll("rect")
		.data((d) => d.values.map((split) => {
			return { key: split[X_VALUE], value: split[dataKey] };
		}))
		.enter().append("rect")
		.attr("x", (d) => x1(d.key))
		.attr("y", (d) => y(d.value))
		.attr("width", x1.bandwidth())
		.attr("height", (d) => height - y(d.value))
		.attr("fill", (d) => z(d.key))
		.on("mouseover", (d) => {
			div.transition()
				.duration(200)
				.style("opacity", .9);
			div.html(d.value)
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
 * @param {Object} g
 * @param {Function} x0
 * @param {Function} y
 * @param {Number} height
 */
const buildAxes = (g, x0, y, height) => {
	g.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x0));

	g.append("g")
		.attr("class", "axis")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("x", 2)
		.attr("y", y(y.ticks().pop()) + 0.5)
		.attr("dy", "0.32em")
		.attr("fill", "#000")
		.attr("font-weight", "bold")
		.attr("text-anchor", "start")
		.text("Batting Avg.");
};

/**
 * @param {Object} g
 * @param {Function} z
 * @param {Number} width
 * @param {Array} keys
 */
const buildLegend = (g, z, width, keys) => {
	let legend = g.append("g")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10)
		.attr("text-anchor", "end")
		.selectAll("g")
		.data(keys.slice().reverse())
		.enter().append("g")
		.attr("transform", (d, i) => "translate(0," + i * 20 + ")");

	legend.append("rect")
		.attr("x", width - 19)
		.attr("width", 19)
		.attr("height", 19)
		.attr("fill", z);

	legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9.5)
		.attr("dy", "0.32em")
		.text((d) => d);
};

/**
 * @param {Array} data
 * @param {String} dataKey
 */
const build = (data, dataKey) => {
	let keys = data[0].values.map((split) => split.Player);
	let svg = d3.select("#compare-container svg");
	let width = +svg.attr("width") - SVG_MARGIN.left - SVG_MARGIN.right;
	let	height = +svg.attr("height") - SVG_MARGIN.top - SVG_MARGIN.bottom;
	let	g = svg.append("g").attr("transform", "translate(" + SVG_MARGIN.left + "," + SVG_MARGIN.top + ")");

	let x0 = d3.scaleBand()
		.rangeRound([0, width])
		.paddingInner(0.1);

	let x1 = d3.scaleBand()
		.padding(0.05);

	let y = d3.scaleLinear()
		.rangeRound([height, 0]);

	let z = d3.scaleOrdinal()
		.range(BAR_COLORS);

	x0.domain(data.map((d) => d.key));
	x1.domain(keys).rangeRound([0, x0.bandwidth()]);

	// Setting max and min values for y Axis
	y.domain([
		0,
		d3.max(data, (d) => d3.max(d.values, (value) =>  value[dataKey]))
	]).nice();

	// Building Graph
	buildAxes(g, x0, y, height);
	buildBars(g, x0, x1, y, z, height, data, dataKey);
	buildLegend(g, z, width, keys);
};

export default {
	build
};