import React, { useMemo } from 'react';
import { SegmentedControl } from '@mantine/core';
import { IconMap, IconTextCaption } from '@tabler/icons-react';
import { StoryPanelType } from '../../enums/enum.story.panelType';
import './StoryPanelToggle.css';

interface StoryPanelToggleProps {
	value: StoryPanelType;
	onChange: (v: StoryPanelType) => void;
	className?: string;
}

export const StoryPanelToggle: React.FC<StoryPanelToggleProps> = ({ value, onChange }) => {
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
		<div className={'ptr-StoryPanelToggle'}>
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
