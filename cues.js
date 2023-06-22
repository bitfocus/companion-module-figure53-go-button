import * as Colors from './colors.js'

class Cue {
	uniqueID = ''
	qName = '[none]'
	qNumber = ''
	isLoaded = false
	isBroken = false
	isRunning = false
	isPaused = false
	isArmed = false
	duration = 0
	pctElapsed = 0
	startedAt = -1
	qColor = 0
	qColorName = ''
	qOrder = -1
	Notes = ''
	gbText = ''

	constructor(j, self) {
		if (j != undefined) {
			this.JSONtoCue(this, j, self)
		}
	}

	JSONtoCue(newCue, j, self) {
		var isExistingQ

		newCue.uniqueID = j.uniqueID
		newCue.qName = j.listName
		newCue.qNumber = j.number
		newCue.qColorName = j.colorName
		// Gobutton sometimes returns 'super' instead of 'group' for the primary (listed) cues
		newCue.qType = j.type.toLowerCase() == 'super' ? 'group' : j.type.toLowerCase()
		newCue.isRunning = j.isRunning
		newCue.isLoaded = j.isLoaded
		newCue.isBroken = j.isBroken
		newCue.isPaused = j.isPaused
		newCue.isArmed = j.armed
		newCue.duration = j.duration
		newCue.pctElapsed = j.percentActionElapsed
		if (j.goButtonText) {
			newCue.gbText = j.goButtonText
		}
		if (j.notes) {
			newCue.Notes = j.notes.slice(0, 20)
		}
		newCue.qColor = Colors.colorRGB[j.colorName]
		isExistingQ = newCue.uniqueID in self.showCues

		if (isExistingQ) {
			newCue.qOrder = self.showCues[newCue.uniqueID].qOrder
		}

		if (newCue.isRunning || newCue.isPaused) {
			if (isExistingQ) {
				if (0 == (newCue.startedAt = self.showCues[newCue.uniqueID].startedAt)) {
					newCue.startedAt = Date.now()
				}
			} else {
				newCue.startedAt = Date.now()
				//i.debug("--------Cue " + newCue.qNumber + "@" + newCue.startedAt);
			}
		} else {
			newCue.startedAt = 0
		}
	}
}

export default Cue
