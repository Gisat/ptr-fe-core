import { findClosest } from "../helpers";
import { BboxEnclosedPoints, BboxPoint, BboxPoints, Coordinate } from "../types";

/**
 * Interface for the editLayerBorder function props.
 */
interface EditLayerBorderProps {
    /** The coordinates of the drag event. */
    coordinates: Coordinate[];
    /** Current active bounding box points. */
    activeBboxPoints: BboxPoints | BboxPoint | [];
    /** Original coordinates of the line points. */
    originLinePointCoordinates: Coordinate[];
    /** Updated available latitude area. */
    updatedAvailableAreaLat: Coordinate | undefined;
    /** Updated available longitude area. */
    updatedAvailableAreaLong: Coordinate | undefined;
    /** Minimum area allowed for the bounding box. */
    minBorderRange: number;
    /** Updated available area coordinates. */
    updatedAvailableArea: BboxEnclosedPoints | null;
    /** Function to update active bounding box points. */
    setActiveBboxPoints: (activeBboxPoints: BboxPoints | BboxPoint | []) => void;
    /** Function to set original bbox border coordinates. */
    setOriginalBboxBorderCoordinates: (current: Coordinate[]) => void;
}

/**
 * Handles the editing of bounding box (bbox) borders when they are dragged.
 * Adjusts the bbox coordinates based on the drag distance, ensuring the bbox 
 * does not become smaller than the minimum allowed area.
 * 
 * @param {EditLayerBorderProps} props - The props for the editLayerBorder function.
 */
export const editLayerBorder = ({
    coordinates,
    activeBboxPoints,
    originLinePointCoordinates,
    updatedAvailableAreaLat,
    updatedAvailableAreaLong,
    minBorderRange,
    updatedAvailableArea,
    setActiveBboxPoints,
    setOriginalBboxBorderCoordinates
}: EditLayerBorderProps) => {

    const previousPoint = coordinates[0];
    const currentPoint = coordinates[1];

    // Check if we have valid points to work with
    if (previousPoint && currentPoint && coordinates.length && activeBboxPoints && originLinePointCoordinates.length > 0) {
        const differenceLat = currentPoint[0] - previousPoint[0]; // Change in latitude
        const differenceLong = currentPoint[1] - previousPoint[1]; // Change in longitude

        const lastLinePoints = originLinePointCoordinates.slice(-2); // Get the last two points of the origin line

        // Ensure the bounding box cannot be too small
        const sharedCoordinatePart = lastLinePoints[0].filter(point => lastLinePoints[1].includes(point))[0];
        const sharedCoordinatePartIndex = lastLinePoints[0].indexOf(sharedCoordinatePart);
        const oppositeCoordinatePart = activeBboxPoints.filter(point => !point.includes(sharedCoordinatePart))[0]?.[sharedCoordinatePartIndex];

        // Calculate new shared coordinate based on the drag
        const newSharedCoordinatePart = sharedCoordinatePart + currentPoint[sharedCoordinatePartIndex] - previousPoint[sharedCoordinatePartIndex];
        const difference = sharedCoordinatePart - oppositeCoordinatePart;

        // Check if the bbox can be made smaller
        const bboxCanBeSmaller = difference > 0 ? newSharedCoordinatePart > oppositeCoordinatePart + minBorderRange : newSharedCoordinatePart < oppositeCoordinatePart - minBorderRange;

        // Update the bounding box points based on the drag
        const newPoints = activeBboxPoints.map((point: Coordinate) => {

            const originPoint = lastLinePoints.find((linePoint) => JSON.stringify(linePoint) === JSON.stringify(point));

            if (originPoint && bboxCanBeSmaller) {
                // Adjust latitude if the line is vertical
                if (originLinePointCoordinates[0][0] === originLinePointCoordinates[1][0]) {
                    let newLat = originPoint[0] + differenceLat; // Calculate new latitude
                    // Check if the new latitude is within the available area
                    if (updatedAvailableArea && updatedAvailableAreaLat && (newLat < updatedAvailableArea[0][0] || newLat > updatedAvailableArea[2][0])) {
                        newLat = findClosest(updatedAvailableAreaLat, newLat);
                    }
                    const newPoint = [newLat, originPoint[1]];
                    setOriginalBboxBorderCoordinates(((current: Coordinate[]) => [...current, newPoint]) as any); // Update original bbox border coordinates
                    return(newPoint);
                    // Adjust longitude if the line is horizontal
                } else if (originLinePointCoordinates[0][1] === originLinePointCoordinates[1][1]) {
                    let newLong = originPoint[1] + differenceLong; // Calculate new longitude
                    // Check if the new longitude is within the available area
                    if (updatedAvailableArea && updatedAvailableAreaLong && (newLong < updatedAvailableArea[0][1] || newLong > updatedAvailableArea[2][1])) {
                        newLong = findClosest(updatedAvailableAreaLong, newLong)
                    }
                    const newPoint = [originPoint[0], newLong];
                    setOriginalBboxBorderCoordinates(((current: Coordinate[]) => [...current, newPoint]) as any); // Update original bbox border coordinates
                    return newPoint;

                } else {
                    return [originPoint[0], originPoint[1]]; // Return original point if not adjusted
                }
            } else {
                return point; // Return the point unchanged if it cannot be adjusted
            }
        });

        // Set the new active bounding box points
        setActiveBboxPoints(newPoints as BboxPoints);
    }
};