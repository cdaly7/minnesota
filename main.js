import compareGraph  from './compare.js';
import trendGraph  from './trend.js';

// Can update this value to other columns in data set
const DATA_TO_CHART = 'BA';

/**
 *
 * @param {String} player
 * @returns {HTMLImageElement}
 */
const buildPlayerImg = (player) => {
	let imgElement = document.createElement("img");
	imgElement.src = `assets/img/${player}.png`;
	imgElement.width = 150;
	return imgElement
};

const buildTrendsContainer = () => {
	let trends = $(document.createElement("div")).addClass('trends-container');
	return trends;
};

/**
 * @param {Object} player
 * @param {Boolean} isSelected
 * @returns {HTMLDivElement}
 */
const buildPlayerElement = (player, isSelected) => {
	let playerElement = document.createElement("div");
	playerElement.id = player;
	if (isSelected){
		$(playerElement).addClass('selected');
	}
	$(playerElement).addClass('player').append(buildPlayerImg(player)).append(buildTrendsContainer());
	return playerElement;
};

/**
 * @param {Array} players
 */
const buildSelectionElements = (players) => {
	let selectionElement = $('#trend-container .selection');
	players.forEach((player, i)=>{
		selectionElement.append(buildPlayerElement(player, i === 0));
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
	$(elementToSelect).toggleClass('selected');
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

	let playerIds = Object.keys(players);
	buildSelectionElements(playerIds);
	trendGraph.build(filterDataToSpecificPlayers(playerNest, [players[playerIds[0]]]), playerIds[0], [players[playerIds[0]]], splits, DATA_TO_CHART);

	// Adding on click to display trends of each player
	$('.player').click((event) => {
		setSelected(event.currentTarget);
		let playerId = event.currentTarget.id;
		trendGraph.build(filterDataToSpecificPlayers(playerNest, [players[playerId]]), playerId, [players[playerId]], splits, DATA_TO_CHART);
	});
};

$(document).ready(() => {
	// Loading CVS with all data
	d3.csv("data.csv", dataResponse);
});
