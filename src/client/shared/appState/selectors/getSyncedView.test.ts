import { AppSharedState } from '../state.models';
import { getSyncedView } from './getSyncedView';

/**
 * Unit tests for the getSyncedView selector.
 *
 * This selector extracts the zoom and/or center (latitude, longitude) from the view
 * of a map set, based on its sync configuration.
 */
describe('Selector test: get synced view', () => {
	/**
	 * Base view to reuse
	 */
	const baseView = { zoom: 4, latitude: 10, longitude: 20 };

	const emptyArrays = {
		layers: [],
		places: [],
		styles: [],
		periods: [],
		selections: [],
	};

	/**
	 * Test: sync both zoom and center
	 */
	test('returns full synced view when both zoom and center are enabled', () => {
		const state: AppSharedState = {
			appNode: {} as any,
			renderingLayers: [],
			maps: [],
			mapSets: [
				{
					key: 'fullSync',
					maps: ['map1'],
					sync: { zoom: true, center: true },
					view: baseView,
				},
			],
			...emptyArrays,
		};

		const result = getSyncedView(state, 'fullSync');
		expect(result).toEqual(baseView);
	});

	/**
	 * Test: sync only zoom
	 */
	test('returns only zoom when only zoom is synced', () => {
		const state: AppSharedState = {
			appNode: {} as any,
			renderingLayers: [],
			maps: [],
			mapSets: [
				{
					key: 'zoomOnly',
					maps: ['map1'],
					sync: { zoom: true, center: false },
					view: baseView,
				},
			],
			...emptyArrays,
		};

		const result = getSyncedView(state, 'zoomOnly');
		expect(result).toEqual({ zoom: 4 });
	});

	/**
	 * Test: sync only center
	 */
	test('returns only center when only center is synced', () => {
		const state: AppSharedState = {
			appNode: {} as any,
			renderingLayers: [],
			maps: [],
			mapSets: [
				{
					key: 'centerOnly',
					maps: ['map1'],
					sync: { zoom: false, center: true },
					view: baseView,
				},
			],
			...emptyArrays,
		};

		const result = getSyncedView(state, 'centerOnly');
		expect(result).toEqual({ latitude: 10, longitude: 20 });
	});

	/**
	 * Test: no sync at all
	 */
	test('returns empty object when neither zoom nor center are synced', () => {
		const state: AppSharedState = {
			appNode: {} as any,
			renderingLayers: [],
			maps: [],
			mapSets: [
				{
					key: 'noSync',
					maps: ['map1'],
					sync: { zoom: false, center: false },
					view: baseView,
				},
			],
			...emptyArrays,
		};

		const result = getSyncedView(state, 'noSync');
		expect(result).toEqual({});
	});

	/**
	 * Test: unknown map set key
	 */
	test('returns empty object if map set key does not exist', () => {
		const state: AppSharedState = {
			appNode: {} as any,
			renderingLayers: [],
			maps: [],
			mapSets: [],
			...emptyArrays,
		};

		const result = getSyncedView(state, 'missingKey');
		expect(result).toEqual({});
	});
});
