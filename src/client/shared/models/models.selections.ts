/**
 * Represents a selection state for a map layer.
 *
 * @property {string} key - Unique identifier for the selection (usually matches the layer's selectionKey).
 * @property {string[]} distinctColours - Array of color hex strings used for distinguishing selected features.
 * @property {boolean} distinctItems - If true, each feature gets a distinct color from distinctColours.
 * @property {{ [key: string]: number }} featureKeyColourIndexPairs - Maps feature keys to their assigned color index.
 * @property {Array<string | number>} featureKeys - Array of selected feature keys.
 */
export interface Selection {
	key: string;
	distinctColours: string[];
	distinctItems: boolean;
	featureKeyColourIndexPairs: { [key: string]: number };
	featureKeys: Array<string | number>;
}
