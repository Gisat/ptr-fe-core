import { GeoJsonLayer } from "@deck.gl/layers";
import { BboxEnclosedPoints } from "../types";
import {
    AVAILABLE_AREA_LAYER_ID,
    AVAILABLE_AREA_LAYER_FEATURE_COLLECTION_TYPE,
    AVAILABLE_AREA_LAYER_FEATURE_TYPE,
    AVAILABLE_AREA_LAYER_FEATURE_NAME,
    AVAILABLE_AREA_LAYER_GEOMETRY_TYPE,
    AVAILABLE_AREA_LAYER_STROKED,
    AVAILABLE_AREA_LAYER_FILLED,
    AVAILABLE_AREA_LAYER_POINT_RADIUS_MIN_PIXELS,
    AVAILABLE_AREA_LAYER_POINT_RADIUS_MAX_PIXELS,
    AVAILABLE_AREA_LAYER_PICKABLE,
    AVAILABLE_AREA_LAYER_FILL_COLOR,
    AVAILABLE_AREA_LAYER_LINE_COLOR,
    AVAILABLE_AREA_LAYER_LINE_WIDTH_MIN_PIXELS,
    AVAILABLE_AREA_LAYER_LINE_WIDTH_MAX_PIXELS,
    AVAILABLE_AREA_LAYER_LINE_WIDTH,
    AVAILABLE_AREA_LAYER_DASH_ARRAY,
    AVAILABLE_AREA_LAYER_DASH_JUSTIFIED,
    AVAILABLE_AREA_LAYER_DASH_GAP_PICKABLE,
    AVAILABLE_AREA_LAYER_EXTENSIONS
} from "./config";

/**
 * Creates a GeoJson layer for displaying the available area on the map.
 * 
 * @param {Array} availableArea - An array of coordinates defining the available area.
 * @param {boolean} editModeIsActive - Indicates whether the edit mode is active.
 * @param {Object} config - Custom configuration for available area. 
 * @returns a GeoJsonLayer if availableArea and editModeIsActive are valid; otherwise, returns undefined.
 */

export const availableAreaLayer = (
    availableArea: BboxEnclosedPoints | null,
    editModeIsActive: boolean,
    config?: object,
) => {
    // Check if availableArea is provided and edit mode is active
    if (availableArea && editModeIsActive) {
        // Create and return a new GeoJsonLayer
        return new GeoJsonLayer({
            id: AVAILABLE_AREA_LAYER_ID,
            data: {
                type: AVAILABLE_AREA_LAYER_FEATURE_COLLECTION_TYPE,
                features: [
                    {
                        type: AVAILABLE_AREA_LAYER_FEATURE_TYPE,
                        properties: { name: AVAILABLE_AREA_LAYER_FEATURE_NAME },
                        geometry: {
                            type: AVAILABLE_AREA_LAYER_GEOMETRY_TYPE,
                            coordinates: [availableArea] // Coordinates defining the polygon
                        }
                    }
                ]
            } as GeoJSON.FeatureCollection,
            stroked: AVAILABLE_AREA_LAYER_STROKED,
            filled: AVAILABLE_AREA_LAYER_FILLED,
            pointRadiusMinPixels: AVAILABLE_AREA_LAYER_POINT_RADIUS_MIN_PIXELS,
            pointRadiusMaxPixels: AVAILABLE_AREA_LAYER_POINT_RADIUS_MAX_PIXELS,
            pickable: AVAILABLE_AREA_LAYER_PICKABLE,
            getFillColor: AVAILABLE_AREA_LAYER_FILL_COLOR,
            getLineColor: AVAILABLE_AREA_LAYER_LINE_COLOR,
            lineWidthMinPixels: AVAILABLE_AREA_LAYER_LINE_WIDTH_MIN_PIXELS,
            lineWidthMaxPixels: AVAILABLE_AREA_LAYER_LINE_WIDTH_MAX_PIXELS,
            getLineWidth: AVAILABLE_AREA_LAYER_LINE_WIDTH,
            getDashArray: AVAILABLE_AREA_LAYER_DASH_ARRAY,
            dashJustified: AVAILABLE_AREA_LAYER_DASH_JUSTIFIED,
            dashGapPickable: AVAILABLE_AREA_LAYER_DASH_GAP_PICKABLE,
            extensions: AVAILABLE_AREA_LAYER_EXTENSIONS,
            ...config
        });
    }
};