import { AppSharedState } from '../../appState/state.models';
import { PlaceWithNeighbours } from '../../models/models.metadata';

/**
 * Retrieves a list of places associated with a given layer key.
 *
 * @param {AppSharedState} state - The application state containing places and rendering layers.
 * @param {string | null} layerKey - The key of the layer for which places are to be retrieved.
 * @returns {PlaceWithNeighbours[]} - An array of places associated with the given layer key. Returns an empty array if no places are found or if the layer key is null.
 */
export const getPlacesForLayerKey = (state: AppSharedState, layerKey: string | null): PlaceWithNeighbours[] => {
	// Retrieve all places from the application state
	const allPlaces = state?.places;

	// Check if a valid layer key is provided and if there are any places in the state
	if (layerKey && allPlaces?.length) {
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

			// Return places whose keys are included in the neighbouring keys
			return allPlaces.filter((place) => neighbouringKeys.includes(place.key));
		} else {
			// Return an empty array if no matching rendering layers are found
			return [];
		}
	} else {
		// Return an empty array if the layer key is null or there are no places
		return [];
	}
};
