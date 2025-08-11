import { v4 as uuidv4 } from 'uuid';
import { SELECTION_DEFAULT_DISTINCT_COLOURS } from '../../constants/colors';
import { RenderingLayer } from '../../models/models.layers';
import { Selection } from '../../models/models.selections';

/**
 * Updates rendering layers and returns the new selectionKey.
 *
 * Iterates through the renderingLayers array and finds the layer with the given key.
 * - If the layer does not have a selectionKey, generates a new one and assigns it.
 * - If the layer already has a selectionKey, keeps it unchanged.
 * Returns the updated layers and the selectionKey for further selection logic.
 *
 * @param {Partial<RenderingLayer>[]} renderingLayers - Array of rendering layers.
 * @param {string} layerKey - The key of the layer to update.
 * @returns {{ changedLayers: Partial<RenderingLayer>[], selectionKey: string }} The updated layers and the selection key.
 * @throws {Error} If no selectionKey is found or generated for the layer.
 */
export function updateRenderingLayers(
	renderingLayers: Partial<RenderingLayer>[],
	layerKey: string
): { changedLayers: Partial<RenderingLayer>[]; selectionKey: string } {
	let selectionKey: string | undefined = undefined;
	const changedLayers: Partial<RenderingLayer>[] = [];
	for (const layer of renderingLayers) {
		if (layer.key === layerKey) {
			// Assign a new selectionKey if missing, otherwise keep the existing one
			if (!layer.selectionKey) {
				selectionKey = uuidv4();
				changedLayers.push({ ...layer, selectionKey });
			} else {
				selectionKey = layer.selectionKey;
				changedLayers.push({ ...layer });
			}
		} else {
			// Keep other layers unchanged
			changedLayers.push(layer);
		}
	}
	// Throw if no selectionKey was found or generated (should not happen in normal use)
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
	// Create a shallow copy of selections for safe mutation
	const updatedSelections = [...selections];
	for (let i = 0; i < updatedSelections.length; i++) {
		if (updatedSelections[i] && updatedSelections[i].key === selectionKey) {
			found = true;
			let nextColorIndex = 0;
			// Only calculate nextColorIndex if not overwriting and using distinct items
			if (!overwrite && updatedSelections[i].distinctItems) {
				// Find the lowest unused color index for the new featureKey
				const usedColorIndexes = Object.values(updatedSelections[i].featureKeyColourIndexPairs ?? {});
				while (usedColorIndexes.includes(nextColorIndex)) {
					nextColorIndex++;
				}
			}
			updatedSelections[i] = {
				...updatedSelections[i],
				// Update selection style if provided, otherwise keep existing
				distinctColours: customSelectionStyle?.distinctColours ?? updatedSelections[i].distinctColours,
				distinctItems: customSelectionStyle?.distinctItems ?? updatedSelections[i].distinctItems,
				// Overwrite featureKeys if requested, otherwise add new featureKey
				featureKeys: overwrite ? [featureKey] : [...updatedSelections[i].featureKeys, featureKey],
				// Assign color index: 0 if overwrite, otherwise lowest unused index
				featureKeyColourIndexPairs: overwrite
					? { [featureKey]: 0 }
					: {
							...updatedSelections[i].featureKeyColourIndexPairs,
							[featureKey]: updatedSelections[i].distinctItems ? nextColorIndex : 0,
						},
			};
			break;
		}
	}
	// If no selection object exists for this key, create a new one
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
