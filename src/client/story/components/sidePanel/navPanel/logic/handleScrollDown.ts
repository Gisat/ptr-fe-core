/**
 * Handles scrolling down.
 * @param {HTMLElement[]} sidePanelNodes - The list of side panel nodes.
 * @param {number | undefined} activeStep - The currently active step.
 * @param {React.RefObject<HTMLDivElement>} sidePanelRef - Reference to the side panel.
 */
export const handleScrollDown = (
	sidePanelNodes: HTMLElement[],
	activeStep: number | undefined,
	sidePanelRef: React.RefObject<HTMLDivElement>,
	isSmallScreen?: boolean,
	setActiveStep?: (step: number) => void
) => {
	for (const [index, node] of sidePanelNodes.entries()) {
		if (node === sidePanelNodes[activeStep!] && activeStep! < sidePanelNodes.length - 1) {
			if (!isSmallScreen) {
				sidePanelRef?.current?.scrollTo({
					top: sidePanelNodes[index + 1].offsetTop,
				});
			}
			break;
		} else if (setActiveStep) {
			setActiveStep(activeStep! + 1);
		}
	}
};
