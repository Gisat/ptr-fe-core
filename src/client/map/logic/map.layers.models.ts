import { OneOfInteractionFunc } from './models.events';
import { Datasource } from '../../../globals/shared/panther/models.nodes';
import { Nullable, Unsure } from '../../../globals/shared/coding/code.types';
import { Selection } from 'src/client/shared/models/models.selections';

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

	//TODO better typing and more types of inclick handlers for general purposes
	onClickHandler: Unsure<OneOfInteractionFunc>;
}
