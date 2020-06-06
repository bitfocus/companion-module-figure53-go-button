var rgb = require('../../image').rgb;

module.exports = {

	setVariables: function() {

		var variables = [
			{
				label: 'Version of Go Button connected',
				name:  'q_ver'
			},
			{
				label: 'Show Name',
				name:  's_name'
			},
			{
				label: 'Playhead Cue UniqueID',
				name:  'n_id'
			},
			{
				label: 'Playhead Cue Name',
				name:  'n_name'
			},
			{
				label: 'Playhead Cue Number',
				name:  'n_num'
			},
			{
				label: 'Playhead Notes',
				name:  'n_notes'
			},
			{
				label: 'Playhead Cue Status',
				name:  'n_stat'
			},
			{
				label: 'Playhead GoButton Text',
				name:  'n_text'
			},
			{
				label: 'Running Cue UniqueID',
				name:  'r_id'
			},
			{
				label: 'Running Cue Name',
				name:  'r_name'
			},
			{
				label: 'Running Cue Number',
				name:  'r_num'
			},
			{
				label: 'Running Cue Status',
				name:  'r_stat'
			},
			{
				label: 'Running Cue Time left, variable size',
				name:  'r_left'
			},
			{
				label: 'Running Cue Time left, HH:MM:SS',
				name:  'r_hhmmss'
			},
			{
				label: 'Running Cue Time left, Hour',
				name:  'r_hh'
			},
			{
				label: 'Running Cue Time left, Minute',
				name:  'r_mm'
			},
			{
				label: 'Running Cue Time left, Second',
				name:  'r_ss'
			}
		];
		return(variables);
	}
};
