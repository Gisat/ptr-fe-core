import { DRAG_LAYER, DRAG_LAYER_BORDER, LAYER_ID_BBOX_LINES } from "../constants";
import { isPointInPolygon } from "../helpers";
import { bboxDragInfo, BboxEnclosedPoints, Coordinate, DragInfo } from "../types";

/**
 * Interface for the onDrag function props.
 */
interface OnDragProps {
    /** Information about the drag event. */
    info: DragInfo;
    /** Updated available area as an array of coordinates. */
    updatedAvailableArea: BboxEnclosedPoints | null;
    /** Indicates if the edit mode is active. */
    editModeIsActive: boolean;
    /** Information about the bounding box drag. */
    bboxDragInfo: bboxDragInfo | null;
    /** Function to update the bounding box drag information. */
    updateBboxDragInfo: (updatedDragInfo: bboxDragInfo) => void;
    /** Function to set the original bounding box border coordinates. */
    setOriginalBboxBorderCoordinates: (coords: Coordinate[]) => void;
}

/**
 * Handles the dragging of a bounding box in a graphical interface.
 * It checks if the cursor is inside a specified area and if editing mode is active.
 * Depending on the type of object being dragged, it updates the bounding box drag information
 * with the new coordinates or resets the original bounding box border coordinates.
 * 
 * @param {OnDragProps} props - The props for the onDrag function.
 */
export const onDrag = ({
    info,
    updatedAvailableArea,
    editModeIsActive,
    bboxDragInfo,
    updateBboxDragInfo,
    setOriginalBboxBorderCoordinates
}: OnDragProps) => {
    const cursorInsideArea = isPointInPolygon(updatedAvailableArea, info.coordinate);

    // Check if we are in edit mode and dragging is active
    if (editModeIsActive && bboxDragInfo && (cursorInsideArea || bboxDragInfo)) {
        const draggedObjectName = info.object.properties.name;

        if (draggedObjectName === LAYER_ID_BBOX_LINES) {
            // Update the bounding box drag info for border dragging
            updateBboxDragInfo({
                dragType: DRAG_LAYER_BORDER,
                coordinates: [bboxDragInfo.coordinates[1], info.coordinate],
                originCoordinates: info.object.geometry.coordinates[0]
            });
        } else {
            // Reset original bounding box border coordinates and update drag info
            setOriginalBboxBorderCoordinates([]);
            updateBboxDragInfo({
                dragType: DRAG_LAYER,
                coordinates: [bboxDragInfo.coordinates[1], info.coordinate]
            });
        }
    }
};