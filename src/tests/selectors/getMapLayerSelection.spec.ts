import { getMapLayerSelection } from '../../client/shared/appState/selectors/getMapLayerSelection';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { Selection } from '../../client/shared/models/models.selections';
import { buildAppState, buildMapModel } from '../tools/reducer.helpers';

const MAP_KEY = 'map-1';
const LAYER_KEY = 'layer-1';
const SELECTION_KEY = 'selection-1';

/**
 * Creates a minimal selection fixture for selector testing.
 */
const createSelection = (key: string): Selection => ({
	key,
	distinctColours: [],
	distinctItems: false,
	featureKeyColourIndexPairs: {},
	featureKeys: [],
});

type CreateFakeStateInput = {
	layerKey?: string;
	mapKey?: string;
	selectionKey?: string | null;
	selections?: Selection[] | null;
};

/**
 * Builds a cloned shared-state instance with configurable map and selection fixtures.
 */
const createFakeState = ({
	layerKey = LAYER_KEY,
	mapKey = MAP_KEY,
	selectionKey,
	selections,
}: CreateFakeStateInput = {}): AppSharedState => {
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

	const resolvedSelections =
		selections === undefined
			? resolvedSelectionKey
				? [createSelection(resolvedSelectionKey)]
				: []
			: (selections ?? []);

	const baseState = buildAppState({
		maps: [map],
		selections: selections === null ? [] : resolvedSelections,
	});

	return {
		...baseState,
		maps: baseState.maps,
		selections: selections === null ? (null as unknown as AppSharedState['selections']) : baseState.selections,
	};
};

describe('Shared state selector: getMapLayerSelection', () => {
	it('returns selection when layer references a selection key', () => {
		const fakeState = createFakeState();

		const result = getMapLayerSelection(fakeState, MAP_KEY, LAYER_KEY);

		expect(result?.key).toBe(SELECTION_KEY);
	});

	it('returns undefined when layer has no selection key', () => {
		const fakeState = createFakeState({ selectionKey: null });

		const result = getMapLayerSelection(fakeState, MAP_KEY, LAYER_KEY);

		expect(result).toBeUndefined();
	});

	it('returns undefined when selections slice is not an array', () => {
		const fakeState = createFakeState({ selections: null });

		const result = getMapLayerSelection(fakeState, MAP_KEY, LAYER_KEY);

		expect(result).toBeUndefined();
	});
});
