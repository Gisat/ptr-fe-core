/**
 * @file Unit tests for the fetchSourcesUpdate reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerFetchSources } from '../../../../client/shared/appState/reducerHandlers/fetchSourcesUpdate';
import { parseDatasourcesToRenderingLayers } from '../../../../client/shared/models/parsers.layers';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('fetchSourcesUpdate reducer', () => {
	it('should append parsed rendering layers to existing ones', () => {
		const existingLayers = [
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
				},
			},
			];
		const fakeState = { ...fullAppSharedStateMock, renderingLayers: existingLayers };

		const payload = [
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
		const action = { type: StateActionType.FETCH_SOURCES, payload };

		const result = reduceHandlerFetchSources(fakeState, action);

		const expectedParsed = parseDatasourcesToRenderingLayers(payload, fakeState.appNode);
		expect(result.renderingLayers).toEqual([...existingLayers, ...expectedParsed]);
	});

	  it('should initialize rendering layers when none exist', () => {
			const fakeState = JSON.parse(JSON.stringify(fullAppSharedStateMock));
			delete fakeState.renderingLayers;

			const action = {
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
			],
		};

		const result = reduceHandlerFetchSources(fakeState, action);

		const expectedParsed = parseDatasourcesToRenderingLayers(action.payload, fakeState.appNode);
		expect(result.renderingLayers).toEqual(expectedParsed);
	});

	it('should handle an empty parser result', () => {
			const existingLayers = [
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
				},
			},
		];
		const fakeState = { ...fullAppSharedStateMock, renderingLayers: existingLayers };

			const action = {
				type: StateActionType.FETCH_SOURCES,
				payload: [],
			};

		const result = reduceHandlerFetchSources(fakeState, action);

		// Parser returns empty -> renderingLayers remain unchanged
		expect(result.renderingLayers).toEqual(existingLayers);
	});

	it('should preserve other state properties', () => {
			const fakeState = {
				...fullAppSharedStateMock,
				renderingLayers: [],
			};

			const action = {
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
			],
		};

		const result = reduceHandlerFetchSources(fakeState, action);

		expect(result.maps).toBe(fakeState.maps);
	});
});
