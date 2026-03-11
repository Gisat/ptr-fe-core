export type PolygonCoordinate = [number, number];
export type PolygonCoordinates = PolygonCoordinate[];

export interface PolygonDragInfo {
	object: unknown;
	coordinate: PolygonCoordinate;
	index: number;
}

export interface PolygonClickInfo {
    coordinate: PolygonCoordinate;
    object?: unknown;
    layer?: unknown;
    index?: number;
}

export interface PolygonDragStartInfo {
    index: number;
    coordinate: PolygonCoordinate;
}

export interface PolygonGetCursorInfo {
    isHovering: boolean;
    isDragging: boolean;
}

