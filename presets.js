import { combineRgb } from '@companion-module/base'
import Icons from './icons.js'
import * as Colors from './colors.js'

// determine text color for a background color
function textColor(pbin) {
	const r = pbin >> 16
	const g = (pbin >> 8) & 0xff
	const b = pbin & 0xff
	const lum = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

	// determine whether the color is light or dark
	if (lum > 127.5) {
		return 0
	} else {
		return 0xffffff
	}
}

export function compilePresetDefinitions(self) {
	const presets = {}

	presets['cuelist-pause'] = {
		type: 'button',
		category: 'CueList',
		name: 'Pause / Resume',
		style: {
			text: '',
			png64: Icons.ICON_PAUSE_INACTIVE,
			pngalignment: 'center:center',
			size: '18',
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(255, 255, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'pause',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['cuelist-go'] = {
		type: 'button',
		category: 'CueList',
		name: 'GO',
		style: {
			text: '',
			png64: Icons.ICON_PLAY_INACTIVE,
			pngalignment: 'center:center',
			size: '18',
			color: 0,
			bgcolor: combineRgb(0, 255, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'go',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['cuelist-resume'] = {
		type: 'button',
		category: 'CueList',
		name: 'Resume',
		style: {
			text: 'Resume',
			size: '18',
			color: 0,
			bgcolor: combineRgb(0, 255, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'resume',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['cuelist-stop'] = {
		type: 'button',
		category: 'CueList',
		name: 'Stop',
		style: {
			text: 'Stop',
			size: '30',
			color: 0xffffff,
			bgcolor: combineRgb(255, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'stop',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['cuelist-panic'] = {
		type: 'button',
		category: 'CueList',
		name: 'Panic',
		style: {
			text: '',
			png64: Icons.ICON_STOP_INACTIVE,
			pngalignment: 'center:center',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: 0,
		},
		steps: [
			{
				down: [
					{
						actionId: 'panic',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['cuelist-reset'] = {
		type: 'button',
		category: 'CueList',
		name: 'Reset',
		style: {
			text: 'Reset',
			size: '24',
			color: 0xffffff,
			bgcolor: combineRgb(0, 0, 100),
		},
		steps: [
			{
				down: [
					{
						actionId: 'reset',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['cuelist-previous-cue'] = {
		type: 'button',
		category: 'CueList',
		name: 'Previous Cue',
		style: {
			text: '',
			png64: Icons.ICON_REW_INACTIVE,
			pngalignment: 'center:center',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: 0,
		},
		steps: [
			{
				down: [
					{
						actionId: 'previous',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['cuelist-next-cue'] = {
		type: 'button',
		category: 'CueList',
		name: 'Next Cue',
		style: {
			text: '',
			png64: Icons.ICON_FWD_INACTIVE,
			pngalignment: 'center:center',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: 0,
		},
		steps: [
			{
				down: [
					{
						actionId: 'next',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['cuelist-timer-start'] = {
		type: 'button',
		category: 'CueList',
		name: 'Timer Start',
		style: {
			text: 'Timer\\nStart',
			size: '24',
			color: 0,
			bgcolor: combineRgb(0, 255, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'timer_start',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['cuelist-timer-stop'] = {
		type: 'button',
		category: 'CueList',
		name: 'Timer Stop',
		style: {
			text: 'Timer\\nStop',
			size: '24',
			color: 0xffffff,
			bgcolor: combineRgb(255, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'timer_stop',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['cuelist-timer-toggle'] = {
		type: 'button',
		category: 'CueList',
		name: 'Timer Toggle',
		style: {
			text: 'Timer\\nToggle',
			size: '24',
			color: 0,
			bgcolor: combineRgb(0, 255, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'timer_toggle',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}
	presets['cuelist-timer-reset'] = {
		type: 'button',
		category: 'CueList',
		name: 'Timer Reset',
		style: {
			text: 'Timer\\nReset',
			size: '24',
			color: 0xffffff,
			bgcolor: combineRgb(0, 0, 100),
		},
		steps: [
			{
				down: [
					{
						actionId: 'timer_reset',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['cuelist-oops'] = {
		type: 'button',
		category: 'CueList',
		name: 'oops',
		style: {
			text: 'Oops',
			size: 'auto',
			tooltip:
				'Stops and re-selects the most recently played cue. This command can be sent multiple times to “undo” the playback of currently playing cues in reverse order.',
			color: 0xffffff,
			bgcolor: combineRgb(255, 0, 0),
		},

		steps: [
			{
				down: [
					{
						actionId: 'oops',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['global-fullscreen'] = {
		type: 'button',
		category: 'Global',
		name: 'Toggle Full Screen',
		style: {
			text: 'Toggle Full Screen',
			size: 'auto',
			color: 0xffffff,
			bgcolor: combineRgb(0, 0, 100),
		},
		steps: [
			{
				down: [
					{
						actionId: 'toggleFullScreen',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['global-master-vol-vis'] = {
		type: 'button',
		category: 'Global',
		name: 'Toggle Master Volume Visible',
		style: {
			text: 'Toggle Master Volume Visible',
			size: 'auto',
			color: 0xffffff,
			bgcolor: combineRgb(0, 0, 100),
		},
		steps: [
			{
				down: [
					{
						actionId: 'toggleMasterVolumeVisible',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['global-master-vol-set'] = {
		type: 'button',
		category: 'Global',
		name: 'Set Master Volume dB',
		style: {
			text: 'Set Master Volume (dB)',
			size: 'auto',
			color: 0xffffff,
			bgcolor: combineRgb(0, 0, 100),
		},
		steps: [
			{
				down: [
					{
						actionId: 'volume',
						options: {
							volume: 0.0,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['global-master-vol-inc'] = {
		type: 'button',
		category: 'Global',
		name: 'Increase Master Volume 6dB',
		style: {
			text: 'Master Volume\\n +6db',
			size: '14',
			color: 0xffffff,
			bgcolor: combineRgb(0, 0, 100),
		},
		steps: [
			{
				down: [
					{
						actionId: 'volumeStepUp',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['global-master-vol-dec'] = {
		type: 'button',
		category: 'Global',
		name: 'Decrease Master Volume 6dB',
		style: {
			text: 'Master Volume\\n -6db',
			size: '14',
			color: 0xffffff,
			bgcolor: combineRgb(0, 0, 100),
		},
		steps: [
			{
				down: [
					{
						actionId: 'volumeStepDown',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['global-master-dim'] = {
		type: 'button',
		category: 'Global',
		name: 'Toggle Master Dim',
		style: {
			text: 'Toggle\\nDim',
			size: 'auto',
			color: 0xffffff,
			bgcolor: combineRgb(0, 0, 100),
		},
		steps: [
			{
				down: [
					{
						actionId: 'toggleDim',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['global-master-mute'] = {
		type: 'button',
		category: 'Global',
		name: 'Toggle Master Mute',
		style: {
			text: 'Toggle\\nMute',
			size: 'auto',
			color: 0xffffff,
			bgcolor: combineRgb(0, 0, 100),
		},
		steps: [
			{
				down: [
					{
						actionId: 'toggleMute',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['hit-go'] = {
		type: 'button',
		category: 'Hit',
		name: 'Hit x Go',
		style: {
			text: 'Hit\\nX\\nGo',
			size: 'auto',
			color: 0,
			bgcolor: combineRgb(0, 255, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'hitGo',
						options: {
							hitNum: '1',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['hit-stop'] = {
		type: 'button',
		category: 'Hit',
		name: 'Hit x Stop',
		style: {
			text: 'Hit\\nX\\nStop',
			size: 'auto',
			color: 0,
			bgcolor: combineRgb(255, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'hitStop',
						options: {
							hitNum: '1',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['hit-pause'] = {
		type: 'button',
		category: 'Hit',
		name: 'Hit x Pause',
		style: {
			text: 'Hit\\nX\\nPause',
			size: 'auto',
			color: 0,
			bgcolor: combineRgb(255, 255, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'hitPause',
						options: {
							hitNum: '1',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	return presets
}
