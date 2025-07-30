import { getMapLayerSelection } from '../../shared/appState/selectors/getMapLayerSelection';
import {
	ActionMapLayerAddFeatureKey,
	ActionMapLayerRemoveFeatureKey,
	ActionMapLayerSetFeatureKey,
} from '../../shared/appState/state.models.actions';

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
}: {
	event: any;
	sharedState: any;
	sharedStateDispatch: (action: any) => void;
	mapKey: string;
	controlIsDown: boolean;
}) {
	const featureId = event?.object?.properties?.id;
	const layerId = event?.layer?.id;
	if (!featureId || !layerId) return;

	const layerSelection = getMapLayerSelection(sharedState, mapKey, layerId);
	const layerFeatureKeys = layerSelection?.featureKeys ?? [];
	const isSelected = layerFeatureKeys.includes(featureId);

	if (controlIsDown) {
		if (isSelected) {
			// Ctrl + click on selected feature: remove from selection
			sharedStateDispatch({
				type: 'mapLayerRemoveFeatureKey',
				payload: { mapKey, layerKey: layerId, featureKey: featureId },
			} as ActionMapLayerRemoveFeatureKey);
		} else {
			// Ctrl + click on unselected feature: add to selection
			sharedStateDispatch({
				type: 'mapLayerAddFeatureKey',
				payload: { mapKey, layerKey: layerId, featureKey: featureId },
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
				payload: { mapKey, layerKey: layerId, featureKey: featureId },
			} as ActionMapLayerSetFeatureKey);
		}
	}
}
