import { Regex } from '@companion-module/base'

export function GetConfigFields(self) {
	const configs = [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value:
				'Controls Go Button by <a href="https://figure53.com/" target="_new">Figure 53</a>' +
				'<br>Feedback and variables require TCP<br>which will increase network traffic.',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			tooltip: 'The IP of the computer running Go Button',
			regex: Regex.IP,
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Port',
			width: 6,
			tooltip: 'The Port number for Go Button OSC control',
			regex: Regex.PORT,
			default: '53100',
		},
		{
			type: 'checkbox',
			label: 'Use TCP?',
			id: 'useTCP',
			width: 6,
			tooltip: 'Use TCP instead of UDP\nRequired for feedbacks',
			default: false,
		},
		{
			type: 'checkbox',
			label: 'Use Tenths',
			id: 'useTenths',
			width: 6,
			tooltip: 'Show .1 second resolution for cue remaining timer?\nOtherwise offset countdown by +1 second\nRequires TCP',
			default: false,
		},
		{
			type: 'textinput',
			id: 'passcode',
			label: 'OSC Pascode',
			width: 6,
			tooltip: 'The passcode to controll Go Button.\nLeave blank if not needed.',
		},
	]
	return configs
}
