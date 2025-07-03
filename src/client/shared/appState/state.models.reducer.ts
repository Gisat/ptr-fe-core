import { AppSharedState } from "./state.models";

/**
 * Application specific action type.
 * Can be any action that will be added to the final reducer and state management.
 * It is used to extend the shared state with application specific actions.
 */
export type AppSpecificAction = {
    type: string | any;
    payload: any;
};

/**
 * Application specific reducer function type.
 * Can be any function that takes the current state and action,
 * and returns the new state.
 * It is used to extend the shared state with application specific reducers.
 */
export type AppSpecficReducerFunc<ApplicationSpecificState extends AppSharedState = AppSharedState> = (
    currentState: ApplicationSpecificState,
    action: AppSpecificAction
) => ApplicationSpecificState;

/**
 * Application specific reducer map.
 * It is a Map of action type and reducer function.
 * It is used to extend the shared state with application specific actions and reducers.
 * This type is used in final apps that use this NPM package.
 * It is used to create a reducer function that will handle the application specific actions.
 * The key is the action type and the value is the reducer function.
 */
export type AppSpecificReducerMap<ApplicationSpecificState extends AppSharedState = AppSharedState> =
    Map<string, AppSpecficReducerFunc<ApplicationSpecificState>>
