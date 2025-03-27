import { RenderingLayer } from "../../(shared)/_logic/models.layers";
import { ApplicationNode } from "../panther/models.nodes";

/**
 * Shared state of the application
 */
export interface AppSharedState {
    appNode: ApplicationNode, // context of the application from the backend
    renderingLayers: RenderingLayer[] // backend layers in rendering context
}
