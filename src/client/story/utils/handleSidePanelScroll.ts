import { StoryPanelLayout } from '../enums/enum.story.panelLayout';

/**
 * Handles scrolling in the side panel to determine the active section index.
 * Updates the active section index based on the scroll position and the target section index.
 *
 * @param event - The scroll event from the side panel.
 * @param sidePanelRef - Reference to the side panel DOM element.
 * @param panelLayoutMode - The current layout mode of the panel (e.g., SINGLE, HORIZONTAL).
 * @param jumpTargetSectionIndex - The section index to jump to, if any.
 * @param setActiveSectionIndex - Function to update the active section index.
 * @param setJumpTargetSectionIndex - Function to reset the jump target section index.
 * @param onStepChange - Optional callback fired when the active section changes.
 */
export function handleSidePanelScroll(
	event: React.UIEvent<HTMLDivElement>,
	sidePanelRef: React.RefObject<HTMLDivElement | null>,
	panelLayoutMode: StoryPanelLayout,
	jumpTargetSectionIndex: number | null,
	setActiveSectionIndex: (index: number) => void,
	setJumpTargetSectionIndex: (value: number | null) => void,
	onStepChange?: (section: number) => void
) {
	// Exit early if the side panel reference is not available or in SINGLE layout mode
	if (!sidePanelRef?.current || panelLayoutMode === StoryPanelLayout.SINGLE) return;

	// Get all child nodes of the side panel
	const nodes = Array.from(sidePanelRef.current.childNodes) as HTMLElement[];
	const reachedBottom =
		sidePanelRef.current.offsetHeight + sidePanelRef.current.scrollTop >= sidePanelRef.current.scrollHeight - 10;

	nodes.forEach((node, index) => {
		// Check if the node is in the viewport
		const inViewport =
			node.offsetTop - 100 <= event.currentTarget.scrollTop &&
			node.offsetTop + node.offsetHeight - 100 > event.currentTarget.scrollTop;

		if (!inViewport) return; // Skip if the node is not in the viewport

		if (jumpTargetSectionIndex === null) {
			// If not jumping, set the active section based on scroll position
			if (reachedBottom) {
				setActiveSectionIndex(nodes.length - 1);
				onStepChange?.(nodes.length - 1);
			} else {
				setActiveSectionIndex(index);
				onStepChange?.(index);
			}
		} else {
			// If jumping to a specific section
			setActiveSectionIndex(jumpTargetSectionIndex);
			onStepChange?.(jumpTargetSectionIndex);
			const jumpedToBottom = jumpTargetSectionIndex === nodes.length - 1;
			const jumpReached =
				nodes[jumpTargetSectionIndex].offsetTop > event.currentTarget.scrollTop - 5 &&
				nodes[jumpTargetSectionIndex].offsetTop < event.currentTarget.scrollTop + 5;

			// Reset jump target if conditions are met
			if ((reachedBottom && jumpedToBottom) || jumpReached) {
				setJumpTargetSectionIndex(null);
			}
		}
	});
}
