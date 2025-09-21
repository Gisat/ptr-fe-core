import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetModeChange } from '../../client/shared/appState/reducerHandlers/mapSetModeChange';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapSetModeChange } from '../../client/shared/appState/state.models.actions';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const mapSet = (key: string, mode: 'slider' | 'grid' = 'grid'): MapSetModel => ({
	key,
	maps: ['map-a'],
	sync: { center: false, zoom: false },
	view: { latitude: 0, longitude: 0, zoom: 4 },
	mode,
});

const createFakeState = (mapSets: MapSetModel[]): AppSharedState => ({
	...fullAppSharedStateMock,
	mapSets: mapSets.map((set) => ({ ...set, maps: [...set.maps], sync: { ...set.sync }, view: { ...set.view } })),
});

const action = (payload: ActionMapSetModeChange['payload']): ActionMapSetModeChange => ({
	type: StateActionType.MAP_SET_MODE_CHANGE,
	payload,
});

describe('Shared state reducer: mapSetModeChange', () => {
	it('updates the mode for the targeted map set', () => {
		const fakeState = createFakeState([mapSet('set-a', 'grid'), mapSet('set-b', 'slider')]);

		const result = reduceHandlerMapSetModeChange(fakeState, action({ key: 'set-a', mode: 'slider' }));

		expect(result.mapSets.find((set) => set.key === 'set-a')?.mode).toBe('slider');
		expect(result.mapSets.find((set) => set.key === 'set-b')?.mode).toBe('slider');
	});

	it('returns other map sets unchanged', () => {
		const fakeState = createFakeState([mapSet('set-a', 'grid'), mapSet('set-b', 'slider')]);

		const result = reduceHandlerMapSetModeChange(fakeState, action({ key: 'set-b', mode: 'grid' }));

		expect(result.mapSets.find((set) => set.key === 'set-a')).toEqual(fakeState.mapSets[0]);
		expect(result.mapSets.find((set) => set.key === 'set-b')?.mode).toBe('grid');
	});
});
