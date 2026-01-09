import React, { useState } from 'react';
import { ActionIcon, Group, Table, Tooltip } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { TableDetails } from './TableDetails';
import { TableContentProps } from './TableContent';

/**
 * TableRow props.
 * @property data - Row data, including cell values and details for expansion.
 * @property tools - Optional React node or function for rendering row tools.
 * @property expandable - If true, row can be expanded to show details.
 * @property expandButtonTooltip - Tooltip text for the expand/collapse button.
 */
export type TableRowProps = {
	data: TableContentProps['data'][number];
	tools?: React.ReactNode | ((data: TableRowProps['data']) => React.ReactNode);
	expandable?: boolean;
	expandButtonTooltip?: string;
};

/**
 * Formats a cell value for rendering.
 *
 * Handles undefined values, React elements, and other types.
 * - If value is undefined, returns 'unknown'.
 * - If value is a valid React element, returns it directly.
 * - Otherwise, converts value to string.
 *
 * @param value - The cell value.
 * @returns {React.ReactNode} The formatted cell value.
 */
export const formatCellValue = (value: unknown): React.ReactNode => {
	if (value === undefined) return 'unknown';
	if (React.isValidElement(value)) return value;
	return String(value);
};

/**
 * TableRow renders a single table row, with optional tools and expandable details.
 *
 * @param {TableRowProps} props - The props for the TableRow component.
 * @returns {JSX.Element} The rendered table row.
 */
export const TableRow: React.FC<TableRowProps> = ({ data, tools, expandable, expandButtonTooltip }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	/**
	 * Renders a single cell in the row.
	 * @param item - Cell data with value and key.
	 * @param index - Cell index.
	 * @returns {JSX.Element} The rendered table cell.
	 */
	const renderCell = (item: { value: unknown; key: string }, index: number) => (
		<Table.Td key={index}>{formatCellValue(item.value)}</Table.Td>
	);

	/**
	 * Renders the expand/collapse button.
	 * @returns {JSX.Element} The rendered expand/collapse button.
	 */
	const renderExpandButton = () => (
		<Tooltip label={expandButtonTooltip} openDelay={500}>
			<ActionIcon radius="md" size="md" variant="subtle" onClick={() => setIsExpanded(!isExpanded)}>
				{isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
			</ActionIcon>
		</Tooltip>
	);

	/**
	 * Renders the tools cell, including the expand button if applicable.
	 * @returns {JSX.Element} The rendered tools cell.
	 */
	const renderTools = () => (
		<Table.Td>
			<Group justify="end">
				{typeof tools === 'function' ? tools(data) : tools}
				{expandable && renderExpandButton()}
			</Group>
		</Table.Td>
	);

	/**
	 * Renders the expanded details row.
	 * @returns {JSX.Element} The rendered expanded details row.
	 */
	const renderExpandedRow = () => (
		<Table.Tr>
			<Table.Td colSpan={data.values.length + 1} w="100%">
				<TableDetails data={data.details} />
			</Table.Td>
		</Table.Tr>
	);

	return (
		<>
			<Table.Tr>
				{data.values.map(renderCell)}
				{(expandable || tools) && renderTools()}
			</Table.Tr>
			{isExpanded && renderExpandedRow()}
		</>
	);
};
