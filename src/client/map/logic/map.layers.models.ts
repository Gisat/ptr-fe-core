import { OneOfInteractionFunc } from './models.events';
import { Datasource } from '../../../globals/shared/panther/models.nodes';
import { Nullable, Unsure } from '../../../globals/shared/coding/code.types';

/**
 * General props for every rendered layer by DeckGL
 */
export interface LayerGeneralProps {
	sourceNode: Datasource;
	style: Nullable<any>;
	isActive: boolean;
	key: string;
	opacity?: number;
	activeFeatureKey?: string; // Key of the feature that is currently active

	//TODO better typing and more types of inclick handlers for general purposes
	onClickHandler: Unsure<OneOfInteractionFunc>;
}
