export type PolygonCoordinate = [number, number];
export type PolygonCoordinates = PolygonCoordinate[];

export interface PolygonDragInfo {
	object: any;
	coordinate: PolygonCoordinate;
	index: number;
}

export interface PolygonClickInfo {
    coordinate: PolygonCoordinate;
    object?: any;
    layer?: any;
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

