import { ActionIcon, Stack, Tooltip } from '@mantine/core';
import React, { cloneElement, isValidElement } from 'react';
import { IconCircleDashedPlus, IconEditOff, IconEdit, IconTrash } from '@tabler/icons-react';
import { BboxPoint, BboxPoints } from './types';
import { TooltipLabel } from './enum.bbox.tooltipLabel';
import './style.css';

// Default color for active icons used in control buttons
export const DEFAULT_ICON_ACTIVE_COLOR = '#007FFF';

interface ControlButtonsProps {
	isActive: boolean; // Indicates if the editing mode is active.
	activeBboxPoints: BboxPoints | BboxPoint | []; // Array of active bounding box points.
	setEditModeIsActive: (editModeIsActive: boolean) => void; // Function to set the edit mode state.
	clearPoints: () => void; // Function to clear the selected points.
	customStyles?: React.CSSProperties; // CSS properties for styles the component.
	CustomButtonsComponent?:
		| React.ReactElement<{
				handleEditToggle?: () => void;
				clearPoints?: () => void;
				isActive?: boolean;
				activePoints?: BboxPoints | BboxPoint | [];
		  }>
		| undefined; // Custom component for control buttons.
}

/**
 * Component that renders control buttons for editing and clearing bounding box points on a map.
 *
 * @param {ControlButtonsProps} props - The props for the component.
 * @returns {JSX.Element} The rendered control buttons component.
 */
const ControlButtons: React.FC<ControlButtonsProps> = ({
	isActive,
	activeBboxPoints,
	setEditModeIsActive,
	clearPoints,
	customStyles,
	CustomButtonsComponent,
}) => {
	/**
	 * Toggles the edit mode. If the edit mode is active and there is only one active bounding box point,
	 * it clears the points before toggling the edit mode.
	 */
	const handleEditToggle = () => {
		if (isActive && activeBboxPoints.length === 1) {
			clearPoints();
		}
		setEditModeIsActive(!isActive);
	};

	/**
	 * Returns the tooltip label based on the number of active bounding box points and the edit mode state.
	 *
	 * @returns {string} The tooltip label.
	 */
	const getTooltipLabel = () => {
		if (activeBboxPoints.length > 1) {
			return isActive ? TooltipLabel.STOP_EDITING : TooltipLabel.START_EDITING;
		}
		return isActive ? TooltipLabel.STOP_DRAWING : TooltipLabel.START_DRAWING;
	};

	/**
	 * Determines the icon to display based on the number of active bounding box points and the edit mode state.
	 *
	 * @returns {JSX.Element} The icon to display.
	 */
	const getEditIcon = () => {
		if (activeBboxPoints.length > 1) {
			if (isActive) {
				return <IconEditOff className="ptr-MapBBoxDrawing-ControlButtons-icons" />;
			} else {
				return <IconEdit className="ptr-MapBBoxDrawing-ControlButtons-icons" />;
			}
		} else {
			return (
				<IconCircleDashedPlus
					className="ptr-MapBBoxDrawing-ControlButtons-icons"
					color={isActive ? DEFAULT_ICON_ACTIVE_COLOR : undefined}
				/>
			);
		}
	};

	return (
		<>
			{CustomButtonsComponent && isValidElement(CustomButtonsComponent) ? (
				cloneElement(CustomButtonsComponent, {
					handleEditToggle,
					clearPoints,
					isActive,
					activePoints: activeBboxPoints,
				})
			) : (
				<Stack className="ptr-MapBBoxDrawing-ControlButtons" style={customStyles}>
					<Tooltip label={getTooltipLabel()}>
						<ActionIcon
							className="ptr-MapBBoxDrawing-ControlButtons-addBtn"
							variant="default"
							onClick={handleEditToggle}
						>
							{getEditIcon()}
						</ActionIcon>
					</Tooltip>
					<Tooltip label={TooltipLabel.CLEAR_SELECTION}>
						<ActionIcon className="ptr-MapBBoxDrawing-ControlButtons-addBtn" variant="default" onClick={clearPoints}>
							<IconTrash className="ptr-MapBBoxDrawing-ControlButtons-icons" />
						</ActionIcon>
					</Tooltip>
				</Stack>
			)}
		</>
	);
};

export default ControlButtons;
