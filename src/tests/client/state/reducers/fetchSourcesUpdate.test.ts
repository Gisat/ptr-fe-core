/**
 * @file Unit tests for the fetchSourcesUpdate reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerFetchSources } from '../../../../client/shared/appState/reducerHandlers/fetchSourcesUpdate';
// Define local minimal types to decouple tests from production types
type TestDatasource = {
  key: string;
  labels: string[];
  nameDisplay: string;
  nameInternal: string;
  description: string | null | '';
  lastUpdatedAt: number;
  url: string;
  configuration: string;
};
type TestRenderingLayer = {
  key: string;
  isActive: boolean;
  level: number;
  interaction: null;
  datasource: TestDatasource;
};
import { parseDatasourcesToRenderingLayers } from '../../../../client/shared/models/parsers.layers';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('fetchSourcesUpdate reducer', () => {
  it('should append parsed rendering layers to existing ones', () => {
    const existingLayers: TestRenderingLayer[] = [
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
          } as TestDatasource,
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
    const action = { type: StateActionType.FETCH_SOURCES as StateActionType.FETCH_SOURCES, payload };

		const result = reduceHandlerFetchSources(fakeState, action);

		const expectedParsed = parseDatasourcesToRenderingLayers(payload, fakeState.appNode);
		expect(result.renderingLayers).toEqual([...existingLayers, ...expectedParsed]);
	});

  it('should initialize rendering layers when none exist', () => {
    const fakeState = { ...fullAppSharedStateMock, renderingLayers: undefined as unknown as TestRenderingLayer[] };

    const action = {
      type: StateActionType.FETCH_SOURCES as StateActionType.FETCH_SOURCES,
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
      ] as TestDatasource[],
    };

		const result = reduceHandlerFetchSources(fakeState, action);

    const expectedParsed = parseDatasourcesToRenderingLayers(action.payload, fakeState.appNode);
		expect(result.renderingLayers).toEqual(expectedParsed);
	});

	it('should handle an empty parser result', () => {
    const existingLayers: TestRenderingLayer[] = [
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
          } as TestDatasource,
			},
		];
		const fakeState = { ...fullAppSharedStateMock, renderingLayers: existingLayers };

    const action = {
      type: StateActionType.FETCH_SOURCES as StateActionType.FETCH_SOURCES,
      payload: [],
    };

		const result = reduceHandlerFetchSources(fakeState, action);

		// Parser returns empty -> renderingLayers remain unchanged
		expect(result.renderingLayers).toEqual(existingLayers);
	});

	it('should preserve other state properties', () => {
    const fakeState = { ...fullAppSharedStateMock, renderingLayers: [] as TestRenderingLayer[] };

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
      ] as TestDatasource[],
    } as const;

		const result = reduceHandlerFetchSources(fakeState, action);

		expect(result.maps).toBe(fakeState.maps);
	});
});
