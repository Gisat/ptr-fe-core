import { getMapLayerSelection } from '../../../client/shared/appState/selectors/getMapLayerSelection';
import { AppSharedState } from '../../../client/shared/appState/state.models';
import { Selection } from '../../../client/shared/models/models.selections';
import { buildAppState, buildMapModel } from '../../tools/reducer.helpers';

/**
 * Map key reused across tests.
 */
const MAP_KEY = 'map-1';
/**
 * Rendering-layer key used in fixtures.
 */
const LAYER_KEY = 'layer-1';
/**
 * Default selection key applied to the target layer.
 */
const SELECTION_KEY = 'selection-1';

/**
 * Creates a minimal selection object.
 */
const createSelection = (key: string): Selection => ({
	key,
	distinctColours: [],
	distinctItems: false,
	featureKeyColourIndexPairs: {},
	featureKeys: [],
});

type CreateStateInput = {
	layerKey?: string;
	mapKey?: string;
	selectionKey?: string | null;
	selectionsOverride?: Selection[] | null;
};

/**
 * Builds an app state containing a single map and an optional selection slice.
 */
const createState = ({
	layerKey = LAYER_KEY,
	mapKey = MAP_KEY,
	selectionKey,
	selectionsOverride,
}: CreateStateInput = {}): AppSharedState => {
	const resolvedSelectionKey =
		selectionKey === undefined ? SELECTION_KEY : selectionKey === null ? undefined : selectionKey;

	const map = buildMapModel(mapKey, {
		layers: [
			{
				key: layerKey,
				...(resolvedSelectionKey ? { selectionKey: resolvedSelectionKey } : {}),
			},
		],
	});

	let selections: Selection[] = [];

	if (selectionsOverride !== undefined) {
		selections = selectionsOverride ?? [];
	} else if (resolvedSelectionKey) {
		selections = [createSelection(resolvedSelectionKey)];
	}

	const baseState = buildAppState({ maps: [map], selections });

	return {
		...baseState,
		maps: baseState.maps,
		selections: selectionsOverride === null ? (null as unknown as AppSharedState['selections']) : baseState.selections,
	};
};

describe('Shared state selector: getMapLayerSelection', () => {
	it('returns selection when layer references a selection key', () => {
		// Step 1: Prepare state where the target layer holds a selection key and the selection exists.
		const fakeState = createState();

		// Step 2: Resolve the selection for the known map/layer combination.
		const result = getMapLayerSelection(fakeState, MAP_KEY, LAYER_KEY);

		// Step 3: Expect the selector to return the matching selection.
		expect(result?.key).toBe(SELECTION_KEY);
	});

	it('returns undefined when layer has no selection key', () => {
		// Step 1: Seed state with a layer that omits the selection key.
		const fakeState = createState({ selectionKey: null });

		// Step 2: Query for the selection on the layer lacking a key.
		const result = getMapLayerSelection(fakeState, MAP_KEY, LAYER_KEY);

		// Step 3: Confirm the selector returns undefined in this scenario.
		expect(result).toBeUndefined();
	});

	it('returns undefined when selections slice is not an array', () => {
		// Step 1: Force the selections slice to be null to mimic malformed state.
		const fakeState = createState({ selectionsOverride: null });

		// Step 2: Attempt to fetch the layer selection.
		const result = getMapLayerSelection(fakeState, MAP_KEY, LAYER_KEY);

		// Step 3: Validate the selector handles non-array selections defensively.
		expect(result).toBeUndefined();
	});
});
