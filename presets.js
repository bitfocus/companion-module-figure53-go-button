var icons = require('../../resources/icons.js');

// determine text color for a background color
textColor = function (pbin) {

	var r = pbin >> 16;
	var g = pbin >> 8 & 0xFF;
	var b = pbin & 0xFF;
	var lum = Math.sqrt(
		0.299 * (r * r) +
		0.587 * (g * g) +
		0.114 * (b * b)
	);

	// determine whether the color is light or dark
	if (lum > 127.5) {
		return '0';
	} else {
		return '16777215';
	}
};

module.exports = {

	setPresets: function () {

		var presets = [];

		presets.push({
			category: 'CueList',
			label: 'Pause / Resume',
			bank: {
				style: 'text',
				text: 'Pause',
				size: 'auto',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 255, 0),
			},
			actions: [{
				action: 'pause',
			}]
		});

		presets.push({
			category: 'CueList',
			label: 'GO',
			bank: {
				style: 'text',
				text: 'Go',
				size: 'auto',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(0, 255, 0)
			},
			actions: [{
				action: 'go',
			}]
		});

		presets.push({
			category: 'CueList',
			label: 'Resume',
			bank: {
				style: 'text',
				text: 'Resume',
				size: '18',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(0, 255, 0)
			},
			actions: [{
				action: 'resume',
			}]
		});

		presets.push({
			category: 'CueList',
			label: 'Stop',
			bank: {
				style: 'text',
				text: 'Stop',
				size: '30',
				color: '16777215',
				bgcolor: this.rgb(255, 0, 0)
			},

			actions: [{
				action: 'stop',
			}]
		});

		presets.push({
			category: 'CueList',
			label: 'Panic',
			bank: {
				style: 'text',
				text: 'Panic',
				size: '24',
				color: '16777215',
				bgcolor: this.rgb(255, 0, 0)
			},

			actions: [{
				action: 'panic',
			}]
		});

		presets.push({
			category: 'CueList',
			label: 'Reset',
			bank: {
				style: 'text',
				text: 'Reset',
				size: '24',
				color: '16777215',
				bgcolor: this.rgb(0, 0, 100)
			},
			actions: [{
				action: 'reset',
			}]
		});

		presets.push({
			category: 'CueList',
			label: 'Previous Cue',
			bank: {
				style: 'text',
				text: 'Prev\\nCue',
				size: '24',
				color: '16777215',
				bgcolor: this.rgb(0, 0, 128)
			},

			actions: [{
				action: 'previous',
			}]
		});

		presets.push({
			category: 'CueList',
			label: 'Next Cue',
			bank: {
				style: 'text',
				text: 'Next\\nCue',
				size: '24',
				color: '16777215',
				bgcolor: this.rgb(0, 0, 100)
			},

			actions: [{
				action: 'next',
			}]
		});

		presets.push({
			category: 'CueList',
			label: 'Timer Start',
			bank: {
				style: 'text',
				text: 'Timer\\nStart',
				size: '24',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(0, 255, 0)
			},

			actions: [{
				action: 'timer_start',
			}]
		});

		presets.push({
			category: 'CueList',
			label: 'Timer Stop',
			bank: {
				style: 'text',
				text: 'Timer\\nStop',
				size: '24',
				color: '16777215',
				bgcolor: this.rgb(255, 0, 0)
			},

			actions: [{
				action: 'timer_stop',
			}]
		});

		presets.push({
			category: 'CueList',
			label: 'Timer Toggle',
			bank: {
				style: 'text',
				text: 'Timer\\nStart\\nStop',
				size: 'auto',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(0, 255, 0)
			},

			actions: [{
				action: 'timer_toggle',
			}]
		});

		presets.push({
			category: 'CueList',
			label: 'Timer Reset',
			bank: {
				style: 'text',
				text: 'Timer\\nReset',
				size: '18',
				color: '16777215',
				bgcolor: this.rgb(0, 0, 100)
			},

			actions: [{
				action: 'timer_reset',
			}]
		});

		presets.push({
			category: 'CueList',
			label: 'oops',
			bank: {
				style: 'text',
				text: 'Oops',
				size: 'auto',
				color: this.rgb(255, 255, 255),
				tooltip: 'Stops and re-selects the most recently played cue. This command can be sent multiple times to “undo” the playback of currently playing cues in reverse order.',
				bgcolor: this.rgb(255, 0, 0)
			},

			actions: [{
				action: 'oops',
			}]
		});

		presets.push({
			category: 'Global',
			label: 'Toggle Full Screen',
			bank: {
				style: 'text',
				text: 'Toggle Full Screen',
				size: 'auto',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 100)
			},

			actions: [{
				action: 'toggleFullScreen',
			}]
		});

		presets.push({
			category: 'Global',
			label: 'Toggle Master Volume Visible',
			bank: {
				style: 'text',
				text: 'Master\\nVolume\\nToggle',
				size: '14',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 100)
			},

			actions: [{
				action: 'toggleMasterVolumeVisible',

			}]
		});

		presets.push({
			category: 'Global',
			label: 'Set Master Volume in dB',
			bank: {
				style: 'text',
				text: 'Set Volume',
				size: 'auto',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 100)
			},

			actions: [{
				action: 'volume',
				options: {
					volume: '0.0',
				}
			}]
		});

		presets.push({
			category: 'Global',
			label: 'increase Master Volume by 6dB',
			bank: {
				style: 'text',
				text: 'Volume\\nIncrease\\n6 dB',
				size: '14',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 100)
			},

			actions: [{
				action: 'volumeStepUp',
			}]
		});


		presets.push({
			category: 'Global',
			label: 'Decrease Master Volume by 6dB',
			bank: {
				style: 'text',
				text: 'Volume\\nDecrease\\n6 dB',
				size: '14',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 100)
			},

			actions: [{
				action: 'volumeStepDown',
			}]
		});

		presets.push({
			category: 'Global',
			label: 'Toggle Master Dim',
			bank: {
				style: 'text',
				text: 'Toggle\\nDim',
				size: 'auto',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 100)
			},
			actions: [{
				action: 'toggleDim',
			}]
		});
		presets.push({
			category: 'Global',
			label: 'Toggle Master Mute',
			bank: {
				style: 'text',
				text: 'Toggle\\nMute',
				size: 'auto',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 100)
			},
			actions: [{
				action: 'toggleMute',
			}]
		});

		presets.push({
			category: 'Hit',
			label: 'Hit x Go',
			bank: {
				style: 'text',
				text: 'Hit\\nX\\nGo',
				size: 'auto',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(0, 255, 0)
			},

			actions: [{
				action: 'hitGo',
				options: {
					hitNum: '1',
				}
			}]
		});

		presets.push({
			category: 'Hit',
			label: 'Hit x Stop',
			bank: {
				style: 'text',
				text: 'Hit\\nX\\nStop',
				size: 'auto',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(255, 0, 0)
			},

			actions: [{
				action: 'hitStop',
				options: {
					hitNum: '1',
				}
			}]
		});

		presets.push({
			category: 'Hit',
			label: 'Hit x Pause',
			bank: {
				style: 'text',
				text: 'Hit\\nX\\nPause',
				size: 'auto',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 255, 0)
			},

			actions: [{
				action: 'hitPause',
				options: {
					hitNum: '1',
				}
			}]
		});

		return (presets);
	}
};