import { AppSharedState } from '../state.models';

/**
 * Returns the activeFeatureKey of the specified layer in the specified map.
 * @param state - The shared application state.
 * @param mapKey - The key of the map.
 * @param layerKey - The key of the layer.
 * @returns {string | undefined} The activeFeatureKey or undefined if not found.
 */
export const getMapLayerActiveFeatureKey = (
	state: AppSharedState,
	mapKey: string,
	layerKey: string
): string | undefined => {
	const map = state?.maps?.find((m) => m.key === mapKey);
	const layer = map?.renderingLayers?.find((l) => l.key === layerKey);
	return layer?.activeFeatureKey;
};
