import { Nullable } from "../../(shared)/coding/code.types"

/**
 * Function type that represents map feature interaction
 */
export type FeatureInteractionFunc = (
    propertiesEntity: Nullable<any>,
    coordinatesEntity: Nullable<[number, number]>
) => void

/**
 * One of all possible map or feature interactions
 */
export type OneOfInteractionFunc = FeatureInteractionFunc // ... | OtherHandlerType etc.
