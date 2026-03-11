import React from 'react';
import { Button, Stack } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';

interface ControlButtonsProps {
    isClosed: boolean;
    onClear: () => void;
    onToggleActive: () => void;
    isActive: boolean;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({ isClosed, onClear, onToggleActive, isActive }) => {
    return (
        <Stack style={{ position: 'absolute', top: 20, right: 20, zIndex: 100 }}>
             <Button
                onClick={onToggleActive}
                color={isActive ? 'red' : 'blue'}
                leftSection={<IconPencil size={16} />}
             >
                {isActive ? (isClosed ? 'Stop Editing' : 'Stop Drawing') : (isClosed ? 'Edit Polygon' : 'Start Drawing')}
             </Button>
             <Button
                onClick={onClear}
                color="gray"
                leftSection={<IconTrash size={16} />}
             >
                Clear
             </Button>
        </Stack>
    );
};

