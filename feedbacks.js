import { combineRgb } from '@companion-module/base'
import * as Choices from './choices.js'

export function compileFeedbackDefinitions(self) {
	return {
		fs_bg: {
			type: 'boolean',
			name: 'Full Screen?',
			description: 'Indicate on button when in Full Screen mode',
			options: [
				{
					type: 'dropdown',
					label: 'Status',
					id: 'which',
					default: 1,
					choices: Choices.ON_OFF,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 64, 128),
			},
			callback: (feedback, context) => {
				return self.fullScreen == !!feedback.options.which
			},
		},

		mf_bg: {
			type: 'boolean',
			name: 'Master Fader Visible?',
			description: 'Indicate on button when Master Fader is Visible',
			options: [
				{
					type: 'dropdown',
					label: 'Status',
					id: 'which',
					default: 1,
					choices: Choices.ON_OFF,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 64, 128),
			},
			callback: (feedback, context) => {
				return self.masterFader && !!feedback.options.which
			},
		},
		dim_bg: {
			type: 'boolean',
			name: 'Master Fader Dimmed?',
			description: 'Indicate on button when Master Fader is Dimmed',
			options: [
				{
					type: 'dropdown',
					label: 'Status',
					id: 'which',
					default: 1,
					choices: Choices.ON_OFF,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(128, 0, 0),
			},
			callback: (feedback, context) => {
				return self.faderDim && !!feedback.options.which
			},
		},
		mute_bg: {
			type: 'boolean',
			name: 'Muted?',
			description: 'Indicate when Muted',
			options: [
				{
					type: 'dropdown',
					label: 'Status',
					id: 'which',
					default: 1,
					choices: Choices.ON_OFF,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(204, 0, 0),
			},
			callback: function (feedback, bank) {
				return self.faderMute && !!feedback.options.which
			},
		},
		q_bg: {
			type: 'advanced',
			name: 'Use Cue Background',
			description: 'Use the Go Button color of this cue number as background',
			options: [
				{
					type: 'textinput',
					label: 'Cue Number',
					id: 'cue',
					default: '',
				},
			],
			callback: function (feedback, bank) {
				const cue = self.cleanCueNum(feedback.options.cue)
				const bg = self.cueColors[cue]
				return { bgcolor: bg || 0 }
			},
		},
	}
}
