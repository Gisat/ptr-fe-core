/**
 * @file Unit tests for the fetchSourcesUpdate reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerFetchSources } from '../../../../client/shared/appState/reducerHandlers/fetchSourcesUpdate';
import { ActionChangeLayerSources } from '../../../../client/shared/appState/state.models.actions';
import { RenderingLayer } from '../../../../client/shared/models/models.layers';
import type { Datasource } from '../../../../globals/shared/panther/models.nodes';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

vi.mock('../../../../client/shared/models/parsers.layers', () => ({
	parseDatasourcesToRenderingLayers: vi.fn(),
}));

import type { MockedFunction } from 'vitest';
import { parseDatasourcesToRenderingLayers } from '../../../../client/shared/models/parsers.layers';

const mockParser = parseDatasourcesToRenderingLayers as MockedFunction<typeof parseDatasourcesToRenderingLayers>;

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
				datasource: {
					key: 'layer-existing',
					labels: ['datasource'],
					nameDisplay: '',
					nameInternal: '',
					description: '',
					lastUpdatedAt: 0,
					url: '',
					configuration: '{}',
				} as Datasource,
			},
		];
		const fakeState = { ...fullAppSharedStateMock, renderingLayers: existingLayers };
		const parsedLayers: RenderingLayer[] = [
			{
				key: 'layer-new-1',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: {
					key: 'layer-new-1',
					labels: ['datasource'],
					nameDisplay: '',
					nameInternal: '',
					description: '',
					lastUpdatedAt: 0,
					url: '',
					configuration: '{}',
				} as Datasource,
			},
			{
				key: 'layer-new-2',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: {
					key: 'layer-new-2',
					labels: ['datasource'],
					nameDisplay: '',
					nameInternal: '',
					description: '',
					lastUpdatedAt: 0,
					url: '',
					configuration: '{}',
				} as Datasource,
			},
		];
		mockParser.mockReturnValue(parsedLayers);

		const payload: Datasource[] = [
			{
				key: 'd1',
				labels: ['datasource'],
				nameDisplay: '',
				nameInternal: '',
				description: '',
				lastUpdatedAt: 0,
				url: '',
				configuration: '{}',
			},
			{
				key: 'd2',
				labels: ['datasource'],
				nameDisplay: '',
				nameInternal: '',
				description: '',
				lastUpdatedAt: 0,
				url: '',
				configuration: '{}',
			},
		];
		const action: ActionChangeLayerSources = { type: StateActionType.FETCH_SOURCES, payload };

		const result = reduceHandlerFetchSources(fakeState, action);

		expect(result.renderingLayers).toHaveLength(3);
		expect(mockParser).toHaveBeenCalledWith(payload, fakeState.appNode);
	});

	it('should initialize rendering layers when none exist', () => {
		const fakeState = { ...fullAppSharedStateMock, renderingLayers: undefined as unknown as RenderingLayer[] };
		const parsedLayers: RenderingLayer[] = [
			{
				key: 'layer-new-1',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: {
					key: 'layer-new-1',
					labels: ['datasource'],
					nameDisplay: '',
					nameInternal: '',
					description: '',
					lastUpdatedAt: 0,
					url: '',
					configuration: '{}',
				} as Datasource,
			},
		];
		mockParser.mockReturnValue(parsedLayers);

		const action: ActionChangeLayerSources = {
			type: StateActionType.FETCH_SOURCES,
			payload: [
				{
					key: 'd1',
					labels: ['datasource'],
					nameDisplay: '',
					nameInternal: '',
					description: '',
					lastUpdatedAt: 0,
					url: '',
					configuration: '{}',
				},
			] as Datasource[],
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
				datasource: {
					key: 'layer-existing',
					labels: ['datasource'],
					nameDisplay: '',
					nameInternal: '',
					description: '',
					lastUpdatedAt: 0,
					url: '',
					configuration: '{}',
				} as Datasource,
			},
		];
		const fakeState = { ...fullAppSharedStateMock, renderingLayers: existingLayers };
		mockParser.mockReturnValue([]);

		const action: ActionChangeLayerSources = {
			type: StateActionType.FETCH_SOURCES,
			payload: [],
		};

		const result = reduceHandlerFetchSources(fakeState, action);

		expect(result.renderingLayers).toHaveLength(1);
	});

	it('should preserve other state properties', () => {
		const fakeState = { ...fullAppSharedStateMock, renderingLayers: [] };
		const parsedLayers: RenderingLayer[] = [
			{
				key: 'layer-new-1',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: {
					key: 'layer-new-1',
					labels: ['datasource'],
					nameDisplay: '',
					nameInternal: '',
					description: '',
					lastUpdatedAt: 0,
					url: '',
					configuration: '{}',
				} as Datasource,
			},
		];
		mockParser.mockReturnValue(parsedLayers);

		const action: ActionChangeLayerSources = {
			type: StateActionType.FETCH_SOURCES,
			payload: [
				{
					key: 'd1',
					labels: ['datasource'],
					nameDisplay: '',
					nameInternal: '',
					description: '',
					lastUpdatedAt: 0,
					url: '',
					configuration: '{}',
				},
			] as Datasource[],
		};

		const result = reduceHandlerFetchSources(fakeState, action);

		expect(result.maps).toBe(fakeState.maps);
	});
});
