import { getMapLayerSelection } from '../../client/shared/appState/selectors/getMapLayerSelection';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { Selection } from '../../client/shared/models/models.selections';

const MAP_KEY = 'mapA';
const LAYER_KEY = 'layerA';
const SELECTION_KEY = 'selectionA';

const createFakeState = (selectionKey?: string, selections?: Selection[] | null): AppSharedState => {
	const defaultSelection: Selection = {
		key: selectionKey ?? SELECTION_KEY,
		distinctColours: [],
		distinctItems: false,
		featureKeyColourIndexPairs: {},
		featureKeys: [],
	};

	return {
		maps: [
			{
				key: MAP_KEY,
				view: { zoom: 0, latitude: 0, longitude: 0 },
				renderingLayers: [
					{
						key: LAYER_KEY,
						isActive: true,
						...(selectionKey ? { selectionKey } : {}),
					},
				],
			},
		],
		selections:
			selections !== undefined ? (selections as unknown as Selection[]) : selectionKey ? [defaultSelection] : [],
	} as unknown as AppSharedState;
};

describe('Shared state selector: getMapLayerSelection', () => {
	it('returns selection when layer references selection key', () => {
		// Arrange
		const fakeState = createFakeState(SELECTION_KEY);

		// Act
		const result = getMapLayerSelection(fakeState, MAP_KEY, LAYER_KEY);

		// Assert
		expect(result?.key).toBe(SELECTION_KEY);
	});

	it('returns undefined when layer has no selection key', () => {
		// Arrange
		const fakeState = createFakeState();

		// Act
		const result = getMapLayerSelection(fakeState, MAP_KEY, LAYER_KEY);

		// Assert
		expect(result).toBeUndefined();
	});

	it('returns undefined when selections are not an array', () => {
		// Arrange
		const fakeState = createFakeState(SELECTION_KEY, null);

		// Act
		const result = getMapLayerSelection(fakeState, MAP_KEY, LAYER_KEY);

		// Assert
		expect(result).toBeUndefined();
	});
});
