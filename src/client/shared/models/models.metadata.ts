import {
	ApplicationNode,
	Attribute,
	Place,
	Period,
	Datasource,
	PantherEntity,
	FullPantherEntity,
} from '@gisatcz/ptr-be-core/browser';

/**
 * A generic type that extends a given type `T` with an optional `neighbours` property.
 *
 * @template T - The base type to extend.
 * @property {string[] | undefined} neighbours - An optional array of neighbour identifiers.
 */
type WithNeighbours<T> = T & {
	neighbours?: string[];
};

/**
 * Represents an `ApplicationNode` extended with optional neighbours.
 */
export interface ApplicationNodeWithNeighbours extends WithNeighbours<ApplicationNode> {}

/**
 * Represents an `Attribute` extended with optional neighbours.
 */
export interface AttributeWithNeighbours extends WithNeighbours<Attribute> {}

/**
 * Represents a `Place` extended with optional neighbours.
 */
export interface PlaceWithNeighbours extends WithNeighbours<Place> {}

/**
 * Represents a `Period` extended with optional neighbours.
 */
export interface PeriodWithNeighbours extends WithNeighbours<Period> {}

/**
 * Represents a `Datasource` extended with optional neighbours.
 */
export interface DatasourceWithNeighbours extends WithNeighbours<Datasource> {}

/**
 * Represents a `PantherEntity` extended with optional neighbours.
 */
export interface PantherEntityWithNeighbours extends WithNeighbours<PantherEntity> {}

/**
 * Represents a `FullPantherEntity` extended with optional neighbours.
 */
export interface FullPantherEntityWithNeighboursAsProp extends WithNeighbours<FullPantherEntity> {}
