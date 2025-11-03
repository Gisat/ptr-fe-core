import { getAllLayers } from '../../client/shared/appState/selectors/getAllLayers';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { buildAppState } from '../tools/reducer.helpers';

const createLayer = (key: string): AppSharedState['layers'][number] => ({
	labels: ['layer'],
	key,
	nameDisplay: key,
	nameInternal: key,
	description: null,
	lastUpdatedAt: 0,
});

const createFakeState = (layers = [createLayer('layer-1'), createLayer('layer-2')]): AppSharedState => ({
	...buildAppState(),
	layers,
});

describe('Shared state selector: getAllLayers', () => {
	it('returns all layers from state', () => {
		const fakeState = createFakeState();

		const result = getAllLayers(fakeState);

		expect(result).toBe(fakeState.layers);
	});

	it('returns empty array when layers are missing', () => {
		const fakeState = createFakeState([]);

		const result = getAllLayers(fakeState);

		expect(result).toEqual([]);
	});
});
