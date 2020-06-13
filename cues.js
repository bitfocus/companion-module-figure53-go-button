var colors = require('./colors.js');


function Cue (j, i) {

	this.uniqueID = '';
	this.qName = '[none]';
	this.qNumber = '';
	this.isLoaded = false;
	this.isBroken = false;
	this.isRunning = false;
	this.isPaused = false;
	this.isArmed = false;
	this.duration = 0;
	this.pctElapsed = 0;
	this.startedAt = -1;
	this.qColor = 0;
	this.qColorName = '';
	this.qOrder = -1;
	this.Notes = '';
	this.gbText = '';
	if (j != undefined) {
		JSONtoCue(this, j, i);
	}

}

function JSONtoCue(newCue, j, i) {
	var isExistingQ;

	newCue.uniqueID = j.uniqueID;
	newCue.qName = j.listName;
	newCue.qNumber = j.number;
	newCue.qColorName = j.colorName;
	// Gobutton sometimes returns 'super' instead of 'group' for the primary (listed) cues
	newCue.qType = j.type.toLowerCase() == 'super' ? 'group' : j.type.toLowerCase();
	newCue.isRunning = j.isRunning;
	newCue.isLoaded = j.isLoaded;
	newCue.isBroken = j.isBroken;
	newCue.isPaused = j.isPaused;
	newCue.isArmed = j.armed;
	newCue.duration = j.duration;
	newCue.pctElapsed = j.percentActionElapsed;
	if (j.goButtonText) {
		newCue.gbText = j.goButtonText;
	}
	if (j.notes) {
		newCue.Notes = j.notes.slice(0,20);
	}
	newCue.qColor = colors.colorRGB[j.colorName];
	isExistingQ  = newCue.uniqueID in i.showCues;

	if (isExistingQ) {
		newCue.qOrder = i.showCues[newCue.uniqueID].qOrder;
	}

	if (newCue.isRunning || newCue.isPaused) {
		if (isExistingQ) {
			if (0 == (newCue.startedAt = i.showCues[newCue.uniqueID].startedAt)) {
				newCue.startedAt = Date.now();
			}
		} else {
			newCue.startedAt = Date.now();
			//i.debug("--------Cue " + newCue.qNumber + "@" + newCue.startedAt);
		}
	} else {
		newCue.startedAt = 0;
	}
}

module.exports = Cue;
