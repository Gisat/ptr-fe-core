import { Nullable } from '@gisatcz/ptr-be-core/browser';
import { LayerTreeInteraction } from '../layers/models.layers';
import { DatasourceWithNeighbours } from './models.metadata';

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
