import { combineRgb } from '@companion-module/base'

export const colorRGB = {
	none: combineRgb(16, 16, 16),
	default: combineRgb(16, 16, 16),
	red: combineRgb(160, 0, 0),
	orange: combineRgb(255, 100, 0),
	green: combineRgb(0, 160, 0),
	blue: combineRgb(0, 0, 160),
	purple: combineRgb(80, 0, 80),
}

export const colorName = [
	{ label: 'None', id: 'none' },
	{ label: 'Grey', id: 'default' },
	{ label: 'Red', id: 'red' },
	{ label: 'Orange', id: 'orange' },
	{ label: 'Green', id: 'green' },
	{ label: 'Blue', id: 'blue' },
	{ label: 'Purple', id: 'purple' },
]
