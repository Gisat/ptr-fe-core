import { Datasource } from '@gisatcz/ptr-be-core/browser';
import { LayerTreeInteraction } from '../layers/models.layers';
import { Nullable } from '../../../globals/shared/coding/code.types';

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
	selectionKey?: string;
	isInteractive?: boolean;
}
