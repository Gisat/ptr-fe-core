import { HasGeometry, HasInterval, HasLevels, HasConfiguration } from "./models.nodes.properties"
import { UsedNodeLabels, UsedDatasourceLabels } from "./enums.panther"
import { Nullable } from "../coding/code.types"

/**
 * General graph node - same for all metadatata entities
 */
export interface PantherEntity {
    labels: Array<string | UsedNodeLabels | UsedDatasourceLabels>,
    key: string
    nameDisplay: string,
    nameInternal: string,
    description: Nullable<string>,
    lastUpdatedAt: number,
}

/**
 * Place node - somewhere in the world
 */
export interface Place extends PantherEntity, HasGeometry { }

/**
 * Period node - selected time in timeline
 */
export interface Period extends PantherEntity, HasInterval { }

/**
 * Area tree node - tree of areas
 */
export interface AreaTreeLevel extends PantherEntity, HasLevels {}

/**
 * Datasource with source configuration
 */
export interface Datasource extends PantherEntity, HasConfiguration {}

/**
 * Application node - main entity in metadata model
 */
export interface ApplicationNode extends PantherEntity, HasConfiguration {}


/**
 * Represents a full panther entity which extends the basic PantherEntity
 * and optionally includes geometry, interval, levels, and configuration properties.
 * 
 * @extends PantherEntity
 * @extends Partial<HasGeometry>
 * @extends Partial<HasInterval>
 * @extends Partial<HasLevels>
 * @extends Partial<HasConfiguration>
 */
export interface FullPantherEntity extends PantherEntity, Partial<HasGeometry & HasInterval & HasLevels & HasConfiguration> { }