import { createContext, Dispatch } from 'react';
import { defaultStateValue } from './state.defaults';
import { AppSharedState } from './state.models';
import { OneOfStateActions } from './state.models.actions';

/**
 * Creates react context for shared application state
 */
export const SharedStateContext = createContext<AppSharedState>(defaultStateValue());

/**
 * Creates react context for shared state dispatch method
 */
export const SharedStateDispatchContext = createContext<Dispatch<OneOfStateActions>>(() => console.log('none'));
