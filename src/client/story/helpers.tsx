import React from 'react';

/** Returns only main panel children from the story children. */
export function getMainPanelChildren(children: React.ReactNode, StorySidePanel: any) {
	return React.Children.toArray(children).filter(
		(child) => React.isValidElement(child) && child.type !== StorySidePanel
	);
}

/** Returns only side panel children from the story children. */
export function getSidePanelChildren(children: React.ReactNode, StorySidePanel: any) {
	return React.Children.toArray(children).filter(
		(child) => React.isValidElement(child) && child.type === StorySidePanel
	);
}

/** Calculates swipe velocity and direction. */
export function getSwipeInfo(startX: number, endX: number, startTime: number, endTime: number) {
	const deltaX = endX - startX;
	const deltaTime = endTime - startTime;
	const velocity = Math.abs(deltaX) / (deltaTime || 1);
	return { deltaX, velocity };
}

/** Renders only the active section, hides others. */
export function renderActiveSection(
	children: React.ReactNode,
	activeStep: number,
	wrapperStyle?: React.CSSProperties,
	childProps?: any
) {
	const arr = React.Children.toArray(children);
	return arr.map((child, idx) =>
		idx === activeStep ? (
			<div key={idx} style={{ width: '100%', height: '100%', ...wrapperStyle }}>
				{React.isValidElement(child) ? React.cloneElement(child, { ...childProps }) : child}
			</div>
		) : null
	);
}
