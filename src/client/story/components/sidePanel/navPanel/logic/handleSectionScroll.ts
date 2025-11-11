/**
 * Handles scrolling to a specific section in the side panel navigation.
 *
 * This function scrolls the side panel to the selected section or updates the active step
 * if on a small screen. It is triggered by clicking a navigation item.
 *
 * @param {React.MouseEvent} e - The mouse event from the navigation item.
 * @param {HTMLElement[]} sidePanelNodes - The list of side panel nodes.
 * @param {HTMLElement[]} navPanelCasesNodes - The list of navigation panel nodes.
 * @param {number} activeStep - The currently active step.
 * @param {React.RefObject<HTMLDivElement | null>} sidePanelRef - Reference to the side panel.
 * @param {(section: number) => void} [setJumpSection] - Callback to set the section to jump to.
 * @param {boolean} [isSmallScreen] - Flag indicating if the screen is small.
 * @param {(step: number) => void} [setActiveStep] - Function to set the active step.
 */
export const handleSectionScroll = (
	e: React.MouseEvent,
	sidePanelNodes: HTMLElement[],
	navPanelCasesNodes: HTMLElement[],
	activeStep: number,
	sidePanelRef: React.RefObject<HTMLDivElement | null>,
	setJumpSection?: (section: number) => void,
	isSmallScreen?: boolean,
	setActiveStep?: (step: number) => void
) => {
	for (const [index, node] of navPanelCasesNodes.entries()) {
		if (node === e.currentTarget && activeStep !== index) {
			if (isSmallScreen && setActiveStep) {
				// On small screens, update the active step directly
				setActiveStep(index);
			} else if (setJumpSection) {
				// Scroll to the selected section in the side panel
				sidePanelRef?.current?.scrollTo({
					top: sidePanelNodes[index].offsetTop,
				});
				setJumpSection(index);
				break;
			}
		}
	}
};
