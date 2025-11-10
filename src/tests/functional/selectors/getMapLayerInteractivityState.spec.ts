import { getMapLayerInteractivityState } from '../../../client/shared/appState/selectors/getMapLayerInteractivityState';
import { AppSharedState } from '../../../client/shared/appState/state.models';
import { RenderingLayer } from '../../../client/shared/models/models.layers';
import { buildAppState, buildMapModel } from '../../tools/reducer.helpers';

/**
 * Map key reused across selector assertions.
 */
const MAP_KEY = 'map-1';
/**
 * Rendering-layer key exercised by the tests.
 */
const LAYER_KEY = 'layer-1';

type CreateStateInput = {
	isInteractive?: RenderingLayer['isInteractive'];
	mapKey?: string;
	layerKey?: string;
};

/**
 * Constructs a shared-state snapshot containing a single map with a single rendering layer.
 */
const createState = ({
	isInteractive,
	mapKey = MAP_KEY,
	layerKey = LAYER_KEY,
}: CreateStateInput = {}): AppSharedState => {
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
		// Step 1: Build state where the map-layer pair has interactivity enabled.
		const fakeState = createState({ isInteractive: true });

		// Step 2: Retrieve the interactivity state for the known map/layer combination.
		const result = getMapLayerInteractivityState(fakeState, MAP_KEY, LAYER_KEY);

		// Step 3: Expect the selector to return the interactivity flag.
		expect(result).toBe(true);
	});

	it('returns undefined when map is missing', () => {
		// Step 1: Use default state but query a non-existent map key.
		const fakeState = createState();

		// Step 2: Ask for interactivity on a map that is not present.
		const result = getMapLayerInteractivityState(fakeState, 'missing-map', LAYER_KEY);

		// Step 3: Validate the selector returns undefined when map is absent.
		expect(result).toBeUndefined();
	});

	it('returns undefined when layer is missing', () => {
		// Step 1: Start from the default state to keep the map present.
		const fakeState = createState();

		// Step 2: Query for a layer key that does not exist on the map.
		const result = getMapLayerInteractivityState(fakeState, MAP_KEY, 'missing-layer');

		// Step 3: Confirm the selector yields undefined when the layer is missing.
		expect(result).toBeUndefined();
	});
});
