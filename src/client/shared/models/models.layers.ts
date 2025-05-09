import { Datasource } from '../panther/models.nodes';
import { LayerTreeInteraction } from '../layers/models.layers';
import { Nullable } from '../coding/code.types';

/**
 * Layer in rendering context, but still undepedent to specific rendering framework
 */
export interface RenderingLayer {
	isActive: boolean;
	level: number;
	key: string;
	opacity?: number;
	datasource: Datasource;
	interaction: Nullable<LayerTreeInteraction>;
}
