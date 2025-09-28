import { getSelectionByKey } from '../../client/shared/appState/selectors/getSelectionByKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { Selection } from '../../client/shared/models/models.selections';

const SELECTION_KEY = 'selectionA';

const createSelection = (key: string): Selection => ({
	key,
	distinctColours: [],
	distinctItems: false,
	featureKeyColourIndexPairs: {},
	featureKeys: [],
});

const createFakeState = (selections: Selection[]): AppSharedState => ({
	appNode: {
		key: 'app',
		labels: ['application'],
		nameDisplay: 'app',
		nameInternal: 'app',
		description: '',
		lastUpdatedAt: 0,
	},
	layers: [],
	places: [],
	renderingLayers: [],
	mapSets: [],
	maps: [],
	styles: [],
	periods: [],
	selections: [...selections],
});

describe('Shared state selector: getSelectionByKey', () => {
	it('returns selection matching the key', () => {
		// Arrange - state with matching selection present
		const match = createSelection(SELECTION_KEY);
		const fakeState = createFakeState([match]);

		// Act - lookup selection
		const result = getSelectionByKey(fakeState, SELECTION_KEY);

		// Assert - selection returned
		expect(result).toEqual(match);
	});

	it('ignores null entries and finds selection', () => {
		const match = createSelection(SELECTION_KEY);
		const fakeState = createFakeState([null as unknown as Selection, match]);
		const result = getSelectionByKey(fakeState, SELECTION_KEY);
		expect(result).toEqual(match);
	});

	it('returns undefined when key is unknown', () => {
		const fakeState = createFakeState([createSelection(SELECTION_KEY)]);
		const result = getSelectionByKey(fakeState, 'missing-selection');
		expect(result).toBeUndefined();
	});
});
