import React from 'react';

/**
 * Renders only the active section from the provided children.
 * Hides all other sections based on the active step index.
 *
 * @param children - The child elements to render, typically sections of a story.
 * @param activeStep - The index of the currently active section to display.
 * @param wrapperStyle - Optional styles to apply to the wrapper of the active section.
 * @param childProps - Additional props to pass to the active child element.
 *
 * @returns A JSX element containing the active section or null if none is active.
 */
export function renderActiveSection(
	children: React.ReactNode,
	activeStep: number,
	wrapperStyle?: React.CSSProperties,
	childProps?: any
) {
	// Convert children to an array for easier indexing
	const arr = React.Children.toArray(children);

	return arr.map(
		(child, idx) =>
			// Render only the active section
			idx === activeStep ? (
				<div key={idx} style={{ width: '100%', height: '100%', ...wrapperStyle }}>
					{/* Clone the child element to pass additional props if it's a valid React element */}
					{React.isValidElement(child) ? React.cloneElement(child, { ...childProps }) : child}
				</div>
			) : null // Return null for non-active sections
	);
}
