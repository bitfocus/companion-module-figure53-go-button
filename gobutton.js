/*
 version 1.2.2 (jjr)
	Corrected rgb function to self.rgb
	Re-factored supplimental files to use module as 'this'

 Version 1.2.1 (jjr)
	fix UDP logic

 Version 1.2.0 (jjr)
	minor Text cleanup

 Version 1.1.0 (jjr)
	Rebased from qlab-advance for protocol and timer fixes and improvements
	Removed non-qlab only items, added go-button items
	Added Hit color feedback and Hit Cue Name variable
	Added Go Button Text variable

 Version 1.0.5
	Updated presets from 1.0.3 that got skipped in 1.0.4 update.
	Changed "custom OSC" to "currently unsupported command".

 Version 1.0.4
	modified by moderator to fix preset errors.

 Version 1.0.3
	Added presets and actions to start & stop specified Hits.
	Added presets and actions to pause Hits

 Version 1.0.2
	Added presets and actions for the timer.
	Added preset and action for "Oops".
	Added preset and action for full screen toggle.
	Added preset and sction for making the master volume visible toggle.
	Added presets and action for setting master volume (appears not to work in Go Button".
	Added presets for increasing and decreasing master volume by 6dB.
	Added presets for toggling the master dim.
	Added presets for toggling the master dim.

 Version 1.0.1
	Original code from qlab-advance version 1.1.2 by John A Knight.
	Added configuration for customisation of GoButton port.
	Add the ability to send custom OSC commands.
	Commented out unsupported QLab presets and actions.

*/

var instance_skel = require('../../instance_skel');
var OSC = require('osc');
//var util = require('util');
var debug;

var log;

function instance(system, id, config) {
	var self = this;
	var po = 0;

	self.connecting = false;
	self.needPasscode = false;
	self.useTCP = config.useTCP;
	self.hasError = false;
	self.disabled = true;
	self.applyConfig(config);
	self.pollCount = 0;

	self.colors = require('./colors');
	self.Presets = require('./presets');
	self.Actions = require('./actions');
	self.Variables = require('./variables');
	self.Feedbacks = require('./feedbacks');
	self.Cue = require('./cues');
	self.resetVars();

	// each instance needs a separate local port
	id.split('').forEach(function (c) {
		po += c.charCodeAt(0);
	});
	self.port_offset = po;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	// this makes the upgradscript always run when debugging
	if (process.env.DEVELOPER) {
		self.config._configIdx = -1;
	}

	self.addUpgradeScript(function (config, actions, releaseActions, feedbacks) {
		var changed = false;

		function upgradePass(actions, changed) {
			for (var k in actions) {
				var action = actions[k];
				// nothing for now
			}
			return changed;
		}

		changed = upgradePass(actions, changed);
		changed = upgradePass(releaseActions, changed);

		if (!config.useTenths) {
			config.useTenths = false;
			changed = true;
		}
		return changed;
	});

	return self;
}

instance.prototype.applyConfig = function (config) {
	var self = this;

	if (config.useTCP == undefined ) {
		config.useTCP = true;
	}

	self.useTCP = config.useTCP;
};

instance.prototype.qCueRequest = [
	{
		type: "s",
		value: '["number","uniqueID","listName","type","isPaused","duration","actionElapsed","notes",' +
			'"colorName","isRunning","isLoaded","armed","isBroken","percentActionElapsed","goButtonText"]'
	}
];

instance.prototype.groupCueTypes = ['group','super'];

instance.prototype.pollItems = ['/fullScreen','/masterVolumeVisible','/dim','/mute'];

instance.prototype.QSTATUS_CHAR = {
	broken: "\u2715",
	running: "\u23F5",
	paused: "\u23F8",
	loaded: "\u23FD",
	idle: "\u00b7"
};

instance.prototype.resetVars = function (doUpdate) {
	var self = this;
	var qName = '';
	var qNum = '';
	var cues = self.showCues;

	// play head info
	self.nextCue = '';
	// most recent running cue
	self.runningCue = new self.Cue();

	// clear 'variables'
	if (doUpdate && self.useTCP) {
		self.updateNextCue();
		self.updatePlaying();

		Object.keys(cues).forEach(function (cue) {
			qNum = cues[cue].qNumber.replace(/[^\w\.]/gi,'_');
			qName = cues[cue].qName;
			if (qNum != '' && qName != '') {
				delete self.cueColors[qNum];
				self.setVariable('q_' + qNum + '_name');
			}
		});
	}

	// need a valid GoButton reply
	self.needShow = true;
	self.needPasscode = false;

	// list of cues and info for this GoButton Show
	self.showCues = {};
	self.cueColors = {};
	self.cueOrder = [];
	self.requestedCues = {};
	self.lastRunID = '-' + self.lastRunID;
	self.showName = 'N/A';
	self.masterFader = false;
	self.fullScreen = false;
	self.faderDim = false;
	self.faderMute = false;
};

instance.prototype.updateNextCue = function () {
	var self = this;
	var nc = self.showCues[self.nextCue];
	if (!nc) {
		nc = new self.Cue();
	}
	if (nc.qType != 'super') {
		nc = nc
	}

	self.setVariable('n_id', nc.uniqueID);
	self.setVariable('n_name', nc.qName);
	self.setVariable('n_num', nc.qNumber);
	self.setVariable('n_notes', nc.Notes);
	self.setVariable('g_text', nc.gbText == '' ? "GO" : nc.gbText);
	self.setVariable('n_stat', nc.isBroken ? self.QSTATUS_CHAR.broken :
							nc.isRunning ? self.QSTATUS_CHAR.running :
							nc.isPaused ? self.QSTATUS_CHAR.paused :
							nc.isLoaded ? self.QSTATUS_CHAR.loaded :
							self.QSTATUS_CHAR.idle);
	self.checkFeedbacks('playhead_bg');
};

instance.prototype.updateQVars = function (q) {
	var self = this;
	var qID = q.uniqueID;
	var qNum = (q.qNumber).replace(/[^\w\.]/gi,'_');
	var qColor = q.qColor;
	var oqNum = '';
	var oqName = '';
	var oqColor = 0;
	var oqOrder = -1;

	// unset old variable?
	if (qID in self.showCues) {
		oqNum = self.showCues[qID].qNumber.replace(/[^\w\.]/gi,'_');
		oqName = self.showCues[qID].qName;
		oqColor = self.showCues[qID].qColor;
		oqOrder = self.showCues[qID].qOrder;
		if (oqNum != '' && oqNum != q.qNumber) {
			self.setVariable('q_' + oqNum + '_name');
			self.cueColors[oqNum] = 0;
			oqName = '';
		}
	}
	// set new value
	if (qNum != '' && q.qName != '' && (q.qName != oqName || qColor != oqColor)) {
		self.setVariable('q_' + qNum + '_name', q.qName);
		self.cueColors[qNum] = q.qColor;
		self.checkFeedbacks('q_bg');
	}
};


instance.prototype.updateRunning = function () {
	var self = this;
	var tenths = (self.config.useTenths ? 0 : 1);
	var rc = self.runningCue;

	var tLeft = rc.duration * (1 - rc.pctElapsed);
	if (tLeft > 0) {
		tLeft += tenths;
	}
	var h = Math.floor(tLeft / 3600);
	var hh = ('00' + h).slice(-2);
	var m = Math.floor(tLeft / 60) % 60;
	var mm = ('00' + m).slice(-2);
	var s = Math.floor(tLeft % 60);
	var ss = ('00' + s).slice(-2);
	var ft = '';

	if (hh > 0) {
		ft = hh + ":";
	}
	if (mm > 0) {
		ft = ft + mm + ":";
	}
	ft = ft + ss;

	if (tenths == 0) {
		var f = Math.floor((tLeft - Math.trunc(tLeft)) * 10);
		var ms = ('0' + f).slice(-1);
		if (tLeft < 5 && tLeft != 0) {
			ft = ft.slice(-1) + "." + ms;
		}
	}

	self.setVariable('r_id', rc.uniqueID);
	self.setVariable('r_name', rc.qName);
	self.setVariable('r_num', rc.qNumber);
	self.setVariable('r_stat', rc.isBroken ? self.QSTATUS_CHAR.broken :
							rc.isRunning ? self.QSTATUS_CHAR.running :
							rc.isPaused ? self.QSTATUS_CHAR.paused :
							rc.isLoaded ? self.QSTATUS_CHAR.loaded :
							self.QSTATUS_CHAR.idle);
	self.setVariable('r_hhmmss',hh + ":" + mm + ":" + ss);
	self.setVariable('r_hh', hh);
	self.setVariable('r_mm', mm);
	self.setVariable('r_ss', ss);
	self.setVariable('r_left',ft);
	if (rc.isPaused) {
		self.setVariable('g_text',rc.gbText);
	} else if (self.nextCue != '') {
		self.setVariable('g_text',self.showCues[self.nextCue].gbText);
	}
	self.checkFeedbacks('run_bg');
};

instance.prototype.updateConfig = function (config) {
	var self = this;

	self.config = config;
	self.applyConfig(config);

	self.resetVars();
	self.init_osc();
	self.init_presets();
	if (self.useTCP) {
		self.init_variables();
		self.init_feedbacks();
	} else {
		self.setFeedbackDefinitions({});
		self.setVariableDefinitions([]);
	}
};

instance.prototype.init = function () {
	var self = this;
	self.disabled = false;

	self.status(self.STATUS_UNKNOWN, 'Connecting');

	debug = self.debug;
	log = self.log;
	self.init_osc();
	self.init_presets();
	if (self.useTCP){
		self.init_variables();
		self.init_feedbacks();
	} else {
		self.setFeedbackDefinitions({});
		self.setVariableDefinitions([]);
	}
};

instance.prototype.init_presets = function () {
	this.setPresetDefinitions(this.Presets.setPresets.call(this));
};

instance.prototype.init_feedbacks = function () {
	this.setFeedbackDefinitions(this.Feedbacks.setFeedbacks.call(this));
};

instance.prototype.init_variables = function () {
	this.setVariableDefinitions(this.Variables.setVariables.call(this));
	this.updateRunning();
	this.updateNextCue();
};

instance.prototype.actions = function (system) {
	this.setActions(this.Actions.setActions.call(this));
};

instance.prototype.sendOSC = function (node, arg) {
	var self = this;

	if (!self.useTCP) {
		var host = "";
		if (self.config.host !== undefined && self.config.host !== ""){
			host = self.config.host;
		}
		if (self.config.passcode !== undefined && self.config.passcode !== "") {
			self.system.emit('osc_send', host, self.config.port, "/connect", [self.config.passcode]);
		}
		self.system.emit('osc_send',host, self.config.port, node, arg);
	} else if (self.ready) {
		self.qSocket.send({
			address: node,
			args: arg
		});
	}
};

instance.prototype.connect = function () {
	if (!this.hasError) {
		this.status(this.STATUS_UNKNOWN, "Connecting");
	}
	this.init_osc();
};

// get current status of GoButton cues and playhead
// and ask for updates
instance.prototype.prime_vars = function () {
	var self = this;

	if (self.needPasscode && (self.config.passcode == undefined || self.config.passcode == "")) {
		self.status(self.STATUS_WARNING, "Wrong Passcode");
		self.debug("waiting for passcode");
		self.sendOSC("/connect", []);
		if (self.timer !== undefined) {
			clearTimeout(self.timer);
			self.timer = undefined;
		}
		if (self.pulse !== undefined) {
			clearInterval(self.pulse);
			self.pulse = undefined;
		}
		self.timer = setTimeout(function () { self.prime_vars(); }, 5000);
	} else if (self.needShow && self.ready) {
		self.sendOSC("/version");
		if (self.config.passcode !== undefined && self.config.passcode !== "") {
			self.debug("sending passcode to", self.config.host);
			self.sendOSC("/connect", [
				{
					type: "s",
					value: self.config.passcode
				}]
			);
		} else {
			self.sendOSC("/connect", []);
		}

		// request variable/feedback info
		// get list of running cues
		self.sendOSC("/cue/playhead/uniqueID", []);
		self.sendOSC("/updates", [{
				type: "i",
				value: 1
			}]
		);

		self.sendOSC("/cueLists", []);
		if (self.timer !== undefined) {
			clearTimeout(self.timer);
			self.timer = undefined;
		}
		self.timer = setTimeout(function () { self.prime_vars(); }, 5000);
	}
};

/**
 * heartbeat/poll function for 'updates' that aren't automatic
 */
instance.prototype.rePulse = function () {
	var self = this;
	var rc = self.runningCue;

	if (0==(self.pollCount % 10)) {
		self.pollItems.forEach(function(pc) {
			self.sendOSC(pc,[]);
			// debug("poll",pc);
		});
	}
	self.pollCount++;
	if (Object.keys(self.requestedCues).length > 0) {
		var timeOut = Date.now() - 100;
		var cue;
		var cues = self.showCues;
		var qNum;
		var qName;
		for (var k in self.requestedCues) {
			if (self.requestedCues[k] < timeOut) {
				// no response from GoButton for at least 100ms
				// so delete the cue from our list
				if (cues[k]) {
					// GoButton sometimes sends 'reload the whole cue list'
					// so a cue we were waiting for may have been moved/deleted between checks
					qNum = cues[k].qNumber.replace(/[^\w\.]/gi,'_');
					qName = cues[k].qName;
					if (qNum != '' && qName != '') {
						delete self.cueColors[qNum];
						self.setVariable('q_' + qNum + '_name');
					}
					self.checkFeedbacks('q_bg');
			}
				delete self.requestedCues[k];
			}
		}
	}
	if (rc && rc.uniqueID != '') {
		self.sendOSC("/runningOrPausedCues",[]);
	}
};

instance.prototype.init_osc = function () {
	var self = this;

	if (self.connecting) {
		return;
	}

	if (self.qSocket) {
		self.qSocket.close();
	}

	if (!self.useTCP) {
		self.status(self.STATUS_OK, "UDP Mode");
		return;
	}

	if (self.config.host) {

		self.qSocket = new OSC.TCPSocketPort({
			localAddress: "0.0.0.0",
			localPort: self.config.port + self.port_offset,
			address: self.config.host,
			port: self.config.port,
			metadata: true
		});

		self.connecting = true;

		self.qSocket.open();

		self.qSocket.on("error", function (err) {
			self.connecting = false;
			if (!self.hasError) {
				debug("Error", err);
				self.log('error', "Error: " + err.message);
				self.status(self.STATUS_ERROR, "Can't connect to Go Button\n" + err.message);
				self.hasError = true;
			}
			if (err.code == "ECONNREFUSED") {
				self.qSocket.removeAllListeners();
				if (self.timer !== undefined) {
					clearTimeout(self.timer);
				}
				if (self.pulse !== undefined) {
					clearInterval(self.pulse);
					self.pulse = undefined;
				}
				self.timer = setTimeout(function () { self.connect(); }, 5000);
			}
		});

		self.qSocket.on("close", function () {
			self.log('error', "TCP Connection to Go Button Closed");
			self.connecting = false;
			if (self.ready) {
				self.needShow = true;
				self.needPasscode = false;
				self.resetVars(true);
				// the underlying socket issues a final close after
				// the OSC socket is closed, which gets deleted on 'destroy'
				if (self.qSocket != undefined) {
					self.qSocket.removeAllListeners();
				}
				debug("Connection closed");
				self.ready = false;
				self.hasError = true;
				if (self.disabled) {
					self.status(self.STATUS_UNKNOWN, "Disabled");
				} else {
					self.status(self.STATUS_WARNING, "CLOSED");
				}
			}
			if (self.timer !== undefined) {
				clearTimeout(self.timer);
				self.timer = undefined;
			}
			if (self.pulse !== undefined) {
				clearInterval(self.pulse);
				self.pulse = undefined;
			}
			if (!self.disabled) { // don't restart if instance was disabled
				self.timer = setTimeout(function () { self.connect(); }, 5000);
			}
		});

		self.qSocket.on("ready", function () {
			self.ready = true;
			self.connecting = false;
			self.hasError = false;
			self.log('info',"Connected to Go Button: " + self.config.host);
			self.status(self.STATUS_WARNING, "No Show");
			self.needShow = true;

			self.prime_vars();

		});

		self.qSocket.on("message", function (message) {
			// debug("received ", message, "from", self.qSocket.options.address);
			if (message.address.match(/^\/update\//)) {
				// debug("readUpdate");
				self.readUpdate(message);
			} else if (message.address.match(/^\/reply\//)) {
				// debug("readReply");
				self.readReply(message);
			} else {
				debug(message.address, message.args);
			}
		});
	}
	// self.qSocket.on("data", function(data){
	// 	debug ("Got",data, "from",self.qSocket.options.address);
	// });
};

/**
 * update list cues
 */
instance.prototype.updateCues = function (jCue, stat, ql) {
	var self = this;
	// list of useful cue types we're interested in
	var qTypes = ['audio', 'fade', 'group', 'start', 'stop', 'goto','super'];
	var q = {};

	if (Array.isArray(jCue)) {
		var i = 0;
		var idCount = {};
		var dupIds = false;
		while (i < jCue.length) {
			q = new self.Cue(jCue[i], self);
			q.qOrder = i;
			if (ql) {
				q.qList = ql;
			}
			if (q.uniqueID in idCount) {
				idCount[q.uniqueID] += 1;
				dupIds = true;
			} else {
				idCount[q.uniqueID] = 1;
			}

			if (qTypes.includes(q.qType)) {
				self.updateQVars(q);
				self.showCues[q.uniqueID] = q;
			}
			i += 1;
		}
		// Hit cues have background
		self.checkFeedbacks('q_bg');
	} else {
		q = new self.Cue(jCue, self);
		if (qTypes.includes(q.qType)) {
			self.updateQVars(q);
			self.showCues[q.uniqueID] = q;
			self.updatePlaying();
			if (q.uniqueID == self.nextCue) {
				self.updateNextCue();
			}
		}
	}
};

/**
 * update list of running cues
 */
instance.prototype.updatePlaying = function () {

	function qState (q) {
		var ret = q.uniqueID + ':';
		ret +=
			q.isBroken ? '0' :
			q.isRunning ? '1' :
			q.isPaused ? '2' :
			q.isLoaded ? '3' :
			'4';
		ret += ":" + q.duration + ":" + q.pctElapsed;
		return ret;
	}

	var self = this;
	var hasSuper = false;
	var i;
	var cues = self.showCues;
	var lastRun = qState(self.runningCue);
	var runningCues = [];

	Object.keys(cues).forEach(function (cue) {
		if ((cues[cue].duration > 0 && cues[cue].isRunning || cues[cue].isPaused)) {
			if (!self.groupCueTypes.includes(cues[cue].qType)) {
				runningCues.push([cue, cues[cue].startedAt]);
				if (cues[cue].qType == 'super') {
					hasSuper = true;
				}
			}
		}
	});

	runningCues.sort(function (a, b) {
		return b[1] - a[1];
	});

	if (runningCues.length == 0) {
		self.runningCue = new self.Cue();
	} else {
		i = 0;

		if (hasSuper) {
			while (cues[runningCues[i][0]].qType != "super" && i < runningCues.length) {
				i += 1;
			}
		}

		if (i < runningCues.length) {
			self.runningCue = cues[runningCues[i][0]];
		}
	}
	// update if changed
	if (qState(self.runningCue) != lastRun) {
		self.updateRunning(true);
	}
};

/**
 * process GoButton 'update'
 */
instance.prototype.readUpdate = function (message) {
	var self = this;
	var ma = message.address;
	var mf = ma.split('/');

	/**
	 * A GoButton 'update' message is just the uniqueID for a cue where something 'changed'.
	 * We have to request any other information we need (name, number, isRunning, etc.)
	 */

	if (ma.match(/playbackPosition$/)) {
		if (message.args.length > 0) {
			var oa = message.args[0].value;
			if (oa !== self.nextCue) {
				// playhead changed
				self.nextCue = oa;
				self.sendOSC("/cue/playhead/valuesForKeys", self.qCueRequest);
			}
		} else {
			// no playhead
			self.nextCue = '';
			self.updateNextCue();
		}
	} else if (ma.match(/\/cue_id\//) && !(ma.match(/cue lists\]$/))) {
		// get cue information for 'updated' cue
		var node = ma.substring(7) + "/valuesForKeys";
		self.sendOSC(node, self.qCueRequest);
		// save info request time to verify a response.
		// If there is no response within 2 pulses
		// we delete our copy of the cue
		var uniqueID = ma.slice(-36);
		self.requestedCues[uniqueID] = Date.now();
	} else if (ma.match(/\/disconnect$/)) {
		self.qSocket.close();
	// } else {
	// 	self.debug("=====> OSC message: ",ma);
	}
};


/**
 * process GoButton 'reply'
 */
instance.prototype.readReply = function (message) {
	var self = this;
	var ws = self.ws;
	var ma = message.address;
	var j = {};
	var i = 0;
	var q;
	var uniqueID;
	var qr = self.qCueRequest;

	try {
		j = JSON.parse(message.args[0].value);
	} catch (error) { /* ingnore errors */ }


	if ("ignoring_show_methods" == j.data) {
		// we missed a disconnect
		self.needShow = true;
		self.status(self.STATUS_WARNING, "No Show");
		return;
	}
	if (ma.match(/\/connect$/)) {
		if (j.data == "badpass") {
			if (!self.needPasscode) {
				self.needPasscode = true;
				self.status(self.STATUS_WARNING, "Wrong Passcode");
				self.prime_vars();
			}
		} else if (j.data == "error") {
			self.needPasscode = false;
			self.needShow = true;
			self.status(self.STATUS_WARNING, "No Show");
		} else if (j.data == "ok") {
			self.needPasscode = false;
			if (!self.needShow) {
				self.needShow = true;
				self.status(self.STATUS_WARNING, "No Show" + self.host);
			}
		}
	}
	if (ma.match(/updates$/)) {
		self.needShow = true;
		// self.status(self.STATUS_OK, "Connected to Go Button");
		// if (self.pulse !== undefined) {
		// 	self.debug('cleared stray interval');
		// 	clearInterval(self.pulse);
		// }
		self.sendOSC("/shows",[]);
		if (!self.pulse) {
			self.pulse = setInterval(function() { self.rePulse(); }, 100);
		}
	} else if (ma.match(/version$/)) {
		if (j.data != undefined) {
			self.setVariable('q_ver', j.data);
		}
		self.needShow = true;
	} else if (ma.match(/uniqueID$/)) {
		if (j.data != undefined) {
			self.nextCue = j.data;
			self.sendOSC("/cue/playhead/valuesForKeys", qr);
		}
	} else if (ma.match(/\/cueLists$/)) {
		if (j.data != undefined) {
			if (self.needShow) {
				self.needShow = false;
				self.status(self.STATUS_OK, "Connected to Go Button");
			}
			i = 0;
			while (i < j.data.length) {
				q = j.data[i];
				self.updateCues(q.cues);
				i++;
			}
			self.sendOSC("/runningOrPausedCues", []);
		}
	} else if (ma.match(/runningOrPausedCues$/)) {
		if (j.data != undefined) {
			i = 0;
			while (i < j.data.length) {
				q = j.data[i];
				self.sendOSC("/cue_id/" + q.uniqueID + "/valuesForKeys", qr);
				i++;
			}
		}
	} else if (ma.match(/valuesForKeys$/)) {
		self.updateCues(j.data, 'v');
		uniqueID = ma.substr(14,36);
		delete self.requestedCues[uniqueID];
	} else if (ma.match(/fullScreen$/)) {
		self.fullScreen = j.data;
		self.checkFeedbacks('fs_bg');
	} else if (ma.match(/masterVolumeVisible$/)) {
		self.masterFader = j.data;
		self.checkFeedbacks('mf_bg');
	} else if (ma.match(/dim$/)) {
		self.faderDim = j.data;
		self.checkFeedbacks('dim_bg');
	} else if (ma.match(/mute$/)) {
		self.faderMute = j.data;
		self.checkFeedbacks('mute_bg');
	} else if (ma.match(/shows$/)) {
		self.showName = j.data[0].displayName;
		self.setVariable('s_name',self.showName);
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	var configs = [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'Controls Go Button by <a href="https://figure53.com/" target="_new">Figure 53</a>' +
				'<br>Feedback and variables require TCP<br>which will increase network traffic.'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			tooltip: 'The IP of the computer running Go Button',
			regex: self.REGEX_IP
		},
		{
            type: 'textinput',
            id: 'port',
            label: 'Port',
            width: 6,
			tooltip: 'The Port number for Go Button OSC control',
			regex: self.REGEX_PORT,
            default: '53100'
        },
		{
			type: 'checkbox',
			label: 'Use TCP?',
			id: 'useTCP',
			width: 6,
			tooltip: 'Use TCP instead of UDP\nRequired for feedbacks',
			default: false
		},
		{
			type: 'checkbox',
			label: 'Use Tenths',
			id: 'useTenths',
			width: 6,
			tooltip: 'Show .1 second resolution for cue remaining timer?\nOtherwise offset countdown by +1 second\nRequires TCP',
			default: false
		},
		{
			type: 'textinput',
			id: 'passcode',
			label: 'OSC Pascode',
			width: 6,
			regex: self.REGEX_NUMBER,
			tooltip: 'The passcode to controll Go Button.\nLeave blank if not needed.'
		},

	];
	return configs;
};

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this;
	self.resetVars(true);
	if (self.timer !== undefined) {
		clearTimeout(self.timer);
		delete self.timer;
	}
	if (self.pulse !== undefined) {
		clearInterval(self.pulse);
		delete self.pulse;
	}
	if (self.qSocket) {
		self.disabled = true;
		self.qSocket.close();
		delete self.qSocket;
	}
	self.status(self.STATUS_UNKNOWN,"Disabled");
	debug("destroy", self.id);
};

instance.prototype.action = function (action) {
	var self = this;
	var opt = action.options;
	var cmd;
	var arg = [];
	var optTime;
	var followCmd;

	// if this is a +/- time action, preformat seconds arg
	if (opt != undefined && opt.time != undefined) {
		optTime = parseFloat(opt.time);
		if (optTime.isInteger) {
			typeTime = 'i';
		} else {
			typeTime = 'f';
		}
	}

	switch (action.action) {

		case 'start':
			cmd = '/cue/' + opt.cue + '/start';
			break;

		case 'goto':
			cmd = '/playhead/' + opt.cue;
			break;

		case 'go':
			cmd = '/go';
			break;

		case 'pause':
			cmd = '/pause';
			break;

		case 'stop':
			cmd = '/stop';
			break;

		case 'panic':
			cmd = '/panic';
			break;

		case 'reset':
			cmd = '/reset';
			break;

		case 'previous':
			cmd = '/playhead/previous';
			break;

		case 'next':
			cmd = '/playhead/next';
			break;

		case 'resume':
			cmd = '/resume';
			break;
			case 'timer_start':
				cmd = '/timer/start';
				break;

			case 'timer_stop':
				cmd = '/timer/stop';
				break;

			case 'timer_toggle':
				cmd = '/timer/toggleRunning';
				break;

			case 'timer_reset':
				cmd = '/timer/reset';
				break;

			case 'oops':
				cmd = '/oops';
				break;

			case 'toggleFullScreen':
				cmd = '/toggleFullScreen';
				followCmd = '/fullScreen';
				break;

			case 'toggleMasterVolumeVisible':
				cmd = '/toggleMasterVolumeVisible';
				followCmd = '/masterVolumeVisible';
				break;

			case 'volume':
				arg = {
					type: "f",
					value: parseFloat(opt.volume)
				};
				cmd = '/volume';
				break;

			case 'volumeStepUp':
				cmd = '/volumeStepUp';
				break;

			case 'volumeStepDown':
				cmd = '/volumeStepDown';
				break;

			case 'toggleDim':
				cmd = '/toggleDim';
				followCmd = '/dim';
				break;

			case 'toggleMute':
				cmd = '/toggleMute';
				followCmd = '/mute';
				break;

			case 'hitGo':
				cmd = '/hit/' + opt.hitNum + '/start';
				break;

			case 'hitStop':
				cmd = '/hit/' + opt.hitNum + '/stop';
				break;

			case 'hitPause':
				cmd = '/hit/' + opt.hitNum + '/pause';
				break;

	// switch
	}

	if (self.useTCP && !self.ready) {
		debug("Not connected to", self.config.host);
	} else if (cmd) {
		debug('sending', cmd, arg, "to", self.config.host);
		self.sendOSC(cmd, arg);
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
