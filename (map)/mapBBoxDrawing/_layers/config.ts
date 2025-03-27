import { PathStyleExtension } from "@deck.gl/extensions";

// Define individual configuration properties for availableAreaLayer
export const AVAILABLE_AREA_LAYER_ID: string = 'mapBBoxDrawing-availableArea';
export const AVAILABLE_AREA_LAYER_FEATURE_COLLECTION_TYPE: string = "FeatureCollection";
export const AVAILABLE_AREA_LAYER_FEATURE_TYPE: string = "Feature";
export const AVAILABLE_AREA_LAYER_FEATURE_NAME: string = "availableArea-lines";
export const AVAILABLE_AREA_LAYER_GEOMETRY_TYPE: string = "Polygon";
export const AVAILABLE_AREA_LAYER_STROKED: boolean = true;
export const AVAILABLE_AREA_LAYER_FILLED: boolean = true;
export const AVAILABLE_AREA_LAYER_POINT_RADIUS_MIN_PIXELS: number = 4;
export const AVAILABLE_AREA_LAYER_POINT_RADIUS_MAX_PIXELS: number = 8;
export const AVAILABLE_AREA_LAYER_PICKABLE: boolean = true;
export const AVAILABLE_AREA_LAYER_FILL_COLOR: [number, number, number, number] = [0, 128, 0, 0];
export const AVAILABLE_AREA_LAYER_LINE_COLOR: [number, number, number] = [0, 0, 0];
export const AVAILABLE_AREA_LAYER_LINE_WIDTH_MIN_PIXELS: number = 0.8;
export const AVAILABLE_AREA_LAYER_LINE_WIDTH_MAX_PIXELS: number = 2;
export const AVAILABLE_AREA_LAYER_LINE_WIDTH: number = 100;
export const AVAILABLE_AREA_LAYER_DASH_ARRAY: [number, number] = [200, 500];
export const AVAILABLE_AREA_LAYER_DASH_JUSTIFIED: boolean = true;
export const AVAILABLE_AREA_LAYER_DASH_GAP_PICKABLE: boolean = true;
export const AVAILABLE_AREA_LAYER_EXTENSIONS: PathStyleExtension[] = [new PathStyleExtension({ dash: true })];

// Define individual configuration properties for bboxLayer
export const BBOX_LAYER_ID: string = 'bboxLayer';
export const BBOX_LAYER_FEATURE_COLLECTION_TYPE: string = "FeatureCollection";
export const BBOX_LAYER_FEATURE_TYPE: string = "Feature";
export const BBOX_LAYER_FEATURE_NAME_POLYGON: string = "bboxLayer-polygon";
export const BBOX_LAYER_FEATURE_NAME_POINT: string = "bboxLayer-point";
export const BBOX_LAYER_GEOMETRY_TYPE_POLYGON: string = "Polygon";
export const BBOX_LAYER_GEOMETRY_TYPE_POINT: string = "Point";
export const BBOX_LAYER_GEOMETRY_TYPE_MULTILINESTRING: string = "MultiLineString";
export const BBOX_LAYER_FILLED: boolean = true;
export const BBOX_LAYER_POINT_TYPE: string = 'circle';
export const BBOX_LAYER_POINT_RADIUS_MIN_PIXELS: number = 3.5;
export const BBOX_LAYER_POINT_RADIUS_MAX_PIXELS: number = 4;
export const BBOX_LAYER_PICKABLE: boolean = true;
export const BBOX_LAYER_JUSTIFIED: boolean = true;
export const BBOX_LAYER_LINE_WIDTH_MIN_PIXELS_EDIT_MODE: number = 4.5;
export const BBOX_LAYER_LINE_WIDTH_MIN_PIXELS_DEFAULT: number = 1.5;
export const BBOX_LAYER_LINE_WIDTH_MAX_PIXELS: number = 16;
export const BBOX_LAYER_POINT_RADIUS: number = 1000;
export const BBOX_LAYER_DASH_ARRAY_EDIT_MODE: [number, number] = [10, 3];
export const BBOX_LAYER_DASH_ARRAY_DEFAULT: [number, number] = [0, 0]; // Dashed lines in edit mode
export const BBOX_LAYER_DASH_JUSTIFIED: boolean = true;
export const BBOX_LAYER_DASH_GAP_PICKABLE: boolean = true;
export const BBOX_LAYER_EXTENSIONS: PathStyleExtension[] = [new PathStyleExtension({ dash: true })]; // Enable dash extension
export const BBOX_LAYER_LINE_WIDTH_EDIT_MODE: number = 100000;
export const BBOX_LAYER_LINE_WIDTH_DEFAULT: number = 1.5;
export const BBOX_LAYER_COLOR_BLOCKED: [number, number, number] = [224, 74, 74]; // Red color when blocked
export const BBOX_LAYER_COLOR_TRANSPARENT: [number, number, number, number] = [0, 0, 0, 0]; // Transparent for lines
export const BBOX_LAYER_COLOR_EDIT_MODE: [number, number, number] = [0, 127, 255]; // Blue in edit mode
export const BBOX_LAYER_COLOR_DEFAULT: [number, number, number] = [0, 0, 0]; // Black otherwise
export const BBOX_LAYER_FILL_COLOR_EDIT_MODE: [number, number, number, number] = [0, 127, 255, 60]; // Fill color in edit mode
export const BBOX_LAYER_FILL_COLOR_EDIT_MODE_BLOCKED: [number, number, number, number] = [224, 74, 74, 60]; // Fill color in edit mode
export const BBOX_LAYER_FILL_COLOR_DEFAULT: [number, number, number, number] = [190, 190, 190, 40]; // Default fill color
export const BBOX_LAYER_FILL_COLOR_DEFAULT_BLOCKED: [number, number, number, number] = [224, 74, 74, 30]; // Default fill color