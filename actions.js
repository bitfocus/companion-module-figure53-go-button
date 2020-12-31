// actions for go-button module

module.exports = {

	setActions: function () {

		var actions = {
			'go':				{ label: 'GO' },
			'oops':				{ label: 'Oops' },
			'stop':				{ label: 'Stop' },
			'panic':			{ label: 'Panic' },
			'reset':			{ label: 'Reset' },
			'next':				{ label: 'Next Cue' },
			'previous':			{ label: 'Previous Cue' },
			'resume':			{ label: 'Resume' },
			'pause':			{ label: 'Pause' },
			'start': {
				label: 'Start (cue)',
				options: [{
					type: 'textinput',
					label: 'Cue',
					id: 'cue',
					default: "1"
				}]
			},
			'goto': {
				label: 'Go To (cue)',
				options: [{
					type: 'textinput',
					label: 'Cue',
					id: 'cue',
					default: "1"
				}]
			},
			'hitGo': {
				label: 'Hit Go',
				options: [{
					type: 'textinput',
					label: 'Hit Number',
					id: 'hitNum',
					default: "1"
				}]
			},
			'hitStop': {
				label: 'Hit Stop',
				options: [{
					type: 'textinput',
					label: 'Hit Number',
					id: 'hitNum',
					default: "1"
				}]
			},
			'hitPause': {
				label: 'Hit Pause',
				options: [{
					type: 'textinput',
					label: 'Hit Number',
					id: 'hitNum',
					default: "1"
				}]
			},
			'toggleFullScreen': { label: 'Full Screen mode' },
			'toggleMasterVolumeVisible': { label: 'Master Volume visible' },
			'volume': {
				label: 'Master Volume Set',
				options: [{
					type: 'textinput',
					label: 'Volume in dB',
					id: 'volume',
					default: "0.0"
				}]
			},
			'volumeStepUp':		{ label: 'Volume Step Up' },
			'volumeStepDown':	{ label: 'Volume Step Down'},
			'toggleDim':		{ label: 'Master Dim' },
			'toggleMute':		{ label: 'Master Mute' },
			'timer_start':	 	{ label: 'Timer Start' },
			'timer_stop':		{ label: 'Timer Stop' },
			'timer_reset':		{ label: 'Timer Reset' },
			'timer_toggle':		{ label: 'Timer Start/Stop' }
		};
		return (actions);
	}
};