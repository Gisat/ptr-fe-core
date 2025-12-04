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
 * Parameters for handleMapClick function.
 */
export interface HandleMapClickParams {
	event: PickingInfo;
	sharedState: AppSharedState;
	sharedStateDispatch: Dispatch<OneOfStateActions>;
	mapKey: string;
	controlIsDown: boolean;
	mapLayers: RenderingLayer[] | undefined;
}

/**
 * Handles map click events for feature selection logic.
 *
 * Logic:
 * - If Ctrl is held and the feature is already selected: remove it from selection.
 * - If Ctrl is held and the feature is not selected: add it to selection (if maxSelectionCount not reached).
 * - If only one feature is selected and it's clicked again: remove it from selection.
 * - Otherwise: set the clicked feature as the only selected feature.
 *
 * Selection is only allowed if enabled in the layer configuration.
 *
 * @param {HandleMapClickParams} params - The parameters for the click handler.
 */
export function handleMapClick({
	event,
	sharedState,
	sharedStateDispatch,
	mapKey,
	controlIsDown,
	mapLayers,
}: HandleMapClickParams) {
	// Get the picked feature and layer ID from the event
	const pickedFeature = event?.object;
	const layerId = event?.layer?.id;

	// If the user clicks on the map but does not click on a valid feature, exit early
	if (!pickedFeature) return;

	// Find the mapLayer object that was clicked, to access its configuration
	const mapLayer = Array.isArray(mapLayers)
		? mapLayers.find((layer: RenderingLayer) => layer.key === layerId)
		: undefined;

	// Get the configuration from the clicked mapLayer's datasource
	const config = parseDatasourceConfiguration(mapLayer?.datasource?.configuration);

	// Get the unique feature identifier for selection logic
	const featureId = getFeatureId(pickedFeature, config.geojsonOptions?.featureIdProperty);

	// Warn if featureId or layerId is missing
	if (!featureId || !layerId) {
		console.warn('[handleMapClick] Missing featureId or layerId in picking event.', { featureId, layerId, event });
		return;
	}

	// Safely extract the custom selection style from the configuration object, if available
	const customSelectionStyle = config.geojsonOptions?.selectionStyle;

	// Check if selections are enabled for this layer
	const selectionsEnabled = !config?.geojsonOptions?.disableSelections;
	if (!selectionsEnabled) return;

	// Get the current selection state for this layer
	const layerSelection = getMapLayerSelection(sharedState, mapKey, layerId);
	const layerFeatureKeys = layerSelection?.featureKeys ?? [];
	const isSelected = layerFeatureKeys.includes(featureId);
	const maxSelectionCount = customSelectionStyle?.maxSelectionCount;
	const minSelectionCount = customSelectionStyle?.minSelectionCount ?? 0;

	// Handle selection logic based on Ctrl key and current selection state
	if (controlIsDown) {
		if (isSelected) {
			// Ctrl + click on selected feature: remove from selection, if above minSelectionCount
			if (layerFeatureKeys.length > minSelectionCount) {
				sharedStateDispatch({
					type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY,
					payload: { mapKey, layerKey: layerId, featureKey: featureId },
				} as ActionMapLayerRemoveFeatureKey);
			}
		} else if (!maxSelectionCount || layerFeatureKeys.length < maxSelectionCount) {
			// Ctrl + click on unselected feature: add to selection (if maxSelectionCount not reached)
			sharedStateDispatch({
				type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY,
				payload: { mapKey, layerKey: layerId, featureKey: featureId, customSelectionStyle },
			} as ActionMapLayerAddFeatureKey);
		}
	} else {
		if (isSelected && layerFeatureKeys.length === 1 && minSelectionCount !== 1) {
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
