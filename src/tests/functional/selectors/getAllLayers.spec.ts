import { getAllLayers } from '../../../client/shared/appState/selectors/getAllLayers';
import { AppSharedState } from '../../../client/shared/appState/state.models';
import { buildAppState } from '../../tools/reducer.helpers';

/**
 * Helper to create a minimal layer entry.
 */
const createLayer = (key: string): AppSharedState['layers'][number] => ({
	labels: ['layer'],
	key,
	nameDisplay: key,
	nameInternal: key,
	description: null,
	lastUpdatedAt: 0,
});

/**
 * Produces an app state with the desired layers slice.
 */
const createState = (layers = [createLayer('layer-1'), createLayer('layer-2')]): AppSharedState => ({
	...buildAppState(),
	layers,
});

describe('Shared state selector: getAllLayers', () => {
	it('returns all layers from state', () => {
		// Step 1: Prepare state containing a couple of layers.
		const fakeState = createState();

		// Step 2: Retrieve all layers from the selector.
		const result = getAllLayers(fakeState);

		// Step 3: Expect the selector to return the layers slice reference.
		expect(result).toBe(fakeState.layers);
	});

	it('returns empty array when layers are missing', () => {
		// Step 1: Seed state with an empty layers array.
		const fakeState = createState([]);

		// Step 2: Invoke the selector against the empty slice.
		const result = getAllLayers(fakeState);

		// Step 3: Validate the call returns an empty array.
		expect(result).toEqual([]);
	});
});
