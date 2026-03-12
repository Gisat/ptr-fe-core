import React from 'react';
import { Button, Stack } from '@mantine/core';
import { DrawingMode } from './_logic/polygonDrawingTypes';
import { IconPencil, IconTrash, IconCircle, IconPolygon } from '@tabler/icons-react';

interface ControlButtonsProps {
	isClosed: boolean;
	onClear: () => void;
	onToggleActive: () => void;
	isActive: boolean;
	mode: DrawingMode;
	setMode: (mode: DrawingMode) => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({isClosed, onClear, onToggleActive, isActive, mode, setMode}) => {
	return (
		<Stack style={{position: 'absolute', top: 20, right: 20, zIndex: 100}}>
			{!isActive && !isClosed && (
				<Button.Group>
					<Button
						variant={mode === 'polygon' ? 'filled' : 'light'}
						onClick={() => setMode('polygon')}
						leftSection={<IconPolygon size={16}/>}
					>Polygon</Button>
					<Button
						variant={mode === 'circle' ? 'filled' : 'light'}
						onClick={() => setMode('circle')}
						leftSection={<IconCircle size={16}/>}
					>Circle</Button>
				</Button.Group>
			)}

			<Button
				onClick={onToggleActive}
				color={isActive ? 'red' : 'blue'}
				leftSection={<IconPencil size={16}/>}
			>
				{isActive ? (isClosed ? 'Stop Editing' : 'Stop Drawing') : (isClosed ? (mode === 'polygon' ? 'Edit Polygon' : 'Edit Circle') : 'Start Drawing')}
			</Button>
			<Button
				onClick={onClear}
				color="gray"
				leftSection={<IconTrash size={16}/>}
			>
				Clear
			</Button>
		</Stack>
	);
};
