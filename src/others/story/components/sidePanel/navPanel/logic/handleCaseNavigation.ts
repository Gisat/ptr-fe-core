import React from 'react';

/**
 * Renders the "Case" navigation icon.
 * @param {number} index - The index of the navigation step.
 * @param {number | undefined} activeStep - The currently active step.
 * @param {(e: React.MouseEvent) => void} onClick - The click handler for the icon.
 * @param {React.ReactNode} [customIcon] - A custom icon to render instead of the default.
 * @param {(names: string[]) => string} classes - A function to generate class names.
 * @param {React.ReactNode} DefaultIcon - The default icon component to render.
 * @returns {React.ReactNode} The rendered "Case" icon.
 */
export const handleCaseNavigation = (
	index: number,
	activeStep: number | undefined,
	onClick: (e: React.MouseEvent) => void,
	classes: (names: string[]) => string,
	DefaultIcon: React.ReactNode,
	customIcon?: React.ReactNode
): React.ReactNode => {
	if (customIcon) {
		return React.cloneElement(customIcon as React.ReactElement<any>, {
			key: index,
			className: classes(['ptr-StoryNavPanelIcon', 'default-case', activeStep === index ? 'is-active' : '']),
			onClick,
		});
	} else {
		return React.cloneElement(DefaultIcon as React.ReactElement<any>, {
			key: index,
			className: classes(['ptr-StoryNavPanelIcon', 'default-case', activeStep === index ? 'is-active' : '']),
			onClick,
		});
	}
};
