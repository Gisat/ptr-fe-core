/**
 * Handles scrolling up in the side panel.
 *
 * This function allows the user to scroll up to the previous section in the side panel.
 * It updates the active step if the screen is small and the setActiveStep function is provided.
 *
 * @param {HTMLElement[]} sidePanelNodes - The list of side panel nodes.
 * @param {number} activeStep - The currently active step.
 * @param {React.RefObject<HTMLDivElement>} sidePanelRef - Reference to the side panel.
 * @param {boolean} [isSmallScreen] - Flag indicating if the screen is small.
 * @param {function} [setActiveStep] - Function to set the active step.
 */
export const handleScrollUp = (
	sidePanelNodes: HTMLElement[],
	activeStep: number,
	sidePanelRef: React.RefObject<HTMLDivElement | null>,
	isSmallScreen?: boolean,
	setActiveStep?: (step: number) => void
) => {
	if (isSmallScreen && setActiveStep && activeStep > 0) {
		setActiveStep(activeStep - 1);
	} else {
		for (const [index, node] of sidePanelNodes.entries()) {
			if (node === sidePanelNodes[activeStep] && activeStep > 0) {
				sidePanelRef?.current?.scrollTo({
					top: sidePanelNodes[index - 1].offsetTop,
				});
				break;
			}
		}
	}
};
