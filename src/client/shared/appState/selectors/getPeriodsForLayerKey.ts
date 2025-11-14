import { AppSharedState } from '../../appState/state.models';
import { PeriodWithNeighbours } from '../../models/models.metadata.js';

/**
 * Retrieves a list of periods associated with a given layer key.
 *
 * @param {AppSharedState} state - The application state containing periods and rendering layers.
 * @param {string | null} layerKey - The key of the layer for which periods are to be retrieved.
 * @returns {PeriodWithNeighbours[]} - An array of periods associated with the given layer key. Returns an empty array if no periods are found or if the layer key is null.
 */
export const getPeriodsForLayerKey = (state: AppSharedState, layerKey: string | null): PeriodWithNeighbours[] => {
	// Retrieve all periods from the application state
	const allPeriods = state?.periods;

	// Check if a valid layer key is provided and if there are any periods in the state
	if (layerKey && allPeriods?.length) {
		// Filter rendering layers to find those whose datasource neighbours include the given layer key
		const datasourcesByLayerKey = state.renderingLayers.filter((renderingLayer) =>
			renderingLayer.datasource.neighbours?.includes(layerKey)
		);

		// If matching rendering layers are found
		if (datasourcesByLayerKey.length) {
			// Collect all neighbouring keys from the matching rendering layers
			const neighbouringKeys = datasourcesByLayerKey
				.map((renderingLayer) => renderingLayer.datasource.neighbours)
				.flat();

			// Return periods whose keys are included in the neighbouring keys
			return allPeriods.filter((period) => neighbouringKeys.includes(period.key));
		} else {
			// Return an empty array if no matching rendering layers are found
			return [];
		}
	} else {
		// Return an empty array if the layer key is null or there are no periods
		return [];
	}
};
