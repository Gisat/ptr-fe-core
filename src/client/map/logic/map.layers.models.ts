import { OneOfInteractionFunc } from './models.events';
import { Nullable, Unsure } from '../../../globals/shared/coding/code.types';
import { Selection } from '../../shared/models/models.selections';
import { Datasource } from '@gisatcz/ptr-be-core/browser';

/**
 * General props for every rendered layer by DeckGL
 */
export interface LayerGeneralProps {
	sourceNode: Datasource;
	style: Nullable<any>;
	isActive: boolean;
	key: string;
	opacity?: number;
	selection?: Selection;
	isInteractive?: boolean;

	//TODO better typing and more types of inclick handlers for general purposes
	onClickHandler: Unsure<OneOfInteractionFunc>;
}
