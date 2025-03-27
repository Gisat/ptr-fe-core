import { GeoJsonLayer } from "@deck.gl/layers";
import { FeatureCollection, Geometry } from 'geojson';
import { LAYER_ID_BBOX_LINES } from "../constants";
import {
    BBOX_LAYER_ID,
    BBOX_LAYER_FEATURE_COLLECTION_TYPE,
    BBOX_LAYER_FEATURE_TYPE,
    BBOX_LAYER_FEATURE_NAME_POLYGON,
    BBOX_LAYER_FEATURE_NAME_POINT,
    BBOX_LAYER_GEOMETRY_TYPE_POLYGON,
    BBOX_LAYER_GEOMETRY_TYPE_POINT,
    BBOX_LAYER_GEOMETRY_TYPE_MULTILINESTRING,
    BBOX_LAYER_FILLED,
    BBOX_LAYER_POINT_TYPE,
    BBOX_LAYER_POINT_RADIUS_MIN_PIXELS,
    BBOX_LAYER_POINT_RADIUS_MAX_PIXELS,
    BBOX_LAYER_PICKABLE,
    BBOX_LAYER_JUSTIFIED,
    BBOX_LAYER_LINE_WIDTH_MIN_PIXELS_EDIT_MODE,
    BBOX_LAYER_LINE_WIDTH_MIN_PIXELS_DEFAULT,
    BBOX_LAYER_LINE_WIDTH_MAX_PIXELS,
    BBOX_LAYER_POINT_RADIUS,
    BBOX_LAYER_DASH_ARRAY_EDIT_MODE,
    BBOX_LAYER_DASH_ARRAY_DEFAULT,
    BBOX_LAYER_DASH_JUSTIFIED,
    BBOX_LAYER_DASH_GAP_PICKABLE,
    BBOX_LAYER_EXTENSIONS,
    BBOX_LAYER_LINE_WIDTH_DEFAULT,
    BBOX_LAYER_LINE_WIDTH_EDIT_MODE,
    BBOX_LAYER_COLOR_BLOCKED,
    BBOX_LAYER_COLOR_TRANSPARENT,
    BBOX_LAYER_COLOR_EDIT_MODE,
    BBOX_LAYER_COLOR_DEFAULT,
    BBOX_LAYER_FILL_COLOR_EDIT_MODE,
    BBOX_LAYER_FILL_COLOR_DEFAULT,
    BBOX_LAYER_FILL_COLOR_EDIT_MODE_BLOCKED,
    BBOX_LAYER_FILL_COLOR_DEFAULT_BLOCKED
} from "./config";

/**
 * Creates a polygon feature for the bounding box layer.
 *
 * @param {Array<Array<number>>} points - The points of the polygon.
 * @returns {Object} The polygon feature.
 */
const createPolygonFeature = (points: Array<Array<number>>) => ({
    type: BBOX_LAYER_FEATURE_TYPE,
    properties: { name: BBOX_LAYER_FEATURE_NAME_POLYGON },
    geometry: { type: BBOX_LAYER_GEOMETRY_TYPE_POLYGON, coordinates: [points] }
});

/**
 * Creates a line feature for the bounding box layer.
 *
 * @param {Array<number>} firstPoint - The first point of the line.
 * @param {Array<number>} secondPoint - The second point of the line.
 * @returns {Object} The line feature.
 */
const createLineFeature = (firstPoint: Array<number>, secondPoint: Array<number>) => ({
    type: BBOX_LAYER_FEATURE_TYPE,
    properties: { name: LAYER_ID_BBOX_LINES },
    geometry: { type: BBOX_LAYER_GEOMETRY_TYPE_MULTILINESTRING, coordinates: [[firstPoint, secondPoint]] }
});

/**
 * Creates a point feature for the bounding box layer.
 *
 * @param {Array<number>} point - The point of the feature.
 * @returns {Object} The point feature.
 */
const createPointFeature = (point: Array<number>) => ({
    type: BBOX_LAYER_FEATURE_TYPE,
    properties: { name: BBOX_LAYER_FEATURE_NAME_POINT },
    geometry: { type: BBOX_LAYER_GEOMETRY_TYPE_POINT, coordinates: point }
});

/**
 * Creates a predicted polygon feature for the bounding box layer.
 *
 * @param {Array<Array<number>>} points - The points of the polygon.
 * @returns {Object} The predicted polygon feature.
 */
const createPredictedPolygonFeature = (points: Array<Array<number>>) => ({
    type: BBOX_LAYER_FEATURE_TYPE,
    properties: { name: BBOX_LAYER_FEATURE_NAME_POLYGON },
    geometry: { type: BBOX_LAYER_GEOMETRY_TYPE_POLYGON, coordinates: [points] }
});

/**
 * Interface for the bboxLayer function props.
 */
interface BboxLayerProps {
    /** An array of coordinates representing the bounding box points. */
    activeBboxPoints: Array<Array<number>>;
    /** Indicates whether the bounding box is currently hovered. */
    bboxIsHovered: string | boolean;
    /** Indicates whether the edit mode is active. */
    editModeIsActive: boolean;
    /** An array of predicted points that may be hovered. */
    predictedHoveredPoints: Array<Array<number> | undefined> | null;
    /** Custom configuration for bbox. */
    config?: object;
    /** Indicates whether the bounding box is within bounds. */
    bboxIsInBounds: boolean;
}

/**
 * Creates a bounding box layer for visualization.
 * 
 * @param {BboxLayerProps} props - The props for the bboxLayer function.
 * @returns {GeoJsonLayer} A GeoJsonLayer representing the bounding box.
 */
export const bboxLayer = ({
    activeBboxPoints,
    bboxIsHovered,
    editModeIsActive,
    predictedHoveredPoints,
    config,
    bboxIsInBounds
}: BboxLayerProps) => {

    /**
     * Creates features for the bounding box layer when there are multiple active bounding box points.
     * 
     * @returns {Array<Object>} An array of features for the bounding box layer.
     */
    const createMultiplePointsFeatures = () => {
        const polygonFeature = createPolygonFeature([...activeBboxPoints, activeBboxPoints[0]]);
        const lineFeatures = activeBboxPoints.map((activePoint: Array<number>, index: number) => {
            const firstPoint = activePoint;
            const secondPoint = activeBboxPoints?.[index + 1] || activeBboxPoints?.[0];
            return createLineFeature(firstPoint, secondPoint);
        });
        return [polygonFeature, ...lineFeatures];
    };

    /**
     * Creates features for the bounding box layer when there is a single active bounding box point.
     * 
     * @returns {Array<Object>} An array of features for the bounding box layer.
     */
    const createSinglePointFeatures = () => {
        const pointFeature = createPointFeature(activeBboxPoints?.[0]);
        const predictedFeatures = predictedHoveredPoints && predictedHoveredPoints.length > 0 
            ? [createPredictedPolygonFeature([...predictedHoveredPoints.filter(point => point !== undefined), predictedHoveredPoints[0]!])]
            : [];
        return [pointFeature, ...predictedFeatures];
    };

    const BBOX_LAYER_FEATURES = activeBboxPoints.length > 1 
        ? createMultiplePointsFeatures()
        : createSinglePointFeatures();

    // Create and return a new GeoJsonLayer
    return new GeoJsonLayer({
        id: BBOX_LAYER_ID,
        data: {
            type: BBOX_LAYER_FEATURE_COLLECTION_TYPE,
            features: BBOX_LAYER_FEATURES // Include features only if there are active bounding box points 
        } as FeatureCollection<Geometry>,
        filled: BBOX_LAYER_FILLED,
        pointType: BBOX_LAYER_POINT_TYPE,
        pointRadiusMinPixels: BBOX_LAYER_POINT_RADIUS_MIN_PIXELS,
        pointRadiusMaxPixels: BBOX_LAYER_POINT_RADIUS_MAX_PIXELS,
        pickable: BBOX_LAYER_PICKABLE,
        justified: BBOX_LAYER_JUSTIFIED,
        getFillColor: () => {
            if (editModeIsActive) {
                if (bboxIsHovered === "blocked" && predictedHoveredPoints || !bboxIsInBounds) {
                    return BBOX_LAYER_FILL_COLOR_EDIT_MODE_BLOCKED;
                } else {
                    return BBOX_LAYER_FILL_COLOR_EDIT_MODE;
                }
            } else {
                if (bboxIsHovered === "blocked" && predictedHoveredPoints || !bboxIsInBounds) {
                    return BBOX_LAYER_FILL_COLOR_DEFAULT_BLOCKED;
                } else {
                    return BBOX_LAYER_FILL_COLOR_DEFAULT;
                }
            }
        },
        getLineColor: (info: { properties: { name?: string } }) => {
            if (info.properties.name === "bboxLayer-lines") {
                return BBOX_LAYER_COLOR_TRANSPARENT; // Transparent for lines
            } else if (bboxIsHovered === "blocked" && predictedHoveredPoints || !bboxIsInBounds) {
                return BBOX_LAYER_COLOR_BLOCKED; // Red color when blocked
            } else {
                return editModeIsActive ? BBOX_LAYER_COLOR_EDIT_MODE : BBOX_LAYER_COLOR_DEFAULT; // Blue in edit mode, black otherwise
            }
        },
        lineWidthMinPixels: editModeIsActive ? BBOX_LAYER_LINE_WIDTH_MIN_PIXELS_EDIT_MODE : BBOX_LAYER_LINE_WIDTH_MIN_PIXELS_DEFAULT,
        lineWidthMaxPixels: BBOX_LAYER_LINE_WIDTH_MAX_PIXELS,
        getLineWidth: (info: { properties: { name?: string } }) => {
            return info.properties.name === LAYER_ID_BBOX_LINES
                ? (editModeIsActive ? BBOX_LAYER_LINE_WIDTH_EDIT_MODE : BBOX_LAYER_LINE_WIDTH_DEFAULT)
                : BBOX_LAYER_LINE_WIDTH_DEFAULT;
        },
        getPointRadius: BBOX_LAYER_POINT_RADIUS,
        getDashArray: editModeIsActive ? BBOX_LAYER_DASH_ARRAY_EDIT_MODE : BBOX_LAYER_DASH_ARRAY_DEFAULT,
        dashJustified: BBOX_LAYER_DASH_JUSTIFIED,
        dashGapPickable: BBOX_LAYER_DASH_GAP_PICKABLE,
        extensions: BBOX_LAYER_EXTENSIONS,
        ...config
    });
};