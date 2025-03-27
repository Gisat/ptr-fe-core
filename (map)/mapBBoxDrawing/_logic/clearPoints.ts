import { BboxPoints } from "../types";

/**
 * Clears active bounding box points and predicted hovered points.
 * 
 * @param {Function} setActiveBboxPoints - Function to set the active bounding box points.
 * @param {Function} setPredictedHoveredPoints - Function to set the predicted hovered points.
 * @param {Function} onBboxCoordinatesChange - Function to notify that bounding box coordinates have changed.
 */
export const clearPoints = (
    setActiveBboxPoints: (points: BboxPoints | []) => void,
    setPredictedHoveredPoints: (points: BboxPoints | null) => void,
    onBboxCoordinatesChange: (points: BboxPoints | null) => void
) => {
    // Clear active bounding box points
    setActiveBboxPoints([]);
    
    // Clear predicted hovered points
    setPredictedHoveredPoints(null);
    
    // Notify that bounding box coordinates have changed
    onBboxCoordinatesChange(null);
};