import OSC from 'osc'
import { runEntrypoint, InstanceBase, InstanceStatus } from '@companion-module/base'
import { compileActionDefinitions } from './actions.js'
import { compileFeedbackDefinitions } from './feedbacks.js'
import { compilePresetDefinitions } from './presets.js'
import { compileVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { GetConfigFields } from './config.js'
import Cue from './cues.js'

class GoButtonInstance extends InstanceBase {
	qCueRequest = [
		{
			type: 's',
			value:
				'["number","uniqueID","listName","type","isPaused","duration","actionElapsed","notes",' +
				'"colorName","isRunning","isLoaded","armed","isBroken","percentActionElapsed","goButtonText"]',
		},
	]

	groupCueTypes = ['group', 'super']

	pollItems = ['/fullScreen', '/masterVolumeVisible', '/dim', '/mute']

	QSTATUS_CHAR = {
		broken: '\u2715',
		running: '\u23F5',
		paused: '\u23F8',
		loaded: '\u23FD',
		idle: '\u00b7',
	}

	cueStatusChar(cue) {
		if (cue.isBroken) return this.QSTATUS_CHAR.broken
		if (cue.isRunning) return this.QSTATUS_CHAR.running
		if (cue.isPaused) return this.QSTATUS_CHAR.paused
		if (cue.isLoaded) return this.QSTATUS_CHAR.loaded
		return this.QSTATUS_CHAR.idle
	}

	cleanCueNum(cue) {
		return cue.replace(/[^\w\.]/gi, '_')
	}

	constructor(internal) {
		super(internal)

		this.instanceOptions.disableVariableValidation = true
		this.useTCP = false
	}

	applyConfig(config) {
		this.config = config
		this.useTCP = config?.useTCP || true
	}

	async configUpdated(config) {
		this.config = config
		this.applyConfig(config)

		this.connecting = false
		this.needPasscode = false
		this.useTCP = config.useTCP
		this.hasError = false
		this.disabled = false
		this.pollCount = 0
		this.resetVars()
		this.init_actions()
		this.init_presets()
		this.init_variables()
		this.init_feedbacks()
		this.init_osc()
	}

	async init(config) {
		this.config = config

		this.disabled = false
		this.updateStatus(InstanceStatus.Connecting)

		await this.configUpdated(config)
	}

	getConfigFields() {
		return GetConfigFields(this)
	}

	init_actions() {
		this.setActionDefinitions(compileActionDefinitions(this))
	}
	init_presets() {
		this.setPresetDefinitions(compilePresetDefinitions(this))
	}
	init_feedbacks() {
		if (this.useTCP) {
			this.setFeedbackDefinitions(compileFeedbackDefinitions(this))
		} else {
			this.setFeedbackDefinitions({})
		}
	}
	init_variables() {
		if (this.useTCP) {
			this.setVariableDefinitions(compileVariableDefinitions(this))
			this.updateRunning()
			this.updateNextCue()
		} else {
			this.setVariableDefinitions([])
		}
	}

	resetVars(doUpdate) {
		let qName = ''
		let qNum = ''
		let cues = this.showCues

		// play head info
		this.nextCue = ''
		// most recent running cue
		this.runningCue = new Cue()

		// clear 'variables'
		if (doUpdate && this.useTCP) {
			this.updateNextCue()
			this.updatePlaying()

			Object.keys(cues).forEach((cue) => {
				qNum = this.cleanCueNum(cues[cue].qNumber)
				qName = cues[cue].qName
				if (qNum != '' && qName != '') {
					delete this.cueColors[qNum]
					this.setVariableValues({ ['q_' + qNum + '_name']: undefined })
				}
			})
		}

		// need a valid GoButton reply
		this.needShow = true
		this.needPasscode = false

		// list of cues and info for this GoButton Show
		this.showCues = {}
		this.cueColors = {}
		this.cueOrder = []
		this.requestedCues = {}
		this.lastRunID = '-' + this.lastRunID
		this.showName = 'N/A'
		this.masterFader = false
		this.fullScreen = false
		this.faderDim = false
		this.faderMute = false
	}

	updateNextCue() {
		const nc = this.showCues[this.nextCue] || new Cue()

		this.setVariableValues({
			n_id: nc.uniqueID,
			n_name: nc.qName,
			n_num: nc.qNumber,
			n_notes: nc.Notes,
			g_text: nc.gbText == '' ? 'GO' : nc.gbText,
			n_stat: this.cueStatusChar(nc),
		})
		this.checkFeedbacks('playhead_bg')
	}

	updateQVars(q) {
		let qID = q.uniqueID
		let qNum = this.cleanCueNum(q.qNumber)
		let qColor = q.qColor
		let oqNum = ''
		let oqName = ''
		let oqColor = 0
		let oqOrder = -1

		// unset old variable?
		if (qID in this.showCues) {
			oqNum = this.cleanCueNum(this.showCues[qID].qNumber)
			oqName = this.showCues[qID].qName
			oqColor = this.showCues[qID].qColor
			oqOrder = this.showCues[qID].qOrder
			if (oqNum != '' && oqNum != q.qNumber) {
				this.setVariableValues('q_' + oqNum + '_name')
				this.cueColors[oqNum] = 0
				oqName = ''
			}
		}
		// set new value
		if (qNum != '' && q.qName != '' && (q.qName != oqName || qColor != oqColor)) {
			this.setVariableValues({ ['q_' + qNum + '_name']: q.qName })
			this.cueColors[qNum] = q.qColor
			this.checkFeedbacks('q_bg')
		}
	}

	updateRunning() {
		const tenths = this.config.useTenths ? 0 : 1
		const rc = this.runningCue

		let tLeft = rc.duration * (1 - rc.pctElapsed)
		if (tLeft > 0) {
			tLeft += tenths
		}
		const h = Math.floor(tLeft / 3600)
		const hh = ('00' + h).slice(-2)
		const m = Math.floor(tLeft / 60) % 60
		const mm = ('00' + m).slice(-2)
		const s = Math.floor(tLeft % 60)
		const ss = ('00' + s).slice(-2)
		let ft = ''

		if (hh > 0) {
			ft = hh + ':'
		}
		if (mm > 0) {
			ft = ft + mm + ':'
		}
		ft = ft + ss

		if (tenths == 0) {
			let f = Math.floor((tLeft - Math.trunc(tLeft)) * 10)
			let ms = ('0' + f).slice(-1)
			if (tLeft < 5 && tLeft != 0) {
				ft = ft.slice(-1) + '.' + ms
			}
		}

		this.setVariableValues({
			r_id: rc.uniqueID,
			r_name: rc.qName,
			r_num: rc.qNumber,
			r_stat: this.cueStatusChar(rc),
			r_hhmmss: hh + ':' + mm + ':' + ss,
			r_hh: hh,
			r_mm: mm,
			r_ss: ss,
			r_left: ft,
		})
		if (rc.isPaused) {
			this.setVariableValues({ g_text: rc.gbText })
		} else if (this.nextCue != '') {
			this.setVariableValues({ g_text: this.showCues[this.nextCue].gbText })
		}
		this.checkFeedbacks('run_bg')
	}

	sendOSC(node, arg) {
		arg = arg || []

		if (!this.useTCP) {
			let host = this.config?.host || ''
			if (this.config?.passcode !== '') {
				this.oscSend(host, this.config.port, '/connect', [this.config.passcode])
			}
			this.oscSend(host, this.config.port, node, arg)
		} else if (this.ready) {
			this.qSocket.send({
				address: node,
				args: arg,
			})
		}
	}

	connect() {
		if (!this.hasError) {
			this.updateStatus(InstanceStatus.Connecting)
		}
		if (!this.disabled) {
			this.init_osc()
		}
	}

	// get current status of GoButton cues and playhead
	// and ask for updates
	prime_vars() {
		let self = this

		if (self.needPasscode && (self.config.passcode == undefined || self.config.passcode == '')) {
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Wrong Passcode')
			self.log('debug', 'waiting for passcode')
			self.sendOSC('/connect', [])
			if (self.timer !== undefined) {
				clearTimeout(self.timer)
				self.timer = undefined
			}
			if (self.pulse !== undefined) {
				clearInterval(self.pulse)
				self.pulse = undefined
			}
			self.timer = setTimeout(() => {
				self.prime_vars()
			}, 5000)
		} else if (self.needShow && self.ready) {
			if (self.config?.passcode !== '') {
				self.log('debug', 'sending passcode to ' + self.config.host)
				self.sendOSC('/connect', [{ type: 's', value: self.config.passcode }])
			} else {
				self.sendOSC('/connect', [])
			}

			// request variable/feedback info
			// get list of running cues
			self.sendOSC('/cue/playhead/uniqueID', [])
			self.sendOSC('/updates', [{ type: 'i', value: 1 }])

			self.sendOSC('/version', [])
			self.sendOSC('/cueLists', [])
			if (self.timer !== undefined) {
				clearTimeout(self.timer)
				self.timer = undefined
			}
			self.timer = setTimeout(() => {
				self.prime_vars()
			}, 5000)
		}
	}

	/**
	 * heartbeat/poll for 'updates' that aren't automatic
	 */
	rePulse() {
		const rc = this.runningCue
		const now = Date.now()
		const cues = this.showCues

		if (0 == this.pollCount % (this.config.useTenths ? 10 : 4)) {
			this.pollItems.forEach((pc) => {
				this.sendOSC(pc, [])
				// debug("poll",pc);
			})
		}
		this.pollCount++
		if (Object.keys(this.requestedCues).length > 0) {
			let variableValues = {}
			const checkFeedbacks = new Set()
			const timeOut = now - 500
			for (var k in this.requestedCues) {
				if (this.requestedCues[k] < timeOut) {
					// no response from GoButton for at least 100ms
					// so delete the cue from our list
					const cue = cues[k]
					if (cue) {
						// GoButton sometimes sends 'reload the whole cue list'
						// so a cue we were waiting for may have been moved/deleted between checks
						const qNum = this.cleanCueNum(cues[k].qNumber)
						const qName = cues[k].qName
						if (qNum && qName) {
							delete this.cueColors[qNum]
						}
						variableValues['q_' + qNum + '_name'] = qName
						checkFeedbacks.add('q_bg')
					}
					delete this.requestedCues[k]
				}
			}
			this.setVariableValues(variableValues)
			if (checkFeedbacks.size > 0) {
				this.checkFeedbacks(...Array.from(checkFeedbacks))
			}
		}

		if (rc && rc.uniqueID != '') {
			this.sendOSC('/runningOrPausedCues', [])
		}
	}

	init_osc() {
		let self = this

		if (self.connecting) {
			return
		}

		if (self.qSocket) {
			self.qSocket.close()
		}

		if (!self.useTCP) {
			self.updateStatus(InstanceStatus.Ok, 'UDP Mode')
			return
		}

		if (self.config.host) {
			self.qSocket = new OSC.TCPSocketPort({
				localAddress: '0.0.0.0',
				localPort: 0,
				address: self.config.host,
				port: self.config.port,
				metadata: true,
			})

			self.connecting = true

			self.qSocket.open()

			self.qSocket.on('error', (err) => {
				self.log('debug', 'Error: ' + err.message)
				self.connecting = false
				if (!self.hasError) {
					self.log('error', 'Error: ' + err.message)
					self.updateStatus(InstanceStatus.ConnectionFailure, 'Cannot connect to Go Button\n' + err.message)
					self.hasError = true
				}
				self.qSocket.removeAllListeners()
				if (self.timer !== undefined) {
					clearTimeout(self.timer)
				}
				if (self.pulse !== undefined) {
					clearInterval(self.pulse)
					self.pulse = undefined
				}
				self.timer = setTimeout(() => {
					self.connect()
				}, 5000)
			})

			self.qSocket.on('close', () => {
				if (!self.hasError && self.ready) {
					self.log('error', 'TCP Connection to Go Button Closed')
				}
				self.connecting = false
				if (self.ready) {
					self.needShow = true
					self.needPasscode = false
					self.resetVars(true)
					// the underlying socket issues a final close after
					// the OSC socket is closed, which gets deleted on 'destroy'
					if (self.qSocket != undefined) {
						self.qSocket.removeAllListeners()
					}
					self.log('debug', 'Connection closed')
					self.ready = false
					self.hasError = true
					if (self.disabled) {
						self.updateStatus(InstanceStatus.Disconnected, 'Disabled')
					} else {
						self.updateStatus(InstanceStatus.Disconnected, 'CLOSED')
					}
				}
				if (self.timer !== undefined) {
					clearTimeout(self.timer)
					self.timer = undefined
				}
				if (self.pulse !== undefined) {
					clearInterval(self.pulse)
					self.pulse = undefined
				}
				if (!self.disabled) {
					// don't restart if instance was disabled
					self.timer = setTimeout(() => {
						self.connect()
					}, 5000)
				}
			})

			self.qSocket.on('ready', () => {
				self.ready = true
				self.connecting = false
				self.hasError = false
				self.log('info', 'Connected to Go Button: ' + self.config.host)
				self.updateStatus(InstanceStatus.UnknownWarning, 'No Show')
				self.needShow = true

				self.prime_vars()
			})

			self.qSocket.on('message', (message) => {
				// debug("received ", message, "from", self.qSocket.options.address);
				if (message.address.match(/^\/update\//)) {
					// debug("readUpdate");
					self.readUpdate(message)
				} else if (message.address.match(/^\/reply\//)) {
					// debug("readReply");
					self.readReply(message)
				} else {
					self.log('debug', `${message.address} ` + JSON.stringify(message.args))
				}
			})
		}
		// self.qSocket.on("data", (data) => {
		// 	debug ("Got",data, "from",self.qSocket.options.address);
		// });
	}

	/**
	 * update list cues
	 */
	updateCues(jCue, stat, ql) {
		// list of useful cue types we're interested in
		const qTypes = ['audio', 'fade', 'group', 'start', 'stop', 'goto', 'super']
		let q = {}

		if (Array.isArray(jCue)) {
			let i = 0
			let idCount = {}
			let dupIds = false
			while (i < jCue.length) {
				q = new Cue(jCue[i], this)
				q.qOrder = i
				if (ql) {
					q.qList = ql
				}
				if (q.uniqueID in idCount) {
					idCount[q.uniqueID] += 1
					dupIds = true
				} else {
					idCount[q.uniqueID] = 1
				}

				if (qTypes.includes(q.qType)) {
					this.updateQVars(q)
					this.showCues[q.uniqueID] = q
				}
				i++
			}
			// Hit cues have background
			this.checkFeedbacks('q_bg')
		} else {
			q = new Cue(jCue, this)
			if (qTypes.includes(q.qType)) {
				this.updateQVars(q)
				this.showCues[q.uniqueID] = q
				this.updatePlaying()
				if (q.uniqueID == this.nextCue) {
					this.updateNextCue()
				}
			}
			delete this.requestedCues[q.uniqueID]
		}
	}

	/**
	 * update list of running cues
	 */
	updatePlaying() {
		function qState(q) {
			let ret = q.uniqueID + ':'
			ret += q.isBroken ? '0' : q.isRunning ? '1' : q.isPaused ? '2' : q.isLoaded ? '3' : '4'
			ret += ':' + q.duration + ':' + q.pctElapsed
			return ret
		}

		let hasSuper = false
		let i
		let cues = this.showCues
		let lastRun = qState(this.runningCue)
		let runningCues = []

		Object.keys(cues).forEach((cue) => {
			if ((cues[cue].duration > 0 && cues[cue].isRunning) || cues[cue].isPaused) {
				if (!this.groupCueTypes.includes(cues[cue].qType)) {
					runningCues.push([cue, cues[cue].startedAt])
					if (cues[cue].qType == 'super') {
						hasSuper = true
					}
				}
			}
		})

		runningCues.sort((a, b) => {
			return b[1] - a[1]
		})

		if (runningCues.length == 0) {
			this.runningCue = new Cue()
		} else {
			i = 0

			if (hasSuper) {
				while (cues[runningCues[i][0]].qType != 'super' && i < runningCues.length) {
					i += 1
				}
			}

			if (i < runningCues.length) {
				this.runningCue = cues[runningCues[i][0]]
			}
		}
		// update if changed
		if (qState(this.runningCue) != lastRun) {
			this.updateRunning(true)
		}
	}

	/**
	 * process GoButton 'update'
	 */
	readUpdate(message) {
		const ma = message.address

		/**
		 * A GoButton 'update' message is just the uniqueID for a cue where something 'changed'.
		 * We have to request any other information we need (name, number, isRunning, etc.)
		 */

		if (ma.match(/playbackPosition$/)) {
			if (message.args.length > 0) {
				const oa = message.args[0].value
				if (oa !== this.nextCue) {
					// playhead changed
					this.nextCue = oa
					this.sendOSC('/cue/playhead/valuesForKeys', this.qCueRequest)
				}
			} else {
				// no playhead
				this.nextCue = ''
				this.updateNextCue()
			}
		} else if (ma.match(/\/cue_id\//) && !ma.match(/cue lists\]$/)) {
			// get cue information for 'updated' cue
			const node = ma.substring(7) + '/valuesForKeys'
			this.sendOSC(node, this.qCueRequest)
			// save info request time to verify a response.
			// If there is no response within 2 pulses
			// we delete our copy of the cue
			const uniqueID = ma.slice(-36)
			this.requestedCues[uniqueID] = Date.now()
		} else if (ma.match(/\/disconnect$/)) {
			this.qSocket.close()
			// } else {
			// 	self.debug("=====> OSC message: ",ma);
		}
	}

	/**
	 * process GoButton 'reply'
	 */
	readReply(message) {
		const ma = message.address
		let j = {}
		let i = 0
		let q
		let uniqueID
		const qr = this.qCueRequest

		try {
			j = JSON.parse(message.args[0].value)
		} catch (error) {
			/* ingnore errors */
		}

		if ('ignoring_show_methods' == j.data) {
			// we missed a disconnect
			this.needShow = true
			this.updateStatus(InstanceStatus.UnknownWarning, 'No Show')
			return
		}
		if (ma.match(/\/connect$/)) {
			if (j.data == 'badpass') {
				if (!this.needPasscode) {
					this.needPasscode = true
					this.updateStatus(InstanceStatus.ConnectionFailure, 'Wrong Passcode')
					this.prime_vars()
				}
			} else if (j.data == 'error') {
				this.needPasscode = false
				this.needShow = true
				this.updateStatus(InstanceStatus.UnknownWarning, 'No Show')
			} else if (j.data == 'ok') {
				this.needPasscode = false
				if (!this.needShow) {
					this.needShow = true
					this.updateStatus(InstanceStatus.Ok, 'Connected to ' + this.host)
				}
			}
		}
		if (ma.match(/updates$/)) {
			this.needShow = true

			this.sendOSC('/shows', [])
			if (!this.pulse) {
				this.pulse = setInterval(
					() => {
						this.rePulse()
					},
					this.config.useTenths ? 100 : 250
				)
			}
		} else if (ma.match(/version$/)) {
			if (j.data != undefined) {
				this.setVariableValues({ q_ver: j.data })
			}
			this.needShow = true
		} else if (ma.match(/uniqueID$/)) {
			if (j.data != undefined) {
				this.nextCue = j.data
				this.sendOSC('/cue/playhead/valuesForKeys', qr)
			}
		} else if (ma.match(/\/cueLists$/)) {
			if (j.data != undefined) {
				if (this.needShow) {
					this.needShow = false
					this.updateStatus(InstanceStatus.Ok, 'Connected to Go Button')
				}
				i = 0
				while (i < j.data.length) {
					q = j.data[i]
					this.updateCues(q.cues)
					i++
				}
				this.sendOSC('/runningOrPausedCues', [])
			}
		} else if (ma.match(/runningOrPausedCues$/)) {
			if (j.data != undefined) {
				i = 0
				while (i < j.data.length) {
					q = j.data[i]
					this.sendOSC(`/cue_id/${q.uniqueID}/valuesForKeys`, qr)
					i++
				}
			}
		} else if (ma.match(/valuesForKeys$/)) {
			this.updateCues(j.data, 'v')
			uniqueID = ma.substr(14, 36)
			delete this.requestedCues[uniqueID]
		} else if (ma.match(/fullScreen$/)) {
			this.fullScreen = j.data
			this.checkFeedbacks('fs_bg')
		} else if (ma.match(/masterVolumeVisible$/)) {
			this.masterFader = j.data
			this.checkFeedbacks('mf_bg')
		} else if (ma.match(/dim$/)) {
			this.faderDim = j.data
			this.checkFeedbacks('dim_bg')
		} else if (ma.match(/mute$/)) {
			this.faderMute = j.data
			this.checkFeedbacks('mute_bg')
		} else if (ma.match(/shows$/)) {
			this.showName = j.data[0].displayName
			this.setVariableValues({ s_name: this.showName })
		}
	}

	// When module gets deleted
	async destroy() {
		this.resetVars(true)
		if (this.timer !== undefined) {
			clearTimeout(this.timer)
			delete this.timer
		}
		if (this.pulse !== undefined) {
			clearInterval(this.pulse)
			delete this.pulse
		}
		if (this.qSocket) {
			this.qSocket.close()
			delete this.qSocket
		}
		this.disabled = true
		this.updateStatus(InstanceStatus.UnknownError, 'Disabled')
	}
}

runEntrypoint(GoButtonInstance, UpgradeScripts)
