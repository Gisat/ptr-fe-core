import { Nullable } from '@gisatcz/ptr-be-core/browser';
import { LayerTreeInteraction } from '../layers/models.layers';
import { DatasourceWithNeighbours } from './models.metadata';

/**
 * Polygon drawing state stored on a dedicated RenderingLayer entry.
 * Kept as part of RenderingLayer so drawing state lives inside
 * the existing AppSharedState.renderingLayers array.
 */
export interface RenderingLayerPolygonDrawing {
	mode: 'polygon' | 'circle';
	isActive: boolean;
	isClosed: boolean;
	polygonCoordinates: [number, number][];
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
	/** Polygon drawing state – present only on the dedicated 'polygonDrawing' layer entry */
	polygonDrawing?: RenderingLayerPolygonDrawing;
}
