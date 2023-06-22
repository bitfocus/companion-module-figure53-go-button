import { CreateConvertToBooleanFeedbackUpgradeScript } from '@companion-module/base'

export const UpgradeScripts = [
	function (context, props) {
		const result = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}


		if (props.config) {
			if (props.config.useTenths == undefined) {
				props.config.useTenths = false

				result.updatedConfig = props.config
			}
		}

		return result
	},
	CreateConvertToBooleanFeedbackUpgradeScript({
		fs_bg: true,
		mf_bg: true,
		dim_bg: true,
		mute_bg: true,
	}),

]
