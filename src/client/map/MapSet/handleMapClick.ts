import { RenderingLayer } from 'src/client/shared/models/models.layers';
import { getMapLayerSelection } from '../../shared/appState/selectors/getMapLayerSelection';
import {
	ActionMapLayerAddFeatureKey,
	ActionMapLayerRemoveFeatureKey,
	ActionMapLayerSetFeatureKey,
	OneOfStateActions,
} from '../../shared/appState/state.models.actions';
import { AppSharedState } from 'src/client/shared/appState/state.models';
import { Dispatch } from 'react';

/**
 * Handles map click events for feature selection logic.
 * - If Ctrl is held and the feature is already selected: remove it from selection.
 * - If Ctrl is held and the feature is not selected: add it to selection.
 * - If only one feature is selected and it's clicked again: remove it from selection.
 * - Otherwise: set the clicked feature as the only selected feature.
 */
export function handleMapClick({
	event,
	sharedState,
	sharedStateDispatch,
	mapKey,
	controlIsDown,
	mapLayers,
}: {
	event: any;
	sharedState: AppSharedState;
	sharedStateDispatch: Dispatch<OneOfStateActions>;
	mapKey: string;
	controlIsDown: boolean;
	mapLayers: RenderingLayer[] | undefined;
}) {
	const featureId = event?.object?.properties?.id;
	const layerId = event?.layer?.id;
	if (!featureId || !layerId) return;

	// Find the mapLayer that was clicked
	const mapLayer = Array.isArray(mapLayers) ? mapLayers.find((layer: any) => layer.key === layerId) : undefined;
	const customSelectionStyle = mapLayer?.datasource?.configuration?.geojsonOptions?.selectionStyle;

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
			// Ctrl + click on unselected feature: add to selection
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
