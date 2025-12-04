import { UsedNodeLabels } from '@gisatcz/ptr-be-core/browser';
import { AppSharedState } from './state.models';

/**
 * Creates default version of the shared app state before data input from backend
 * @returns
 */
export const defaultStateValue = () => {
	const defaultState: AppSharedState = {
		appNode: {
			key: 'default',
			description: null,
			lastUpdatedAt: Date.now(),
			nameDisplay: 'Default App Node',
			nameInternal: 'defaultAppNode',
			configuration: JSON.stringify({}),
			labels: [UsedNodeLabels.Application],
		},
		renderingLayers: [],
		layers: [],
		places: [],
		mapSets: [],
		maps: [],
		styles: [],
		periods: [],
		selections: [],
	};

	return defaultState;
};
