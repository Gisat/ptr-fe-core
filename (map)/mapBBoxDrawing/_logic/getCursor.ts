import {
	CURSOR_GRABBING,
	CURSOR_E_RESIZE,
	CURSOR_S_RESIZE,
	CURSOR_NOT_ALLOWED,
	CURSOR_POINTER,
	CURSOR_GRAB,
	HOVER_BLOCKED,
	HOVER_BORDER_HORIZONTAL,
	HOVER_BORDER_VERTICAL,
	HOVER_LAYER
} from '../constants';
import { GetCursorInfo, Coordinate, bboxDragInfo } from '../types';

/**
* Interface for the getCursor function props.
*/
interface GetCursorProps {
	/** Information about the cursor state. */
	info: GetCursorInfo;
	/** Information about the bounding box drag. */
	bboxDragInfo: bboxDragInfo | null;
	/** Array of active bounding box points. */
	activeBboxPoints: Coordinate[];
	/** Boolean indicating if edit mode is active. */
	editModeIsActive: boolean;
	/** Current hover state of the bounding box. */
	bboxIsHovered: string | boolean;
}

/**
* Determines the cursor style based on the dragging state, bounding box hover state, and edit mode.
* It returns different cursor styles such as 'grabbing', 'e-resize', 's-resize', 'not-allowed', 'pointer', or 'grab' depending on the conditions met.
* 
* @param {GetCursorProps} props - The props for the getCursor function.
* @returns {string} The cursor style.
*/
export const getCursor = ({
	info,
	bboxDragInfo,
	activeBboxPoints,
	editModeIsActive,
	bboxIsHovered
}: GetCursorProps): string => {
	// If the user is currently dragging or if there is drag information
	if (info.isDragging || bboxDragInfo) {
			return CURSOR_GRABBING;
	}

	// Check if we are in edit mode and there are active bounding box points
	const hasMultipleActivePoints = activeBboxPoints.length > 1;

	// Determine cursor based on the state of the bounding box and edit mode
	if ((hasMultipleActivePoints && bboxIsHovered && editModeIsActive) || 
			(activeBboxPoints.length < 2 && editModeIsActive)) {
			
			// Determine cursor based on the type of hover state
			switch (bboxIsHovered) {
					case HOVER_BORDER_HORIZONTAL:
							return CURSOR_E_RESIZE; // East resize cursor
					case HOVER_BORDER_VERTICAL:
							return CURSOR_S_RESIZE; // South resize cursor
					case HOVER_BLOCKED:
							return CURSOR_NOT_ALLOWED; // Not allowed cursor
					default:
							return CURSOR_POINTER; // Default pointer cursor
			}
	} 

	// If hovering over a layer, show pointer cursor
	if (bboxIsHovered === HOVER_LAYER) {
			return CURSOR_POINTER;
	}

	// Default to grab cursor if none of the above conditions are met
	return CURSOR_GRAB;
};