rgb = require('../../image').rgb;

module.exports = {

	setFeedbacks: function(i) {

		var feedbacks = {
			fs_bg: {
				label: 			'Color for Full Screen',
				description: 	'Set Button colors when Full Screen',
				options: [{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: '16777215'
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: rgb(0, 64, 128)
				}],
				callback: function(feedback, bank) {
					var ret = {};
					if (i.fullScreen) {
						ret = { color: feedback.options.fg, bgcolor: feedback.options.bg };
					} else {
						ret = { color: bank.color, bgcolor: bank.bgcolor };
					}
					return ret;
				}
			},
			mf_bg: {
				label: 			'Color for Master Fader',
				description: 	'Set Button colors wen Master Fader visible',
				options: [{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: '16777215'
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: rgb(0, 64, 128)
				}],
				callback: function(feedback, bank) {
					var ret = {};
					if (i.masterFader) {
						ret = { color: feedback.options.fg, bgcolor: feedback.options.bg };
					} else {
						ret = { color: bank.color, bgcolor: bank.bgcolor };
					}
					return ret;
				}
			},
			dim_bg: {
				label: 			'Color when Dimmed',
				description: 	'Set Button colors when Master Fader Dimmed',
				options: [{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: '16777215'
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: rgb(128,0,0)
				}],
				callback: function(feedback, bank) {
					var ret = {};
					if (i.faderDim) {
						ret = { color: feedback.options.fg, bgcolor: feedback.options.bg };
					} else {
						ret = { color: bank.color, bgcolor: bank.bgcolor };
					}
					return ret;
				}
			},
			mute_bg: {
				label: 			'Color when Muted',
				description: 	'Set Button colors when Muted',
				options: [{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: '16777215'
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: rgb(204,0,0)
				}],
				callback: function(feedback, bank) {
					var ret = {};
					if (i.faderMute) {
						ret = { color: feedback.options.fg, bgcolor: feedback.options.bg };
					} else {
						ret = { color: bank.color, bgcolor: bank.bgcolor };
					}
					return ret;
				}
			},
			q_bg: {
				label: 'Cue Number color for background',
				description: 'Use the Go Button color of this cue number as background',
				options: [{
					type: 'textinput',
					label: 'Cue Number',
					id: 'cue',
					default: ""
				}],
				callback: function(feedback, bank) {
					return { bgcolor: i.cueColors[ (feedback.options.cue).replace(/[^\w\.]/gi,'_') ] };
				}
			},
		};
		return(feedbacks);
	}
};
