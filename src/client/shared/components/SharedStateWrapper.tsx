import React, { Dispatch } from 'react';
import { AppSharedState } from '../appState/state.models';
import { OneOfStateActions } from '../appState/state.models.actions';
import { SharedStateContext, SharedStateDispatchContext } from '../appState/state.context';
import { Nullable } from '../../../globals/shared/coding/code.types';

interface SharedStateWrapperProps {
	children: any;
	sharedState: AppSharedState;
	sharedStateDispatchFunction: Dispatch<Nullable<OneOfStateActions>>;
}

export const SharedStateWrapper: React.FC<SharedStateWrapperProps> = ({
	children,
	sharedState,
	sharedStateDispatchFunction,
}: SharedStateWrapperProps) => (
	<SharedStateContext.Provider value={sharedState}>
		<SharedStateDispatchContext.Provider value={sharedStateDispatchFunction}>
			{children}
		</SharedStateDispatchContext.Provider>
	</SharedStateContext.Provider>
);

export default SharedStateWrapper;
