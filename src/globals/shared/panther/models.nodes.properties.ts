/**
 * Entity that has relevant time interval.
 * Example: Period is connected to some time range.
 */
export interface HasInterval {
	validUtcIntervalIso: string;
	validFrom: number;
	validTo: number;
}

/**
 * Entity that has a specific name.
 */
export interface HasSpecificName {
	specificName: string;
}

/**
 * Entity with custom configuration
 */
export interface HasConfiguration extends HasBands {
	configuration?: Partial<DatasourceConfiguration>; // For now we use this for datasource configuration
}

/**
 * Entity with url
 */
export interface HasUrl {
	url: string; // JSON string
}

/**
 * Entity with custom configuration
 */
export interface HasNeighbours {
	neighbours: string[]; // JSON string
}

/**
 * Entity with custom configuration and neighbours.
 */
export interface HasConfigurationAndNeighbours extends HasConfiguration, HasNeighbours {}

/**
 * Place node - somewhere in the world
 */
export interface HasGeometry {
	geometry: any;
	bbox: any;
}

/**
 * Place node - somewhere in the world
 */
export interface HasLevels {
	level: number;
}

/**
 * This interface defines the structure for datasource configurations,
 */
export interface DatasourceConfiguration {
	cogBitmapOptions: {
		useChannel: number; // TODO Band name to use for rendering against deprecated `cogBitmapOptions.useChannel`
	};
	geojsonOptions: {
		selectionStyle: {
			distinctColours: string[];
			distinctItems: boolean;
			maxSelectionCount: number;
		};
	};
}

/**
 * Entity that has bands, e.g. satellite imagery
 */
export interface HasBands {
	bands?: number[];
	bandNames?: string[];
	bandPeriods?: string[];
}
