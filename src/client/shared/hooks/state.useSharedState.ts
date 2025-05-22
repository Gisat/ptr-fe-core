import { Dispatch, useContext } from 'react';
import { SharedStateContext, SharedStateDispatchContext } from '../appState/state.context';
import { AppSharedState } from '../appState/state.models';
import { OneOfStateActions } from '../appState/state.models.actions';

/**
 * React hook to use existing shared application state from context
 * @returns actual shared state and dispatch for shared state actions (tuple)
 */
export const useSharedState = (): [AppSharedState, Dispatch<OneOfStateActions>] => {
	// load actual state context
	const sharedState = useContext(SharedStateContext);

	// load shared state dispatch funtion
	const sharedStateDispatch = useContext(SharedStateDispatchContext);

	// validate all
	if (sharedState === undefined || sharedStateDispatch === undefined) {
		throw new Error('useSharedState must be used within a SharedStateProvider');
	}

	// return as a tuple
	return [sharedState, sharedStateDispatch];
};

export default useSharedState;
