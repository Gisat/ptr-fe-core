import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetSyncChange } from '../../client/shared/appState/reducerHandlers/mapSetSyncChange';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapSetSyncChange } from '../../client/shared/appState/state.models.actions';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const mapSet = (key: string, sync: { zoom: boolean; center: boolean }): MapSetModel => ({
	key,
	maps: ['map-a'],
	sync: { ...sync },
	view: { latitude: 0, longitude: 0, zoom: 4 },
});

const createFakeState = (mapSets: MapSetModel[]): AppSharedState => ({
	...fullAppSharedStateMock,
	mapSets: mapSets.map((set) => ({ ...set, maps: [...set.maps], sync: { ...set.sync }, view: { ...set.view } })),
});

const action = (payload: ActionMapSetSyncChange['payload']): ActionMapSetSyncChange => ({
	type: StateActionType.MAP_SET_SYNC_CHANGE,
	payload,
});

describe('Shared state reducer: mapSetSyncChange', () => {
	it('merges sync changes into the targeted map set', () => {
		const fakeState = createFakeState([
			mapSet('set-a', { zoom: true, center: true }),
			mapSet('set-b', { zoom: false, center: false }),
		]);

		const result = reduceHandlerMapSetSyncChange(fakeState, action({ key: 'set-a', syncChange: { center: false } }));

		expect(result.mapSets.find((set) => set.key === 'set-a')?.sync).toEqual({ zoom: true, center: false });
		expect(result.mapSets.find((set) => set.key === 'set-b')?.sync).toEqual({ zoom: false, center: false });
	});
});
