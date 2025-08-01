import { v4 as uuidv4 } from 'uuid';
import { SELECTION_DEFAULT_DISTINCT_COLOURS } from '../constants/colors';
import { RenderingLayer } from '../models/models.layers';
import { Selection } from '../models/models.selections';

/**
 * Updates rendering layers and returns the new selectionKey.
 *
 * @param {Partial<RenderingLayer>[]} renderingLayers - Array of rendering layers.
 * @param {string} layerKey - The key of the layer to update.
 * @returns {{ changedLayers: Partial<RenderingLayer>[], selectionKey: string }} The updated layers and the selection key.
 */
export function updateRenderingLayers(
	renderingLayers: Partial<RenderingLayer>[],
	layerKey: string
): { changedLayers: Partial<RenderingLayer>[]; selectionKey: string } {
	let selectionKey: string | undefined = undefined;
	const changedLayers: Partial<RenderingLayer>[] = [];
	for (const layer of renderingLayers) {
		if (layer.key === layerKey) {
			if (!layer.selectionKey) {
				selectionKey = uuidv4();
				changedLayers.push({ ...layer, selectionKey });
			} else {
				selectionKey = layer.selectionKey;
				changedLayers.push({ ...layer });
			}
		} else {
			changedLayers.push(layer);
		}
	}
	if (!selectionKey) throw new Error('No selectionKey found or generated');
	return { changedLayers, selectionKey };
}

/**
 * Updates or creates a selection object in the selections array.
 * If overwrite is true, replaces featureKeys with a single featureKey.
 *
 * @param {Selection[]} selections - Array of selection objects.
 * @param {string} selectionKey - The key of the selection to update or create.
 * @param {string} featureKey - The feature key to add or set.
 * @param {Partial<Selection> | undefined} customSelectionStyle - Custom selection style object.
 * @param {boolean} [overwrite=false] - If true, overwrite featureKeys with a single featureKey.
 * @returns {Selection[]} The updated selections array.
 */
export function updateSelections(
	selections: Selection[],
	selectionKey: string,
	featureKey: string,
	customSelectionStyle: Partial<Selection> | undefined,
	overwrite: boolean = false
): Selection[] {
	let found = false;
	const updatedSelections = [...selections];
	for (let i = 0; i < updatedSelections.length; i++) {
		if (updatedSelections[i] && updatedSelections[i].key === selectionKey) {
			found = true;
			updatedSelections[i] = {
				...updatedSelections[i],
				distinctColours: customSelectionStyle?.distinctColours ?? updatedSelections[i].distinctColours,
				distinctItems: customSelectionStyle?.distinctItems ?? updatedSelections[i].distinctItems,
				featureKeys: overwrite ? [featureKey] : [...updatedSelections[i].featureKeys, featureKey],
				featureKeyColourIndexPairs: overwrite
					? { [featureKey]: 0 }
					: {
							...updatedSelections[i].featureKeyColourIndexPairs,
							[featureKey]: updatedSelections[i].distinctItems
								? Object.keys(updatedSelections[i].featureKeyColourIndexPairs).length
								: 0,
						},
			};
			break;
		}
	}
	if (!found) {
		updatedSelections.push({
			key: selectionKey,
			distinctColours: customSelectionStyle?.distinctColours ?? SELECTION_DEFAULT_DISTINCT_COLOURS,
			distinctItems: customSelectionStyle?.distinctItems ?? true,
			featureKeys: [featureKey],
			featureKeyColourIndexPairs: { [featureKey]: 0 },
		});
	}
	return updatedSelections;
}
