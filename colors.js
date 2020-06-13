var rgb = require('../../image').rgb;

module.exports = {
	colorRGB: {
		none:			rgb(16, 16, 16),
		default:		rgb(16, 16, 16),
		red:			rgb(160, 0, 0),
		orange:			rgb(255, 100, 0),
		green:			rgb(0, 160, 0),
		blue:			rgb(0, 0, 160),
		purple:			rgb(80, 0, 80)
	},

	colorName: [
		{ label: 'None',            id: 'none' },
		{ label: 'Grey',            id: 'default' },
		{ label: 'Red',	            id: 'red' },
		{ label: 'Orange',		    id: 'orange' },
		{ label: 'Green',		    id: 'green' },
		{ label: 'Blue',			id: 'blue' },
		{ label: 'Purple',		    id: 'purple' }
		]
};
