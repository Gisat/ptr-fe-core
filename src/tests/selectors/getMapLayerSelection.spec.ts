import { getMapLayerSelection } from '../../client/shared/appState/selectors/getMapLayerSelection';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { Selection } from '../../client/shared/models/models.selections';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const MAP_KEY = fullAppSharedStateMock.maps[0].key; // "mapA"
const LAYER_KEY = fullAppSharedStateMock.maps[0].renderingLayers[0].key;
const SELECTION_KEY = 'selectionA';

const createSelection = (key: string): Selection => ({
	key,
	distinctColours: [],
	distinctItems: false,
	featureKeyColourIndexPairs: {},
	featureKeys: [],
});

const createFakeState = (selectionKey?: string, overrideSelections?: Selection[]): AppSharedState => {
	const maps = fullAppSharedStateMock.maps.map((map) => ({
		...map,
		renderingLayers: map.renderingLayers.map((layer) => ({ ...layer })),
	}));

	if (selectionKey) {
		maps[0].renderingLayers[0] = {
			...maps[0].renderingLayers[0],
			selectionKey,
		};
	}

	const selections: Selection[] = (() => {
		if (overrideSelections !== undefined) {
			return Array.isArray(overrideSelections)
				? overrideSelections.map((selection) => ({ ...selection }))
				: (overrideSelections as unknown as Selection[]);
		}

		if (!selectionKey) return [];

		return [createSelection(selectionKey)];
	})();

	return {
		...fullAppSharedStateMock,
		maps,
		selections,
	};
};

describe('Shared state selector: getMapLayerSelection', () => {
	it('returns selection when layer references selection key', () => {
		const fakeState = createFakeState(SELECTION_KEY);
		const result = getMapLayerSelection(fakeState, MAP_KEY, LAYER_KEY as string);
		expect(result?.key).toBe(SELECTION_KEY);
	});

	it('returns undefined when layer has no selection key', () => {
		const fakeState = createFakeState();
		const result = getMapLayerSelection(fakeState, MAP_KEY, LAYER_KEY as string);
		expect(result).toBeUndefined();
	});

	it('returns undefined when selections are not an array', () => {
		const fakeState = createFakeState(SELECTION_KEY, null as unknown as Selection[]);
		const result = getMapLayerSelection(fakeState, MAP_KEY, LAYER_KEY as string);
		expect(result).toBeUndefined();
	});
});
