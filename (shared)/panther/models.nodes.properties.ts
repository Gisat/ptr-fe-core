/**
 * Entity that has relevant time interval.
 * Example: Period is connected to some time range.
 */
export interface HasInterval {
    validUtcIntervalIso: string,
    validFrom: number,
    validTo: number
}

/**
 * Entity with custom configuration
 */
export interface HasConfiguration {
    configuration: string | object // JSON string
}

/**
 * Place node - somewhere in the world
 */
export interface HasGeometry {
    geometry: any,
    bbox: any,
}

/**
 * Place node - somewhere in the world
 */
export interface HasLevels {
    level: number,
}