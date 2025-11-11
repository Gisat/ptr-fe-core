import React, { useMemo } from 'react';
import { SegmentedControl } from '@mantine/core';
import { IconMap, IconTextCaption } from '@tabler/icons-react';
import { StoryPanelType } from '../../enums/enum.story.panelType';
import './StoryPanelToggle.css';

/**
 * Props for the StoryPanelToggle component.
 */
interface StoryPanelToggleProps {
	/** The currently selected panel type */
	value: StoryPanelType;
	/** Callback function to handle panel type changes */
	onChange: (v: StoryPanelType) => void;
	/** Optional additional class name for styling */
	className?: string;
}

/**
 * StoryPanelToggle Component
 *
 * This component provides a toggle switch for selecting between different story panel types.
 * It uses a segmented control to allow users to switch between the side and main panels.
 *
 * @param {StoryPanelToggleProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StoryPanelToggle component.
 */
export const StoryPanelToggle: React.FC<StoryPanelToggleProps> = ({ value, onChange, className }) => {
	const data = useMemo(
		() => [
			{
				value: StoryPanelType.SIDE,
				label: (
					<span className="ptr-StoryPanelToggle-icon">
						<IconTextCaption size={20} />
					</span>
				),
			},
			{
				value: StoryPanelType.MAIN,
				label: (
					<span className="ptr-StoryPanelToggle-icon">
						<IconMap size={20} />
					</span>
				),
			},
		],
		[]
	);

	return (
		<div className={`ptr-StoryPanelToggle ${className}`}>
			<SegmentedControl
				value={value}
				onChange={(val) => onChange(val as StoryPanelType)}
				data={data}
				fullWidth
				color="var(--base500)"
				classNames={{
					root: 'ptr-StoryPanelToggle-segmented',
					label: 'ptr-StoryPanelToggle-label',
					control: 'ptr-StoryPanelToggle-control',
				}}
				aria-label="Panel switch"
			/>
		</div>
	);
};
