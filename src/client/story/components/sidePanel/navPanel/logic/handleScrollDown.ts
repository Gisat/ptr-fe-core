/**
 * Handles scrolling down in the side panel.
 *
 * This function allows the user to scroll down to the next section in the side panel.
 * It updates the active step if the screen is small and the setActiveStep function is provided.
 *
 * @param {HTMLElement[]} sidePanelNodes - The list of side panel nodes.
 * @param {number} activeStep - The currently active step.
 * @param {React.RefObject<HTMLDivElement>} sidePanelRef - Reference to the side panel.
 * @param {number} sidePanelChildrenCount - The total number of children in the side panel.
 * @param {boolean} [isSmallScreen] - Flag indicating if the screen is small.
 * @param {function} [setActiveStep] - Function to set the active step.
 */
export const handleScrollDown = (
	sidePanelNodes: HTMLElement[],
	activeStep: number,
	sidePanelRef: React.RefObject<HTMLDivElement | null>,
	sidePanelChildrenCount: number,
	isSmallScreen?: boolean,
	setActiveStep?: (step: number) => void
) => {
	if (isSmallScreen && setActiveStep && activeStep < sidePanelChildrenCount - 1) {
		setActiveStep(activeStep + 1);
	} else {
		for (const [index, node] of sidePanelNodes.entries()) {
			if (node === sidePanelNodes[activeStep!] && activeStep < sidePanelNodes.length - 1) {
				sidePanelRef?.current?.scrollTo({
					top: sidePanelNodes[index + 1].offsetTop,
				});
				break;
			}
		}
	}
};
