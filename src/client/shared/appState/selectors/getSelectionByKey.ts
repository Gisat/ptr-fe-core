import { Selection } from '../../models/models.selections';
import { AppSharedState } from '../state.models';

/**
 * Returns the selection object from state.selections for the specified selectionKey.
 *
 * This selector searches the selections array in the shared application state
 * and returns the selection object that matches the provided selectionKey.
 *
 * @param {AppSharedState} state - The shared application state.
 * @param {string} selectionKey - The unique key identifying the selection.
 * @returns {Selection | undefined} The selection object if found, otherwise undefined.
 */
export const getSelectionByKey = (state: AppSharedState, selectionKey: string): Selection | undefined => {
	// Find and return the selection object with the matching key
	return state.selections.find((selection) => selection && selection.key === selectionKey);
};
