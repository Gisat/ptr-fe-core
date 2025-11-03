import { getMapLayerInteractivityState } from '../../client/shared/appState/selectors/getMapLayerInteractivityState';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { buildAppState, buildMapModel } from '../tools/reducer.helpers';

const MAP_KEY = 'map-1';
const LAYER_KEY = 'layer-1';

type CreateFakeStateInput = {
	isInteractive?: RenderingLayer['isInteractive'];
	mapKey?: string;
	layerKey?: string;
};

/**
 * Creates a shared-state clone with a single map and rendering layer tailored for interactivity tests.
 */
const createFakeState = ({
	isInteractive,
	mapKey = MAP_KEY,
	layerKey = LAYER_KEY,
}: CreateFakeStateInput = {}): AppSharedState => {
	const map = buildMapModel(mapKey, {
		layers: [
			{
				key: layerKey,
				isInteractive,
			},
		],
	});

	return {
		...buildAppState({ maps: [map] }),
		maps: [map],
	};
};

describe('Shared state selector: getMapLayerInteractivityState', () => {
	it('returns the interactivity flag when map and layer exist', () => {
		const fakeState = createFakeState({ isInteractive: true });

		const result = getMapLayerInteractivityState(fakeState, MAP_KEY, LAYER_KEY);

		expect(result).toBe(true);
	});

	it('returns undefined when map is missing', () => {
		const fakeState = createFakeState();

		const result = getMapLayerInteractivityState(fakeState, 'missing-map', LAYER_KEY);

		expect(result).toBeUndefined();
	});

	it('returns undefined when layer is missing', () => {
		const fakeState = createFakeState();

		const result = getMapLayerInteractivityState(fakeState, MAP_KEY, 'missing-layer');

		expect(result).toBeUndefined();
	});
});
