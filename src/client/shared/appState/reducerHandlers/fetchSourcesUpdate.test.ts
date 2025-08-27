/**
 * @file Unit tests for the fetchSourcesUpdate reducer handler.
 */

import { Datasource } from '../../../../globals/shared/panther/models.nodes';
import { RenderingLayer } from '../../models/models.layers';
import { StateActionType } from '../enum.state.actionType';
import { ActionChangeLayerSources } from '../state.models.actions';
import { createDatasource } from '../tests/state.helpers';
import { createFakeState } from '../tests/state.mock';
import { reduceHandlerFetchSources } from './fetchSourcesUpdate';

vi.mock('../../models/parsers.layers', () => ({
	parseDatasourcesToRenderingLayers: vi.fn(),
}));

import { parseDatasourcesToRenderingLayers } from '../../models/parsers.layers';

const mockParser = parseDatasourcesToRenderingLayers as unknown as ReturnType<typeof vi.fn>;

describe('fetchSourcesUpdate reducer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should append parsed rendering layers to existing ones', () => {
		const existingLayers: RenderingLayer[] = [
			{
				key: 'layer-existing',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: createDatasource('layer-existing'),
			},
		];
		const fakeState = createFakeState({ renderingLayers: existingLayers });
		const parsedLayers: RenderingLayer[] = [
			{
				key: 'layer-new-1',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: createDatasource('layer-new-1'),
			},
			{
				key: 'layer-new-2',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: createDatasource('layer-new-2'),
			},
		];
		mockParser.mockReturnValue(parsedLayers);

		const payload: Datasource[] = [createDatasource('d1'), createDatasource('d2')];
		const action: ActionChangeLayerSources = { type: StateActionType.FETCH_SOURCES, payload };

		const result = reduceHandlerFetchSources(fakeState, action);

		expect(result.renderingLayers).toHaveLength(3);
		expect(mockParser).toHaveBeenCalledWith(payload, fakeState.appNode);
	});

	it('should initialize rendering layers when none exist', () => {
		const fakeState = createFakeState({ renderingLayers: undefined as unknown as RenderingLayer[] });
		const parsedLayers: RenderingLayer[] = [
			{
				key: 'layer-new-1',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: createDatasource('layer-new-1'),
			},
		];
		mockParser.mockReturnValue(parsedLayers);

		const action: ActionChangeLayerSources = {
			type: StateActionType.FETCH_SOURCES,
			payload: [createDatasource('d1')],
		};

		const result = reduceHandlerFetchSources(fakeState, action);

		expect(result.renderingLayers).toEqual(parsedLayers);
	});

	it('should handle an empty parser result', () => {
		const existingLayers: RenderingLayer[] = [
			{
				key: 'layer-existing',
				isActive: true,
				level: 0,
				interaction: null,
				datasource: createDatasource('layer-existing'),
			},
		];
		const fakeState = createFakeState({ renderingLayers: existingLayers });
		mockParser.mockReturnValue([]);

		const action: ActionChangeLayerSources = {
			type: StateActionType.FETCH_SOURCES,
			payload: [],
		};

		const result = reduceHandlerFetchSources(fakeState, action);

		expect(result.renderingLayers).toEqual(existingLayers);
		expect(result.renderingLayers).not.toBe(existingLayers);
	});

	it('should preserve other state properties', () => {
		const fakeState = createFakeState({ renderingLayers: [] });
		const parsedLayers: RenderingLayer[] = [
			{
				key: 'layer-new-1',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: createDatasource('layer-new-1'),
			},
		];
		mockParser.mockReturnValue(parsedLayers);

		const action: ActionChangeLayerSources = {
			type: StateActionType.FETCH_SOURCES,
			payload: [createDatasource('d1')],
		};

		const result = reduceHandlerFetchSources(fakeState, action);

		expect(result.maps).toBe(fakeState.maps);
	});
});
