import { HOVER_BLOCKED, LAYER_ID_BBOX } from "../constants";
import { isPointInPolygon } from "../helpers";
import { BboxEnclosedPoints, BboxPoint, BboxPoints, ClickInfo } from "../types";
import { addPointToMap } from "./addPointToMap";

/**
 * Interface for the onClick function props.
 */
interface OnClickProps {
    /** Information about the click event. */
    info: ClickInfo;
    /** Updated available area as an array of coordinates. */
    updatedAvailableArea: BboxEnclosedPoints | null;
    /** Indicates if the edit mode is active. */
    editModeIsActive: boolean;
    /** Predicted hovered points. */
    predictedHoveredPoints: BboxPoints | null;
    /** Indicates if the bounding box is hovered. */
    bboxIsHovered: string | boolean;
    /** Current coordinates of the active bounding box. */
    activeBboxPoints: BboxPoints | BboxPoint | [];
    /** Function to update the active bounding box points. */
    setActiveBboxPoints: (activeBboxPoints: BboxPoints | BboxPoint | []) => void;
    /** Function to set predicted hovered points. */
    setPredictedHoveredPoints: (predictedHoveredPoints: BboxPoints | null) => void;
    /** Callback function to execute when bounding box coordinates change. */
    onBboxCoordinatesChange: (bbox: BboxPoints | BboxPoint | null) => void;
    /** Function to toggle the edit mode state. */
    setEditModeIsActive: (isActive: boolean | ((prev: boolean) => boolean)) => void;
    /** Function to set the bounding box hover state. */
    setBboxIsHovered: (state: string) => void;
}

/**
 * Handles click events on a map layer.
 * 
 * @param {OnClickProps} props - The props for the onClick function.
 */
export const onClick = ({
    info,
    updatedAvailableArea,
    editModeIsActive,
    predictedHoveredPoints,
    bboxIsHovered,
    activeBboxPoints,
    setActiveBboxPoints,
    setPredictedHoveredPoints,
    onBboxCoordinatesChange,
    setEditModeIsActive,
    setBboxIsHovered
}: OnClickProps) => {
    // Check if the clicked point is inside the available area
    const isInsideArea = isPointInPolygon(updatedAvailableArea, info.coordinate);

    // If in edit mode and either inside the area or there is no available area
    if (editModeIsActive && (isInsideArea || !updatedAvailableArea)) {
        // If there are predicted hovered points and the bounding box is not blocked
        if (predictedHoveredPoints && bboxIsHovered !== HOVER_BLOCKED) {
            addPointToMap({
                coordinates: info.coordinate,
                activeBboxPoints,
                isDraft: false,
                setActiveBboxPoints,
                setPredictedHoveredPoints,
                onFinishDragging: onBboxCoordinatesChange
            });
        } 
        // If there are no predicted hovered points and the bounding box is not blocked
        if (!predictedHoveredPoints && bboxIsHovered !== HOVER_BLOCKED) {
            handleClickWithoutPredictedPoints({
                info,
                activeBboxPoints,
                setActiveBboxPoints,
                setEditModeIsActive,
                setBboxIsHovered,
                setPredictedHoveredPoints,
                onBboxCoordinatesChange
            });
        }
    } 
    // If clicking on the bounding box layer and it's not blocked
    else if (info?.layer?.id === LAYER_ID_BBOX && bboxIsHovered !== HOVER_BLOCKED) {
        setEditModeIsActive(!editModeIsActive); // Toggle edit mode
    }
};

/**
 * Interface for the handleClickWithoutPredictedPoints function props.
 */
interface HandleClickWithoutPredictedPointsProps {
    /** Information about the click event. */
    info: ClickInfo;
    /** Current coordinates of the active bounding box. */
    activeBboxPoints: BboxPoints | BboxPoint | [];
    /** Function to update the active bounding box points. */
    setActiveBboxPoints: (activeBboxPoints: BboxPoints | BboxPoint | []) => void;
    /** Function to toggle the edit mode state. */
    setEditModeIsActive: (isActive: boolean | ((prev: boolean) => boolean)) => void;
    /** Function to set the bounding box hover state. */
    setBboxIsHovered: (state: string) => void;
    /** Function to set predicted hovered points. */
    setPredictedHoveredPoints: (points: BboxPoints | null) => void;
    /** Callback function to execute when bounding box coordinates change. */
    onBboxCoordinatesChange: (bbox: BboxPoints | BboxPoint | null) => void;
}

/**
 * Helper function to handle clicks without predicted points.
 * 
 * @param {HandleClickWithoutPredictedPointsProps} props - The props for the handleClickWithoutPredictedPoints function.
 */
const handleClickWithoutPredictedPoints = ({
    info,
    activeBboxPoints,
    setActiveBboxPoints,
    setEditModeIsActive,
    setBboxIsHovered,
    setPredictedHoveredPoints,
    onBboxCoordinatesChange
}: HandleClickWithoutPredictedPointsProps) => {
    if (info?.layer?.id === LAYER_ID_BBOX) {
        // Toggle edit mode if clicking on the bounding box layer
        setEditModeIsActive((prev: boolean) => !prev);
    } else if (activeBboxPoints.length < 2) {
        // Add a point to the map and enable edit mode if there are fewer than 2 active points
        addPointToMap({
            coordinates: info.coordinate,
            activeBboxPoints,
            isDraft: false,
            setActiveBboxPoints,
            setPredictedHoveredPoints,
            onFinishDragging: onBboxCoordinatesChange
        });
        setEditModeIsActive(true);
        setBboxIsHovered(HOVER_BLOCKED); // Set bounding box to blocked state
    } else {
        // Disable edit mode if more than 2 active points
        setEditModeIsActive(false);
    }
};