import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { Selection } from '../../client/shared/models/models.selections';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

/**
 * Returns a shallow clone of the datasource object so fixture edits stay isolated.
 */
const cloneDatasource = (datasource: RenderingLayer['datasource']) => ({
	...datasource,
});

/**
 * Clones a partial rendering layer, copying datasource/interaction when present.
 */
const cloneRenderingLayerInternal = (layer: Partial<RenderingLayer>): Partial<RenderingLayer> => {
	const cloned: Partial<RenderingLayer> = { ...layer };

	if (layer.datasource) {
		cloned.datasource = { ...layer.datasource };
	}

	if ('interaction' in layer) {
		cloned.interaction = layer.interaction;
	}

	return cloned;
};

/**
 * Produces a new selection instance with independent arrays/maps.
 */
const cloneSelection = (selection: Selection): Selection => ({
	...selection,
	distinctColours: [...selection.distinctColours], // string[]
	distinctItems: selection.distinctItems, // boolean
	featureKeyColourIndexPairs: { ...selection.featureKeyColourIndexPairs }, // { [key: string]: number }
	featureKeys: [...selection.featureKeys], // Array<string | number>
});

/**
 * Creates a copy of a single map model with cloned view and layers.
 */
const cloneMapModel = (map: SingleMapModel): SingleMapModel => ({
	key: map.key, // string
	view: { ...map.view }, // MapView
	renderingLayers: map.renderingLayers.map(cloneRenderingLayerInternal), // Partial<RenderingLayer>[]
});

/**
 * Shallow clones a map set keeping sync and view objects independent.
 */
const cloneMapSet = (mapSet: MapSetModel): MapSetModel => ({
	...mapSet,
	key: mapSet.key, // string
	maps: [...mapSet.maps], // string[]
	// mapSet.mode is optional
	sync: { ...mapSet.sync }, // MapSetSync
	view: { ...mapSet.view }, // Partial<MapView>
});

type BuildAppStateInput = {
	maps?: SingleMapModel[];
	mapSets?: MapSetModel[];
	renderingLayers?: RenderingLayer[];
	selections?: Selection[];
};

/**
 * Builds a reducer-friendly app state from partial inputs.
 */
export const buildAppState = ({
	maps = [],
	mapSets = [],
	renderingLayers = [],
	selections = [],
}: BuildAppStateInput = {}): AppSharedState => ({
	...fullAppSharedStateMock,
	renderingLayers: renderingLayers.map(cloneRenderingLayer),
	mapSets: mapSets.map(cloneMapSet),
	maps: maps.map(cloneMapModel),
	selections: selections.map(cloneSelection),
});

type BuildMapModelOptions = {
	layers?: Partial<RenderingLayer>[];
	view?: Partial<SingleMapModel['view']>;
};

/**
 * Factory for map models with sensible default view values.
 */
export const buildMapModel = (key: string, { layers = [], view = {} }: BuildMapModelOptions = {}): SingleMapModel => ({
	key,
	view: { latitude: 0, longitude: 0, zoom: 4, ...view },
	renderingLayers: layers.map(cloneRenderingLayerInternal),
});

type BuildMapSetOptions = {
	maps?: string[];
	sync?: MapSetModel['sync'];
	view?: MapSetModel['view'];
	mode?: MapSetModel['mode'];
};

/**
 * Factory for map sets that allows targeted overrides per test.
 */
export const buildMapSet = (
	key: string,
	{ maps = [], sync, view = {}, mode }: BuildMapSetOptions = {}
): MapSetModel => {
	const mapSet: MapSetModel = {
		key,
		maps: [...maps],
		sync: { center: false, zoom: false, ...sync },
		view: { ...view },
	};

	if (mode) {
		mapSet.mode = mode;
	}

	return mapSet;
};

type BuildRenderingLayerOptions = Partial<Omit<RenderingLayer, 'key' | 'datasource'>> & {
	datasource?: Partial<RenderingLayer['datasource']>;
};

/**
 * Produces a rendering layer instance with reusable defaults.
 */
export const buildRenderingLayer = (
	key: string,
	{ datasource, ...rest }: BuildRenderingLayerOptions = {}
): RenderingLayer => ({
	key,
	isActive: rest.isActive ?? false,
	level: rest.level ?? 0,
	opacity: rest.opacity,
	selectionKey: rest.selectionKey,
	isInteractive: rest.isInteractive,
	datasource: {
		key,
		labels: ['datasource'],
		nameDisplay: key,
		nameInternal: key,
		description: `${key} datasource`,
		lastUpdatedAt: 0,
		url: `https://example.com/${key}`,
		configuration: '{}',
		...datasource,
	},
	interaction: rest.interaction ?? null,
});

/**
 * Clones a complete rendering layer to protect fixtures from mutation.
 */
export const cloneRenderingLayer = (layer: RenderingLayer): RenderingLayer => ({
	...layer,
	datasource: cloneDatasource(layer.datasource),
	interaction: layer.interaction,
});

/**
 * Strongly typed action creator helper for reducer test payloads.
 */
export const makeActionFactory =
	<TAction extends { type: StateActionType; payload: unknown }>(type: TAction['type']) =>
	(payload: TAction['payload']): TAction =>
		({
			type,
			payload,
		}) as TAction;

/**
 * Minimal rendering layer stub used when only a key (plus overrides) matters.
 */
export const mapLayerStub = (overrides: Partial<RenderingLayer> & { key: string }) => ({ ...overrides });
