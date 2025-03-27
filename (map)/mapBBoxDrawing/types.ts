export type Coordinate = [number, number];
export type BboxPoints = [Coordinate, Coordinate, Coordinate, Coordinate];
export type BboxPoint = Coordinate[];
export type BboxEnclosedPoints = [Coordinate, Coordinate, Coordinate, Coordinate, Coordinate];
export type BboxCornerPoints = [Coordinate, Coordinate];
export type BboxLinePoints = [Coordinate, Coordinate];

export interface GetCursorInfo {
    isDragging: boolean;
}

export interface bboxDragInfo {
	dragType?: string;
	coordinates: BboxLinePoints;
	originCoordinates?: Coordinate;
}

// Type for the info parameter in the onStartDragging function
export interface DragStartInfo {
    coordinate: Coordinate;
    object: {
        geometry: { coordinates: Array<Coordinate[]> };
    };
}

// Define the types for the info parameter in the various handlers
export interface ClickInfo {
    layer: { id: string };
    coordinate: Coordinate;
}

export interface HoverInfo {
    layer: { id: string };
    coordinate: Coordinate;
    object: {
        properties: { name: string };
        geometry: { coordinates: Coordinate[][] };
    };
}

// Type for the info parameter in the onDrag function
export interface DragInfo {
    coordinate: Coordinate;
    object: {
        properties: { name: string };
        geometry: { coordinates: BboxPoints };
    };
}

// Standalone type for ViewInfo
export interface ViewStateChangeInfo {
    viewState: {
        latitude: number;
        longitude: number;
    };
    oldViewState: {
        latitude: number;
        longitude: number;
    };
    interactionState: {
        isDragging: boolean;
        isZooming: boolean;
        isPanning: boolean;
    };
}