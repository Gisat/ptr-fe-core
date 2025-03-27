import { Dispatch } from "react";
import { AppSharedState } from "../_appState/state.models";
import { OneOfStateActions } from "../_appState/state.models.actions";
import { SharedStateContext, SharedStateDispatchContext } from "../_appState/state.context";
import { Nullable } from "../coding/code.types";

interface SharedStateWrapperProps{
    children: any,
    sharedState: AppSharedState,
    sharedStateDispatchFunction: Dispatch<Nullable<OneOfStateActions>>
}

export const SharedStateWrapper: React.FC<SharedStateWrapperProps> = ({
    children,
    sharedState,
    sharedStateDispatchFunction
}: SharedStateWrapperProps) =>
    <SharedStateContext.Provider value={sharedState}>
        <SharedStateDispatchContext.Provider value={sharedStateDispatchFunction}>
            {children}
        </SharedStateDispatchContext.Provider>
    </SharedStateContext.Provider>