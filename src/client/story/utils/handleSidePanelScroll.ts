import { StoryPanelLayout } from '../enums/enum.story.panelLayout';

/**
 * Handle side panel scroll to determine active section index.
 */
export function handleSidePanelScroll(
	event: React.UIEvent<HTMLDivElement>,
	sidePanelDomRef: React.RefObject<HTMLDivElement> | undefined,
	panelLayoutMode: StoryPanelLayout,
	jumpTargetSectionIndex: number | null,
	setActiveSectionIndex: (index: number) => void,
	setJumpTargetSectionIndex: (value: number | null) => void,
	onStepChange?: (section: number) => void
) {
	if (!sidePanelDomRef?.current || panelLayoutMode === StoryPanelLayout.SINGLE) return;

	const nodes = Array.from(sidePanelDomRef.current.childNodes) as HTMLElement[];
	const reachedBottom =
		sidePanelDomRef.current.offsetHeight + sidePanelDomRef.current.scrollTop >=
		sidePanelDomRef.current.scrollHeight - 10;

	nodes.forEach((node, index) => {
		const inViewport =
			node.offsetTop - 100 <= event.currentTarget.scrollTop &&
			node.offsetTop + node.offsetHeight - 100 > event.currentTarget.scrollTop;

		if (!inViewport) return;

		if (jumpTargetSectionIndex === null) {
			if (reachedBottom) {
				setActiveSectionIndex(nodes.length - 1);
				onStepChange?.(nodes.length - 1);
			} else {
				setActiveSectionIndex(index);
				onStepChange?.(index);
			}
		} else {
			setActiveSectionIndex(jumpTargetSectionIndex);
			onStepChange?.(jumpTargetSectionIndex);
			const jumpedToBottom = jumpTargetSectionIndex === nodes.length - 1;
			const jumpReached =
				nodes[jumpTargetSectionIndex].offsetTop > event.currentTarget.scrollTop - 5 &&
				nodes[jumpTargetSectionIndex].offsetTop < event.currentTarget.scrollTop + 5;

			if ((reachedBottom && jumpedToBottom) || jumpReached) {
				setJumpTargetSectionIndex(null);
			}
		}
	});
}
