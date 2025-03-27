"use client";

import React, { useState, useEffect, Children, cloneElement, useRef } from "react";
import ControlButtons from "./ControlButtons";
import { dragLayer } from "./_logic/dragLayer";
import { editLayerBorder } from "./_logic/editLayerBorder";
import { availableAreaLayer } from "./_layers/availableAreaLayer";
import { bboxLayer } from "./_layers/boundingBoxLayer";
import {
    DRAG_LAYER,
    DRAG_LAYER_BORDER,
} from './constants';
import { getCursor } from "./_logic/getCursor";
import { onClick } from "./_logic/onClick";
import { onDrag } from "./_logic/onDrag";
import { onStartDragging } from "./_logic/onStartDragging";
import { onStopDragging } from "./_logic/onStopDragging";
import { onViewStateChange } from "./_logic/onViewStateChange";
import { clearPoints } from "./_logic/clearPoints";
import { onHover } from "./_logic/onHover";
import { bboxDragInfo, BboxEnclosedPoints, BboxPoint, BboxPoints, ClickInfo, Coordinate, DragInfo, DragStartInfo, GetCursorInfo, HoverInfo, ViewStateChangeInfo } from "./types";
import { area as turfArea } from '@turf/area';
import { polygon as turfPolygon } from '@turf/helpers';

interface BoundingBoxProps {
    availableArea?: Array<Array<number>>;
    children: React.ReactNode;
    onBboxChange?: (bboxCoordinates: BboxPoints | BboxPoint | null, bboxArea: number | null) => void;
    minBorderRange?: number;
    minBboxArea?: number;
    maxBboxArea?: number;
    followMapScreen?: boolean;
    buttonsStyles?: object;
    bboxPoints?: BboxPoints;
    disabled?: boolean;
    availableAreaConfig?: object;
    bboxConfig?: object;
    CustomButtonsComponent?: React.ReactElement<{ handleEditToggle?: () => void; clearPoints?: () => void, isActive?: boolean, activePoints?: BboxPoints | BboxPoint | []}> | undefined;
}

/**
 * Controllable bounding box component.
 * 
 * @typedef {Object} BoundingBoxProps
 * @property {Array<Array<number>>} availableArea - Can be specified by coordinates (BL, TL, TR, BR) or by meters (width, height) in center of the screen.
 * @property {React.ReactNode} children - Map component.
 * @property {(bboxCoordinates: Array<Array<number>> | null, bboxArea: number) => void} onBboxChange - Callback when bbox coordinates change.
 * @property {number} minBorderRange - Minimum border range for the bounding box (degrees).
 * @property {number} minBboxArea - Minimum area for the bounding box (km2).
 * @property {number} maxBboxArea - Maximum area for the bounding box (km2).
 * @property {boolean} followMapScreen - Whether the layers move with the map.
 * @property {Object} buttonsStyles - Styles of the control buttons.
 * @property {Array<Array<number>>} bboxPoints - Initial points of the bounding box.
 * @property {boolean} disabled - Whether the bounding box is disabled.
 * @property {Object} availableAreaConfig - Configuration for the available area layer.
 * @property {Object} bboxConfig - Configuration for the bounding box layer.
 * @property {React.ReactElement} CustomButtonsComponent - Custom buttons component.
 * @returns {JSX.Element} The rendered BoundingBox component.
 */

export const BoundingBox: React.FC<BoundingBoxProps> = ({
    availableArea = null,
    children,
    onBboxChange,
    minBorderRange = 0,
    minBboxArea = 0.9,
    maxBboxArea = 100000,
    followMapScreen = false,
    buttonsStyles = {},
    bboxPoints = [],
    disabled = false,
    availableAreaConfig = {},
    bboxConfig = {},
    CustomButtonsComponent
}) => {
    const mapRef = useRef<any>(null); // Reference to the map
    const [editModeIsActive, setEditModeIsActive] = useState(false); // Edit mode state
    const [bboxIsHovered, setBboxIsHovered] = useState<string | boolean>(false); // Hover state for the bounding box
    const [activeBboxPoints, setActiveBboxPoints] = useState<BboxPoints | BboxPoint | []>(bboxPoints); // Active points of the bounding box
    const [bboxDragInfo, setBboxDragInfo] = useState<bboxDragInfo | null>(null); // Dragging information
    const [originalBboxBorderCoordinates, setOriginalBboxBorderCoordinates] = useState<Coordinate[]>([]); // Original bounding box border coordinates
    const [previousDraggedPoint, setPreviousDraggedPoint] = useState<Coordinate | []>([]); // Previous dragged point
    const [updatedAvailableArea, setUpdatedAvailableArea] = useState<BboxEnclosedPoints | null>(null); // Updated available area
    const [predictedHoveredPoints, setPredictedHoveredPoints] = useState<BboxPoints | null>(null); // Predicted hovered points
    const [bboxArea, setBboxArea] = useState<number | null>(null); // Area of the bounding box

    const viewport = mapRef?.current?.deck?.viewManager?._viewports?.[0];

    const onBboxCoordinatesChange = (bboxCoordinates: BboxPoints | BboxPoint | null) => {
			onBboxChange?.(bboxCoordinates, bboxArea);
    }

    // Effect to handle dragging of the bounding box
    const updateBboxDragInfo = (updatedDragInfo: bboxDragInfo | null) => {
        setBboxDragInfo(updatedDragInfo);
        // Calculate updated available area bounds
        let updatedAvailableAreaBounds;
        let updatedAvailableAreaLat;
        let updatedAvailableAreaLong;
        if (updatedAvailableArea) {
            updatedAvailableAreaBounds = [updatedAvailableArea[0], updatedAvailableArea[2]];
            updatedAvailableAreaLat = [updatedAvailableAreaBounds[0][0], updatedAvailableAreaBounds[1][0]] as Coordinate;
            updatedAvailableAreaLong = [updatedAvailableAreaBounds[0][1], updatedAvailableAreaBounds[1][1]] as Coordinate;
        }
        if (updatedDragInfo) {
            switch (updatedDragInfo.dragType) {
                case DRAG_LAYER:
                    dragLayer({
                        coordinates: updatedDragInfo.coordinates,
                        activeBboxPoints,
                        updatedAvailableAreaLat,
                        updatedAvailableAreaLong,
                        minBorderRange,
                        updatedAvailableArea,
                        setActiveBboxPoints
                    });
                    break;
                case DRAG_LAYER_BORDER:
                    editLayerBorder({
                        coordinates: updatedDragInfo.coordinates,
                        activeBboxPoints,
                        originLinePointCoordinates: originalBboxBorderCoordinates,
                        updatedAvailableAreaLat,
                        updatedAvailableAreaLong,
                        minBorderRange,
                        updatedAvailableArea,
                        setActiveBboxPoints,
                        setOriginalBboxBorderCoordinates
                    });
                    break;
                default:
                    break;
            }
        }
    };

    // Effect to update available area based on the provided coordinates
    useEffect(() => {
        if (viewport && availableArea) {
            switch (availableArea.length) {
                case 1: {
                    const topRight = viewport.addMetersToLngLat([viewport.longitude, viewport.latitude], [availableArea[0][0] / 2, availableArea[0][1] / 2]);
                    const bottomLeft = viewport.addMetersToLngLat([viewport.longitude, viewport.latitude], [-availableArea[0][0] / 2, -availableArea[0][1] / 2]);
                    const newUpdatedAvailableArea = [bottomLeft, [bottomLeft[0], topRight[1]], topRight, [topRight[0], bottomLeft[1]], bottomLeft] as BboxEnclosedPoints;
                    setUpdatedAvailableArea(newUpdatedAvailableArea);
                    break;
                }
                case 4:
                    setUpdatedAvailableArea([...availableArea, availableArea[0]] as BboxEnclosedPoints);
                    break;
                default:
                    break;
            }
        } else {
            setUpdatedAvailableArea(null)
        }

        const currentPoints = predictedHoveredPoints || activeBboxPoints;

        if (currentPoints?.length === 4) {
            const polygon = turfPolygon([[...currentPoints, currentPoints[0]]], { name: "polygon" });
            const area = turfArea(polygon) / 1000000;
            setBboxArea(area)
        }
    }, [availableArea, activeBboxPoints, predictedHoveredPoints, viewport]);

    const mappedChildren = Children.map(children, child => {
        // Destructure props for better readability
        const isDisabled = disabled;
        const cursorHandler = isDisabled ? () => "default" : (info: GetCursorInfo) => getCursor({
            info,
            bboxDragInfo,
            activeBboxPoints,
            editModeIsActive,
            bboxIsHovered
        });
        const clickHandler = isDisabled ? null : (info: ClickInfo) => onClick({
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
        });
        const hoverHandler = isDisabled ? null : (info: HoverInfo) => onHover({
            info,
            updatedAvailableArea,
            activeBboxPoints,
            minBorderRange,
            editModeIsActive,
            setBboxIsHovered,
            setActiveBboxPoints,
            setPredictedHoveredPoints,
            onBboxCoordinatesChange
        });
        const dragHandler = isDisabled ? null : (info: DragInfo) => onDrag({
            info,
            updatedAvailableArea,
            editModeIsActive,
            bboxDragInfo,
            updateBboxDragInfo,
            setOriginalBboxBorderCoordinates
        });
        const startDragHandler = isDisabled ? null : (info: DragStartInfo) => onStartDragging(
            info,
            updateBboxDragInfo,
            setOriginalBboxBorderCoordinates
        );
        const stopDragHandler = isDisabled ? null : () => onStopDragging({
						updateBboxDragInfo,
            setOriginalBboxBorderCoordinates,
            onBboxCoordinatesChange,
            activeBboxPoints
        });
        const viewStateChangeHandler = isDisabled ? null : (info: ViewStateChangeInfo) => onViewStateChange({
            viewInfo: info,
            followMapScreen,
            activeBboxPoints,
            updatedAvailableArea,
            previousDraggedPoint,
            setPreviousDraggedPoint,
            setUpdatedAvailableArea,
            setActiveBboxPoints,
            onBboxCoordinatesChange
        });

        return cloneElement(child as React.ReactElement<any>, {
            mapRef: mapRef,
            onClick: clickHandler,
            layer: [
                availableAreaLayer(updatedAvailableArea, editModeIsActive, availableAreaConfig),
                bboxLayer({
                    activeBboxPoints,
                    bboxIsHovered,
                    editModeIsActive,
                    predictedHoveredPoints,
                    config: bboxConfig,
                    bboxIsInBounds: (bboxArea && bboxArea >= minBboxArea && bboxArea <= maxBboxArea) || !bboxArea
                })
            ],
            getCursor: cursorHandler,
            onHover: hoverHandler,
            onDrag: dragHandler,
            onStartDragging: startDragHandler,
            onStopDragging: stopDragHandler,
            onViewStateChange: viewStateChangeHandler,
            disableControls: (editModeIsActive && activeBboxPoints.length !== 4) || (editModeIsActive && bboxIsHovered && bboxDragInfo?.dragType)
        });
    });

    return (
        <>
            {mappedChildren}
            {!disabled ?
                <ControlButtons
                    isActive={editModeIsActive}
                    activeBboxPoints={activeBboxPoints}
                    customStyles={buttonsStyles}
                    setEditModeIsActive={setEditModeIsActive}
                    clearPoints={() => clearPoints(setActiveBboxPoints, setPredictedHoveredPoints, onBboxCoordinatesChange)}
                    CustomButtonsComponent={CustomButtonsComponent}
                />
                : null}
        </>
    );
};