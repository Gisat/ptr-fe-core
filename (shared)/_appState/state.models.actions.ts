import { ApplicationNode, Datasource } from "../panther/models.nodes"


/**
 * When we set up application node
 */
export interface ActionSetApplicationNode {
    type: "appNode"
    payload: ApplicationNode
}

/**
 * When we set up metadata datasources
 */
export interface ActionChangeLayerSources {
    type: "fetchSources"
    payload: Datasource[]
}

/**
 * Activate or deactivate layer in render and status
 */
export interface ActionLayerActiveChange {
    type: "layerActiveChange",
    payload: { key: string, newValue: boolean }
}


/**
 * One of any of possible actions
 */
export type OneOfStateActions = ActionChangeLayerSources | ActionSetApplicationNode | ActionLayerActiveChange