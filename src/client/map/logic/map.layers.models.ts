import { Unsure, Nullable } from '@gisatcz/ptr-be-core/browser';
import { OneOfInteractionFunc } from './models.events';
import { Selection } from '../../shared/models/models.selections';
import { DatasourceWithNeighbours } from '../../shared/models/models.metadata.js';

/**
 * General props for every rendered layer by DeckGL
 */
export interface LayerGeneralProps {
	sourceNode: DatasourceWithNeighbours;
	style: Nullable<any>;
	isActive: boolean;
	key: string;
	opacity?: number;
	selection?: Selection;
	isInteractive?: boolean;

	//TODO better typing and more types of inclick handlers for general purposes
	onClickHandler: Unsure<OneOfInteractionFunc>;
}
