import { Dispatch, ReactNode } from 'react';
import { AppSharedState } from '../appState/state.models';
import { OneOfStateActions } from '../appState/state.models.actions';
import { SharedStateContext, SharedStateDispatchContext } from '../appState/state.context';

/**
 * Props for SharedStateWrapper component.
 * @template AppSpecificState - Type extending AppSharedState for customizing state structure
 * @template AppSpecificActions - Type for action objects, defaults to OneOfStateActions
 * @property {ReactNode} children - Child components to be wrapped
 * @property {AppSpecificState} sharedState - Application-specific state object
 * @property {Dispatch<AppSpecificActions>} sharedStateDispatchFunction - Dispatch function for state updates
 */
interface SharedStateWrapperProps<
	AppSpecificState extends AppSharedState,
	AppSpecificActions = OneOfStateActions
> {
	children: ReactNode;
	sharedState: AppSpecificState;
	sharedStateDispatchFunction: Dispatch<AppSpecificActions>;
}


/**
 * A wrapper component that provides shared state and dispatch functionality to its children
 * using React Context.
 * 
 * @template AppSpecificState - Type extending AppSharedState for application specific state
 * @template AppSpecificActions - Type for application specific actions, defaults to OneOfStateActions
 * 
 * @param props - Component props
 * @param props.children - Child components that will have access to the shared state
 * @param props.sharedState - The shared state object to be provided to children
 * @param props.sharedStateDispatchFunction - The dispatch function for updating shared state
 * 
 * @returns A component wrapped with shared state context providers
 * 
 * @example
 * ```tsx
 * <SharedStateWrapper
 *   sharedState={myState}
 *   sharedStateDispatchFunction={dispatch}
 * >
 *   <ChildComponent />
 * </SharedStateWrapper>
 * ```
 */
export function SharedStateWrapper<
	AppSpecificState extends AppSharedState,
	AppSpecificActions = OneOfStateActions
>({
	children,
	sharedState,
	sharedStateDispatchFunction,
}: SharedStateWrapperProps<AppSpecificState , AppSpecificActions>) {
	
	// // read application specific state context
	// // this will create a pair of contexts for shared state and its dispatch function
	// // we need to use these context providers to wrap the children components
	// const {
	// 	sharedStateContext: { Provider: SharedStateProvider },
	// 	sharedStateDispatchContext: { Provider: SharedStateDispatchProvider },
	// } = useApplicationSpecificStateContext<AppSpecificState, AppSpecificActions>();

	// prepare react component wrapper for shared state
	// this will provide the shared state and its dispatch function to all children components
	// using the SharedStateProvider and SharedStateDispatchProvider contexts
	return (
		<SharedStateContext value={sharedState}>
			<SharedStateDispatchContext value={sharedStateDispatchFunction}>
				{children}
			</SharedStateDispatchContext>
		</SharedStateContext>
	);
}

export default SharedStateWrapper;