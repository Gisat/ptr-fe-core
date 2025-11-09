/**
 * Handles scrolling up.
 * @param {HTMLElement[]} sidePanelNodes - The list of side panel nodes.
 * @param {number | undefined} activeStep - The currently active step.
 * @param {React.RefObject<HTMLDivElement>} sidePanelRef - Reference to the side panel.
 */
export const handleScrollUp = (
	sidePanelNodes: HTMLElement[],
	activeStep: number | undefined,
	sidePanelRef: React.RefObject<HTMLDivElement>,
	isSmallScreen?: boolean,
	setActiveStep?: (step: number) => void
) => {
	if (isSmallScreen && setActiveStep && activeStep! > 0) {
		setActiveStep(activeStep! - 1);
	} else {
		for (const [index, node] of sidePanelNodes.entries()) {
			if (node === sidePanelNodes[activeStep!] && activeStep! > 0) {
				sidePanelRef?.current?.scrollTo({
					top: sidePanelNodes[index - 1].offsetTop,
				});
			}
			break;
		}
	}
};
