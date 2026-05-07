import { Nullable } from '@gisatcz/ptr-be-core/browser';
import { LayerTreeInteraction } from '../layers/models.layers';
import { DatasourceWithNeighbours } from './models.metadata';
import { LineCapStyle } from '../../map/GeometryDrawing/_types/geometryDrawingTypes';
import { GeometryStyle } from '../../map/GeometryDrawing/_layers/geometryLayer';

/**
 * Drawing state for a geometry (polygon or circle) stored on a dedicated RenderingLayer entry.
 * Kept as part of RenderingLayer so drawing state lives inside
 * the existing AppSharedState.renderingLayers array.
 */
export interface GeometryDrawingModel {
	mode: 'polygon' | 'circle' | 'line';
	isActive: boolean;
	isClosed: boolean;
	geometryCoordinates: [number, number][];
	/** Index of the vertex currently being hovered, or null if none */
	hoveredPointIndex?: number | null;
	/** Buffer distance in metres – used only in 'line' mode to build a corridor polygon */
	bufferMeters?: number;
	/** End-cap style for line corridor – 'round' (default) or 'flat' */
	capStyle?: LineCapStyle;
	/** Optional visual style overrides for the geometry layer */
	style?: GeometryStyle;
	/**
	 * Index of the vertex currently selected for deletion (clicked while drawing),
	 * or null if none. Only relevant for 'polygon' and 'line' modes.
	 * Press the configured deleteKey (default 'Delete') to remove it,
	 * or deselectKey (default 'Escape') to deselect.
	 */
	selectedPointIndex?: number | null;
	/**
	 * Non-null sentinel (0) when the cursor is hovering the transparent edge-pick-layer
	 * on a closed polygon; null otherwise. Used exclusively to drive the 'cell' cursor
	 * in SingleMap via `isHoveringEdge` – the exact value is not meaningful.
	 */
	hoveredEdgeIndex?: number | null;
}

/**
 * Layer in rendering context, but still independent to specific rendering framework
 */
export interface RenderingLayer {
	isActive: boolean;
	level?: number;
	key: string;
	opacity?: number;
	datasource: DatasourceWithNeighbours;
	interaction: Nullable<LayerTreeInteraction>;
	selectionKey?: string;
	isInteractive?: boolean;
	layerType?: 'geojson' | 'icon';
	fetchOptions?: {
		route: string;
		method: 'GET' | 'POST';
	};
	/** Drawing state – present only on the dedicated 'geometryDrawing' layer entry */
	geometryDrawing?: GeometryDrawingModel;
}
