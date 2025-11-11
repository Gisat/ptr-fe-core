/**
 * Handles scrolling to a specific section.
 * @param {React.MouseEvent} e - The mouse event.
 * @param {HTMLElement[]} sidePanelNodes - The list of side panel nodes.
 * @param {HTMLElement[]} navPanelCasesNodes - The list of navigation panel nodes.
 * @param {number | undefined} activeStep - The currently active step.
 * @param {React.RefObject<HTMLDivElement>} sidePanelRef - Reference to the side panel.
 * @param {(section: number) => void} setJumpSection - Callback to set the section to jump to.
 */
export const handleSectionScroll = (
	e: React.MouseEvent,
	sidePanelNodes: HTMLElement[],
	navPanelCasesNodes: HTMLElement[],
	activeStep: number | undefined,
	sidePanelRef: React.RefObject<HTMLDivElement | null>,
	setJumpSection?: (section: number) => void,
	isSmallScreen?: boolean,
	setActiveStep?: (step: number) => void
) => {
	for (const [index, node] of navPanelCasesNodes.entries()) {
		if (node === e.currentTarget && activeStep !== index && setJumpSection) {
			if (!isSmallScreen) {
				sidePanelRef?.current?.scrollTo({
					top: sidePanelNodes[index].offsetTop,
				});
				setJumpSection(index);
				break;
			} else if (setActiveStep) {
				setActiveStep(index);
			}
		}
	}
};
