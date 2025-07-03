import { createContext, Dispatch } from 'react';
// import { defaultStateValue } from './state.defaults';

/**
 * Context for shared state in the application.
 */
export const SharedStateContext = createContext(null as unknown as any);

/**
 * Context for dispatching actions to update the shared state.
 * This is used to provide a dispatch function to components that need to update the state.
 */
export const SharedStateDispatchContext = createContext(null as unknown as Dispatch<any>);
