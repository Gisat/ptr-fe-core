import { Dispatch } from 'react';
import { PickingInfo } from '@deck.gl/core';
import { RenderingLayer } from '../../shared/models/models.layers';
import { getMapLayerSelection } from '../../shared/appState/selectors/getMapLayerSelection';
import {
	ActionMapLayerAddFeatureKey,
	ActionMapLayerRemoveFeatureKey,
	ActionMapLayerSetFeatureKey,
	OneOfStateActions,
} from '../../shared/appState/state.models.actions';
import { AppSharedState } from '../../shared/appState/state.models';
import { getFeatureId } from '../../shared/helpers/getFeatureId';
import { StateActionType } from '../../shared/appState/enum.state.actionType';
import { parseDatasourceConfiguration } from '../../shared/models/parsers.datasources';

/**
 * Handles map click events for feature selection logic.
 *
 * Logic:
 * - If Ctrl is held and the feature is already selected: remove it from selection.
 * - If Ctrl is held and the feature is not selected: add it to selection (if maxSelectionCount not reached).
 * - If only one feature is selected and it's clicked again: remove it from selection.
 * - Otherwise: set the clicked feature as the only selected feature.
 *
 * @param {Object} params - The parameters for the click handler.
 * @param {PickingInfo} params.event - The DeckGL picking event.
 * @param {AppSharedState} params.sharedState - The current shared application state.
 * @param {Dispatch<OneOfStateActions>} params.sharedStateDispatch - The dispatch function for state actions.
 * @param {string} params.mapKey - The key of the map instance.
 * @param {boolean} params.controlIsDown - Whether the Ctrl key is pressed.
 * @param {RenderingLayer[] | undefined} params.mapLayers - The array of map layers.
 */
export function handleMapClick({
	event,
	sharedState,
	sharedStateDispatch,
	mapKey,
	controlIsDown,
	mapLayers,
}: {
	event: PickingInfo;
	sharedState: AppSharedState;
	sharedStateDispatch: Dispatch<OneOfStateActions>;
	mapKey: string;
	controlIsDown: boolean;
	mapLayers: RenderingLayer[] | undefined;
}) {
	// Get the picked feature and layer ID from the event
	const pickedFeature = event?.object;
	const layerId = event?.layer?.id;

	// If the user clicks on the map but does not click on a valid feature (there is no PICKABLE feature), exit early
	if (!pickedFeature) return;

	// Find the mapLayer object that was clicked, to access its configuration
	const mapLayer = Array.isArray(mapLayers)
		? mapLayers.find((layer: RenderingLayer) => layer.key === layerId)
		: undefined;

	// Get the configuration from the clicked mapLayer's datasource
	let config = parseDatasourceConfiguration(mapLayer?.datasource?.configuration);

	// Get the unique feature identifier for selection logic
	const featureId = getFeatureId(
		event?.object,
		typeof config === 'object' && config !== null ? config.geojsonOptions?.featureIdProperty : undefined
	);

	// Warn if featureId or layerId is missing
	if (!featureId || !layerId) {
		console.warn('[handleMapClick] Missing featureId or layerId in picking event.', { featureId, layerId, event });
		return;
	}

	// Safely extract the custom selection style from the configuration object, if available
	const customSelectionStyle =
		typeof config === 'object' && config !== null ? config.geojsonOptions?.selectionStyle : undefined;

	// Get the current selection state for this layer
	const layerSelection = getMapLayerSelection(sharedState, mapKey, layerId);
	const layerFeatureKeys = layerSelection?.featureKeys ?? [];
	const isSelected = layerFeatureKeys.includes(featureId);
	const maxSelectionCount = customSelectionStyle?.maxSelectionCount;

	// Handle selection logic based on Ctrl key and current selection state
	if (controlIsDown) {
		if (isSelected) {
			// Ctrl + click on selected feature: remove from selection
			sharedStateDispatch({
				type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY,
				payload: { mapKey, layerKey: layerId, featureKey: featureId },
			} as ActionMapLayerRemoveFeatureKey);
		} else if (!maxSelectionCount || layerFeatureKeys.length < maxSelectionCount) {
			// Ctrl + click on unselected feature: add to selection (if maxSelectionCount not reached)
			sharedStateDispatch({
				type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY,
				payload: { mapKey, layerKey: layerId, featureKey: featureId, customSelectionStyle },
			} as ActionMapLayerAddFeatureKey);
		}
	} else {
		if (isSelected && layerFeatureKeys.length === 1) {
			// Click on the only selected feature: remove it (deselect all)
			sharedStateDispatch({
				type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY,
				payload: { mapKey, layerKey: layerId, featureKey: featureId },
			} as ActionMapLayerRemoveFeatureKey);
		} else {
			// Click: set this feature as the only selected feature
			sharedStateDispatch({
				type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
				payload: { mapKey, layerKey: layerId, featureKey: featureId, customSelectionStyle },
			} as ActionMapLayerSetFeatureKey);
		}
	}
}
