import { bboxDragInfo, BboxPoint, BboxPoints } from "../types";

// Type for the coordinates
type Coordinate = [number, number];

/**
 * Interface for the onStopDragging function props.
 */
interface OnStopDraggingProps {
    /** Function to set the bounding box drag information. */
    updateBboxDragInfo: (info: bboxDragInfo | null) => void;
    /** Function to set the original bounding box border coordinates. */
    setOriginalBboxBorderCoordinates: (coords: Coordinate[]) => void;
    /** Callback function to handle changes in bounding box coordinates. */
    onBboxCoordinatesChange: (points: BboxPoints | BboxPoint | null) => void;
    /** Current coordinates of the active bounding box. */
    activeBboxPoints: BboxPoints | BboxPoint | [];
}

/**
 * Function to stop dragging the bounding box.
 * 
 * @param {OnStopDraggingProps} props - The props for the onStopDragging function.
 */
export const onStopDragging = ({
		updateBboxDragInfo,
    setOriginalBboxBorderCoordinates,
    onBboxCoordinatesChange,
    activeBboxPoints
}: OnStopDraggingProps) => {
    // Reset the bounding box drag information
    updateBboxDragInfo(null);
    
    // Reset the original bounding box border coordinates
    setOriginalBboxBorderCoordinates([]);
    
    // Call the function to handle changes in bounding box coordinates
    onBboxCoordinatesChange(activeBboxPoints);
};