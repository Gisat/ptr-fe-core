import { Nullable } from '@gisatcz/ptr-be-core/browser';
import { LayerTreeInteraction } from '../layers/models.layers';
import { DatasourceWithNeighbours } from './models.metadata';

/**
 * Layer in rendering context, but still undepedent to specific rendering framework
 */
export interface RenderingLayer {
	isActive: boolean;
	level: number;
	key: string;
	opacity?: number;
	datasource: DatasourceWithNeighbours;
	interaction: Nullable<LayerTreeInteraction>;
	selectionKey?: string;
	isInteractive?: boolean;
}
