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
	// Extract the feature and layer IDs from the picking event
	const featureId = event?.object?.properties?.id;
	const layerId = event?.layer?.id;

	if (!featureId || !layerId) return;

	// Find the mapLayer object that was clicked, to access its configuration
	const mapLayer = Array.isArray(mapLayers) ? mapLayers.find((layer: any) => layer.key === layerId) : undefined;

	// Get the configuration from the clicked mapLayer's datasource
	let config = mapLayer?.datasource?.configuration;

	// If the configuration is a string (likely JSON), parse it into an object
	if (typeof config === 'string') {
		try {
			config = JSON.parse(config);
		} catch {
			// If parsing fails, set config to undefined to avoid runtime errors
			config = undefined;
		}
	}

	// Safely extract the custom selection style from the configuration object, if available
	const customSelectionStyle =
		typeof config === 'object' && config !== null ? config.geojsonOptions?.selectionStyle : undefined;

	// Get the current selection state for this layer
	const layerSelection = getMapLayerSelection(sharedState, mapKey, layerId);
	const layerFeatureKeys = layerSelection?.featureKeys ?? [];
	const isSelected = layerFeatureKeys.includes(featureId);
	const maxSelectionCount = customSelectionStyle?.maxSelectionCount;

	if (controlIsDown) {
		if (isSelected) {
			// Ctrl + click on selected feature: remove from selection
			sharedStateDispatch({
				type: 'mapLayerRemoveFeatureKey',
				payload: { mapKey, layerKey: layerId, featureKey: featureId },
			} as ActionMapLayerRemoveFeatureKey);
		} else if (!maxSelectionCount || layerFeatureKeys.length < maxSelectionCount) {
			// Ctrl + click on unselected feature: add to selection (if maxSelectionCount not reached)
			sharedStateDispatch({
				type: 'mapLayerAddFeatureKey',
				payload: { mapKey, layerKey: layerId, featureKey: featureId, customSelectionStyle },
			} as ActionMapLayerAddFeatureKey);
		}
	} else {
		if (isSelected && layerFeatureKeys.length === 1) {
			// Click on the only selected feature: remove it (deselect all)
			sharedStateDispatch({
				type: 'mapLayerRemoveFeatureKey',
				payload: { mapKey, layerKey: layerId, featureKey: featureId },
			} as ActionMapLayerRemoveFeatureKey);
		} else {
			// Click: set this feature as the only selected feature
			sharedStateDispatch({
				type: 'mapLayerSetFeatureKey',
				payload: { mapKey, layerKey: layerId, featureKey: featureId, customSelectionStyle },
			} as ActionMapLayerSetFeatureKey);
		}
	}
}
