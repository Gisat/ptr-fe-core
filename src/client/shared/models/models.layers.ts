import { Nullable } from '@gisatcz/ptr-be-core/browser';
import { LayerTreeInteraction } from '../layers/models.layers';
import { DatasourceWithNeighbours } from './models.metadata';

/**
 * Drawing state for a geometry (polygon or circle) stored on a dedicated RenderingLayer entry.
 * Kept as part of RenderingLayer so drawing state lives inside
 * the existing AppSharedState.renderingLayers array.
 */
export interface GeometryDrawingModel {
	mode: 'polygon' | 'circle';
	isActive: boolean;
	isClosed: boolean;
	geometryCoordinates: [number, number][];
	/** Index of the vertex currently being hovered, or null if none */
	hoveredPointIndex?: number | null;
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
