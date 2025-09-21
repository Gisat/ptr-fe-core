import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerActiveLayerChange } from '../../client/shared/appState/reducerHandlers/activeLayerChange';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionLayerActiveChange } from '../../client/shared/appState/state.models.actions';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const testRenderingLayers: RenderingLayer[] = [
	{
		key: 'vegetation-index',
		isActive: true,
		level: 0,
		datasource: {
			key: 'vegetation-index',
			labels: ['datasource'],
			nameDisplay: 'Vegetation Index',
			nameInternal: 'Vegetation Index',
			description: 'NDVI overview',
			lastUpdatedAt: 0,
			url: 'https://example.com/vegetation-index',
			configuration: '{}',
		},
		interaction: null,
	},
	{
		key: 'urban-footprint',
		isActive: false,
		level: 0,
		datasource: {
			key: 'urban-footprint',
			labels: ['datasource'],
			nameDisplay: 'Urban Footprint',
			nameInternal: 'Urban Footprint',
			description: 'Built-up areas',
			lastUpdatedAt: 0,
			url: 'https://example.com/urban-footprint',
			configuration: '{}',
		},
		interaction: null,
	},
];

const cloneRenderingLayer = (layer: RenderingLayer): RenderingLayer => ({
	...layer,
	datasource: { ...layer.datasource },
});

const createState = (): AppSharedState => ({
	...fullAppSharedStateMock,
	renderingLayers: testRenderingLayers.map(cloneRenderingLayer),
});

const createAction = (key: string, newValue: boolean): ActionLayerActiveChange => ({
	type: StateActionType.LAYER_ACTIVE_CHANGE,
	payload: { key, newValue },
});

const getLayer = (state: AppSharedState, key: string) => state.renderingLayers.find((layer) => layer.key === key);

describe('Shared state reducer: activeLayerChange', () => {
	it('activates the requested rendering layer', () => {
		// Before
		const fakeState = createState();
		expect(getLayer(fakeState, 'urban-footprint')?.isActive).toBe(false);

		// After
		const result = reduceHandlerActiveLayerChange(fakeState, createAction('urban-footprint', true));
		expect(getLayer(result, 'urban-footprint')?.isActive).toBe(true);
	});

	it('deactivates the requested rendering layer', () => {
		// Before
		const fakeState = createState();
		expect(getLayer(fakeState, 'vegetation-index')?.isActive).toBe(true);

		// After
		const result = reduceHandlerActiveLayerChange(fakeState, createAction('vegetation-index', false));
		expect(getLayer(result, 'vegetation-index')?.isActive).toBe(false);
	});
});
