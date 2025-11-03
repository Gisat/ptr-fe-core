import { getSelectionByKey } from '../../client/shared/appState/selectors/getSelectionByKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { Selection } from '../../client/shared/models/models.selections';
import { buildAppState } from '../tools/reducer.helpers';

const SELECTION_KEY = 'selection-1';

const createSelection = (overrides: Partial<Selection> = {}): Selection => ({
	key: SELECTION_KEY,
	distinctColours: [],
	distinctItems: false,
	featureKeyColourIndexPairs: {},
	featureKeys: [],
	...overrides,
});

const createState = (selections = [createSelection()]): AppSharedState => buildAppState({ selections });

describe('Shared state selector: getSelectionByKey', () => {
	it('returns selection matching the key', () => {
		// Step 1: Prepare a state containing the target selection.
		const match = createSelection();
		const fakeState = createState([match]);

		// Step 2: Invoke selector with the matching key.
		const result = getSelectionByKey(fakeState, SELECTION_KEY);

		// Step 3: Expect the selection to be returned.
		expect(result).toEqual(match);
	});

	it('ignores null entries and finds selection', () => {
		// Step 1: Build state containing the target selection.
		const fakeState = createState();
		const [selection] = fakeState.selections;

		// Step 2: Inject a null entry ahead of the valid selection.
		fakeState.selections = [null as unknown as Selection, selection];

		// Step 3: Call the selector with the known key.
		const result = getSelectionByKey(fakeState, SELECTION_KEY);

		// Step 4: Confirm the null entry is skipped and the selection returned.
		expect(result).toEqual(selection);
	});

	it('returns undefined when key is unknown', () => {
		// Step 1: Create state containing a selection with the default key.
		const fakeState = createState();

		// Step 2: Query the selector with an unknown key.
		const result = getSelectionByKey(fakeState, 'missing-selection');

		// Step 3: Validate the selector returns undefined.
		expect(result).toBeUndefined();
	});
});
