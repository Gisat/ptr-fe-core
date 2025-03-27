import { DRAG_START } from "../constants";
import { DragStartInfo, Coordinate, bboxDragInfo } from "../types";

/**
 * Function to start dragging the bounding box.
 * 
 * @param {DragStartInfo} info - Information about the drag start event.
 * @param {Function} updateBboxDragInfo - Function to update the bounding box drag information.
 * @param {Function} setOriginalBboxBorderCoordinates - Function to set the original bounding box border coordinates.
 */
export const onStartDragging = (
    info: DragStartInfo,
    updateBboxDragInfo: (updatedDragInfo: bboxDragInfo) => void,
    setOriginalBboxBorderCoordinates: (coords: Coordinate[]) => void
) => {
    if (info.object) {
        // Set the bounding box drag information with the current coordinate
        updateBboxDragInfo({ dragType: DRAG_START, coordinates: [[0, 0], info.coordinate], originCoordinates: undefined });
        
        // Set the original bounding box border coordinates from the dragged object
        setOriginalBboxBorderCoordinates(info.object.geometry.coordinates[0]);
    }
};