function rgb(r,g,b) {
	return (
		((r & 0xff) << 16) |
		((g & 0xff) << 8) |
		(b & 0xff)
	);
};

module.exports = {

	colorRGB: function() {
		return {
			none:			this.rgb(16, 16, 16),
			default:		this.rgb(16, 16, 16),
			red:			this.rgb(160, 0, 0),
			orange:			this.rgb(255, 100, 0),
			green:			this.rgb(0, 160, 0),
			blue:			this.rgb(0, 0, 160),
			purple:			this.rgb(80, 0, 80)
		}
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
