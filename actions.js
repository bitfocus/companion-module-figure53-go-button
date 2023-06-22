// actions for go-button module
import * as Choices from './choices.js'

export function compileActionDefinitions(self) {

	const sendCommand = async (cmd, args, follow) => {
		args = args ?? []

		if (self.useTCP && !self.ready) {
			self.log('debug', `Not connected to ${self.config.host}`)
		} else if (cmd !== undefined) {
			self.log('debug', `sending ${cmd} ${JSON.stringify(args)}`)
			self.sendOSC(cmd, args)
			// follow-up probe for toggle we just sent
			if (self.useTCP && follow !== undefined) {
				self.log('debug', `  and ${follow}`)
				self.sendOSC(follow, [])
			}
		}
	}

	return {
		'go': {
			name: 'GO',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/go')
			},
		},
		'oops': {
			name: 'Oops',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/oops')
			},
		},
		'stop': {
			name: 'Stop',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/stop')
			},
		},
		'panic': {
			name: 'Panic',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/panic')
			},
		},
		'reset': {
			name: 'Reset',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/reset')
			},
		},
		'next': {
			name: 'Next Cue',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/playhead/next')
			},
		},
		'previous': {
			name: 'Previous Cue',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/playhead/previous')
			},
		},
		'resume': {
			name: 'Resume',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/resume')
			},
		},
		'pause': {
			name: 'Pause',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/pause')
			},
		},
		'toggleFullScreen': {
			name: 'Full Screen mode',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/toggleFullScreen', [], '/fullScreen')
			},
		},
		'toggleMasterVolumeVisible': {
			name: 'Master Volume visible',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/toggleMasterVolumeVisible', [], '/mastervolumeVisible')
			},
		},
		'volumeStepUp': {
			name: 'Volume Step Up',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/volumeStepUp')
			},
		},
		'volumeStepDown': {
			name: 'Volume Step Down',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/volumeStepDown')
			},
		},
		'toggleDim': {
			name: 'Master Dim',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/toggleDim', [], '/dim')
			},
		},
		'toggleMute': {
			name: 'Master Mute',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/toggleMute', [], '/mute')
			},
		},
		'timer_start': {
			name: 'Timer Start',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/timer/start')
			},
		},
		'timer_stop': {
			name: 'Timer Stop',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/timer/stop')
			},
		},
		'timer_reset': {
			name: 'Timer Reset',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/timer/reset')
			},
		},
		'timer_toggle': {
			name: 'Timer Start/Stop',
			options: [],
			callback: async (action, context) => {
				await sendCommand('/timer/toggleRunning')
			},
		},
		'start': {
			label: 'Start (cue)',
			options: [
				{
					type: 'textinput',
					label: 'Cue',
					id: 'cue',
					default: '1',
				},
			],
			callback: async (action, context) => {
				await sendCommand(`/cue/${action.options.cue}/start`)
			},
		},
		'goto': {
			label: 'Go To (cue)',
			options: [
				{
					type: 'textinput',
					label: 'Cue',
					id: 'cue',
					default: '1',
				},
			],
			callback: async (action, context) => {
				await sendCommand(`/playhead/${action.options.cue}`)
			},
		},
		'hitGo': {
			label: 'Hit Go',
			options: [
				{
					type: 'textinput',
					label: 'Hit Number',
					id: 'hitNum',
					default: '1',
				},
			],
			callback: async (action, context) => {
				await sendCommand(`/hit/${action.options.hitNum}/start`)
			},
		},
		'hitStop': {
			label: 'Hit Stop',
			options: [
				{
					type: 'textinput',
					label: 'Hit Number',
					id: 'hitNum',
					default: '1',
				},
			],
			callback: async (action, context) => {
				await sendCommand(`/hit/${action.options.hitNum}/stop`)
			},
		},
		'hitPause': {
			label: 'Hit Pause',
			options: [
				{
					type: 'textinput',
					label: 'Hit Number',
					id: 'hitNum',
					default: '1',
				},
			],
			callback: async (action, context) => {
				await sendCommand(`/hit/${action.options.hitNum}/pause`)
			},
		},

		'volume': {
			label: 'Master Volume Set',
			options: [
				{
					type: 'textinput',
					label: 'Volume in dB',
					id: 'volume',
					default: '0.0',
				},
			],
			callback: async (action, context) => {
				await sendCommand('/volume',[ { type: 'f', value: parseFloat(action.options.volume)}])
			},
		},
	}
}
