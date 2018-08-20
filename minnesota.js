import compareGraph  from './compare.js';
import trendGraph  from './trend.js';

// Can update this value to other columns in data set
const DATA_TO_CHART = 'BA';

/**
 * @param {Object} player
 * @returns {HTMLDivElement}
 */
const getPlayerElement = (player) => {
	let imgWidth = 150;
	let imgElement = document.createElement("img");
	imgElement.src = `assets/img/${player}.png`;
	imgElement.width = imgWidth;
	let playerElement = document.createElement("div");
	playerElement.id = player;
	$(playerElement).addClass('player').append(imgElement);
	return playerElement;
};

/**
 * @param {Array} players
 */
const buildSelectionElements = (players) => {
	let selectionElement = $('#trend-container .selection');
	players.forEach((player)=>{
		selectionElement.append(getPlayerElement(player));
	});
};

/**
 * @param data
 * @param players
 * @returns {Array}
 */
const filterDataToSpecificPlayers = (data, players) => data.reduce((accumulator, currentPlayer) => {
	if (players.includes(currentPlayer.key)) {
		accumulator.push(currentPlayer);
	}
	return accumulator;
}, []);

/**
 * @param {Object} elementToSelect
 */
const setSelected = (elementToSelect) => {
	$('#trend-container .selected').removeClass('selected');
	$(elementToSelect).addClass('selected');
};

/**
 * @param {Object} error
 * @param {Object} data
 */
const dataResponse = (error, data) => {
	d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

	if (error) throw error;

	let playerNest = d3.nest()
		.key((d) => { return d.Player })
		.entries(data);

	let splitNest = d3.nest()
		.key((d) => { return d.Split })
		.entries(data);

	// Adding the entire data compare graph
	compareGraph.build(splitNest, DATA_TO_CHART);

	let splits = splitNest.map((split) => {
		return split.key;
	});

	let players = playerNest.reduce((map, obj) => {
		map[obj.key.replace(/\s/g, '').toLocaleLowerCase()] = obj.key;
		return map;
	}, {});

	buildSelectionElements(Object.keys(players));

	// Adding on click to display trends of each player
	$('.player').click((event) => {
		setSelected(event.currentTarget);
		trendGraph.build(filterDataToSpecificPlayers(playerNest, [players[event.currentTarget.id]]), [players[event.currentTarget.id]], splits, DATA_TO_CHART);
	});
};

$(document).ready(() => {
	// Loading CVS with all data
	d3.csv("data.csv", dataResponse);
});
