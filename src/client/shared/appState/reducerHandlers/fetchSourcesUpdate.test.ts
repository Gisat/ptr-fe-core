/**
 * Unit tests for the reduceHandlerFetchSources reducer.
 *
 * Verifies:
 * 1. Appending newly parsed rendering layers to existing ones (without mutation).
 * 2. Initializing renderingLayers when they are initially undefined.
 * 3. Handling an empty payload (parser returns an empty array) while keeping immutability.
 * 4. Preserving unrelated state properties.
 *
 * The parseDatasourcesToRenderingLayers parser is mocked to focus strictly on reducer behavior.
 */
import { ActionChangeLayerSources } from '../state.models.actions';
import { reduceHandlerFetchSources } from './fetchSourcesUpdate';

vi.mock('../../models/parsers.layers', () => ({
	parseDatasourcesToRenderingLayers: vi.fn(),
}));

import { parseDatasourcesToRenderingLayers } from '../../models/parsers.layers';

describe('Reducer test: fetchSourcesUpdate (reduceHandlerFetchSources)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	/**
	 * Should:
	 * - Call the parser with the incoming payload and appNode.
	 * - Return a NEW array containing original layers followed by parsed ones.
	 * - Preserve original layer objects (no mutation).
	 */
	it('should append new rendering layers when some already exist', () => {
		const existingLayers = [
			{ key: 'layer-existing-1', isActive: false },
			{ key: 'layer-existing-2', isActive: true },
		];
		const state: any = {
			appNode: { key: 'appRoot' },
			renderingLayers: existingLayers,
		};

		(parseDatasourcesToRenderingLayers as any).mockReturnValue([
			{ key: 'layer-new-1', isActive: false },
			{ key: 'layer-new-2', isActive: false },
		]);

		const action: ActionChangeLayerSources = {
			type: 'FETCH_SOURCES_UPDATE' as any,
			payload: [{ id: 'ds1' }, { id: 'ds2' }] as any,
		};

		const newState = reduceHandlerFetchSources(state, action);

		expect(newState.renderingLayers).not.toBe(existingLayers);
		expect(newState.renderingLayers.slice(0, 2)).toEqual(existingLayers);
		expect(newState.renderingLayers[2].key).toBe('layer-new-1');
		expect(newState.renderingLayers[3].key).toBe('layer-new-2');
		expect(newState.renderingLayers).toHaveLength(4);
		expect(parseDatasourcesToRenderingLayers).toHaveBeenCalledWith(action.payload, state.appNode);
	});

	/**
	 * Should initialize renderingLayers when they are undefined,
	 * using only the parsed output of the payload.
	 */
	it('should initialize renderingLayers when none exist', () => {
		const state: any = { appNode: { key: 'appRoot' } };

		(parseDatasourcesToRenderingLayers as any).mockReturnValue([{ key: 'layer-new-1', isActive: false }]);

		const action: ActionChangeLayerSources = {
			type: 'FETCH_SOURCES_UPDATE' as any,
			payload: [{ id: 'ds1' }] as any,
		};

		const newState = reduceHandlerFetchSources(state, action);

		expect(newState.renderingLayers).toEqual([{ key: 'layer-new-1', isActive: false }]);
		expect(parseDatasourcesToRenderingLayers).toHaveBeenCalledTimes(1);
	});

	/**
	 * Should return a new state whose renderingLayers contains only the original layers
	 * when the parser yields an empty array (empty payload scenario).
	 */
	it('should handle empty payload by appending nothing (parser returns empty array)', () => {
		const existingLayers = [{ key: 'layer-existing', isActive: true }];
		const state: any = {
			appNode: { key: 'appRoot' },
			renderingLayers: existingLayers,
		};

		(parseDatasourcesToRenderingLayers as any).mockReturnValue([]);

		const action: ActionChangeLayerSources = {
			type: 'FETCH_SOURCES_UPDATE' as any,
			payload: [] as any,
		};

		const newState = reduceHandlerFetchSources(state, action);

		expect(newState.renderingLayers).toEqual(existingLayers);
		expect(newState.renderingLayers).not.toBe(existingLayers); // immutability check
		expect(parseDatasourcesToRenderingLayers).toHaveBeenCalledWith([], state.appNode);
	});

	/**
	 * Ensures other unrelated state properties remain strictly equal (not recreated unnecessarily).
	 */
	it('should preserve other state properties untouched', () => {
		const state: any = {
			appNode: { key: 'appRoot' },
			someOtherProp: { a: 1 },
			renderingLayers: [],
		};

		(parseDatasourcesToRenderingLayers as any).mockReturnValue([{ key: 'layer-new-1' }]);

		const action: ActionChangeLayerSources = {
			type: 'FETCH_SOURCES_UPDATE' as any,
			payload: [{ id: 'ds1' }] as any,
		};

		const newState = reduceHandlerFetchSources(state, action);

		expect(newState.someOtherProp).toBe(state.someOtherProp);
		expect(newState.renderingLayers).toHaveLength(1);
	});
});
