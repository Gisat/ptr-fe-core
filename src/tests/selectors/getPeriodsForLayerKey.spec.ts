import { getPeriodsForLayerKey } from '../../client/shared/appState/selectors/getPeriodsForLayerKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { buildAppState, buildRenderingLayer } from '../tools/reducer.helpers';

const LAYER_KEY = 'layer-key';
const PERIOD_KEY_2018 = 'period-2018';
const PERIOD_KEY_2019 = 'period-2019';

/**
 * Shared period fixtures that keep tests deterministic while remaining easy to read.
 */
const PERIODS_TEMPLATE: AppSharedState['periods'] = [
	{
		labels: ['period'],
		key: PERIOD_KEY_2018,
		nameDisplay: '2018',
		nameInternal: '2018',
		description: '',
		lastUpdatedAt: 0,
		validUtcIntervalIso: '2018',
		validFrom: 1514764800000,
		validTo: 1546300800000,
	},
	{
		labels: ['period'],
		key: PERIOD_KEY_2019,
		nameDisplay: '2019',
		nameInternal: '2019',
		description: '',
		lastUpdatedAt: 0,
		validUtcIntervalIso: '2019',
		validFrom: 1546300800000,
		validTo: 1577836800000,
	},
];

/**
 * Produces an app state mock tailored for the selector tests.
 *
 * @param renderingLayers Optional rendering layers to override the default neighbour wiring.
 * @returns State snapshot mirroring what the selector expects to receive.
 */
const createState = (
	renderingLayers = [
		buildRenderingLayer('rendering-layer', {
			datasource: { neighbours: [LAYER_KEY, PERIOD_KEY_2018, PERIOD_KEY_2019] },
		}),
	]
): AppSharedState => ({
	...buildAppState({ renderingLayers }),
	periods: PERIODS_TEMPLATE.map((period) => ({ ...period })),
});

describe('Shared state selector: getPeriodsForLayerKey', () => {
	it('returns periods linked by rendering layer neighbours', () => {
		// Step 1: Prepare state where the rendering layer references the target layer and both periods.
		const fakeState = createState();

		// Step 2: Invoke the selector with the matching layer key.
		const result = getPeriodsForLayerKey(fakeState, LAYER_KEY);

		// Step 3: Confirm both periods are returned in order.
		expect(result).toEqual(fakeState.periods);
	});

	it('returns empty array when layer key has no neighbours', () => {
		// Step 1: Reuse the default state where only LAYER_KEY has neighbouring periods.
		const fakeState = createState();

		// Step 2: Query the selector with a layer key that is not among the neighbours.
		const result = getPeriodsForLayerKey(fakeState, 'missing-layer');

		// Step 3: Ensure the selector falls back to an empty collection.
		expect(result).toEqual([]);
	});

	it('returns empty array when layer key is null', () => {
		// Step 1: Use the standard fixture to keep everything else constant.
		const fakeState = createState();

		// Step 2: Call the selector with a null key to mirror defensive callers.
		const result = getPeriodsForLayerKey(fakeState, null);

		// Step 3: Validate that null input produces an empty result set.
		expect(result).toEqual([]);
	});
});
