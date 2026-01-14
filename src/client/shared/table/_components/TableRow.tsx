import React, { useEffect, useState } from 'react';
import { ActionIcon, Group, Table, Tooltip } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { TableDetails } from './TableDetails';
import { TableRowData, TableRowTools } from '../Table';

/**
 * Props for TableRow component.
 * @property data - Row data, including cell values and details for expansion.
 * @property tools - Optional React node or function for rendering row tools/actions.
 * @property expandable - If true, row can be expanded to show details.
 * @property expandButtonTooltip - Tooltip text for the expand/collapse button.
 * @property onExpandButtonClick - Optional callback when a row is expanded or collapsed.
 */
export type TableRowProps = {
	data: TableRowData;
	tools?: TableRowTools;
	expandable?: boolean;
	expandButtonTooltip?: string;
	onExpandButtonClick?: (data: TableRowData, expanded: boolean) => void;
};

/**
 * Formats a cell value for rendering in the table.
 *
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
 * @returns {JSX.Element} The rendered table row and (if expanded) its details row.
 */
export const TableRow: React.FC<TableRowProps> = ({
	data,
	tools,
	expandable,
	expandButtonTooltip,
	onExpandButtonClick,
}) => {
	const [isExpanded, setIsExpanded] = useState(data.isExpanded || false);

	useEffect(() => {
		setIsExpanded(data.isExpanded || false);
	}, [data.isExpanded]);

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
	 * Renders the expand/collapse button for expandable rows.
	 * @returns {JSX.Element} The rendered expand/collapse button.
	 */
	const renderExpandButton = () => (
		<Tooltip label={expandButtonTooltip} openDelay={500}>
			<ActionIcon
				radius="md"
				size="md"
				variant="subtle"
				onClick={() => {
					setIsExpanded(!isExpanded);
					onExpandButtonClick?.(data, !isExpanded);
				}}
			>
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
	 * Renders the expanded details row below the main row.
	 * @returns {JSX.Element} The rendered expanded details row.
	 */
	const renderExpandedRow = () => (
		<Table.Tr className={'ptr-TableRow-details'}>
			<Table.Td colSpan={data.values.length + 1} w="100%">
				<TableDetails data={data.details} />
			</Table.Td>
		</Table.Tr>
	);

	return (
		<>
			<Table.Tr className={`ptr-TableRow ${isExpanded ? 'is-expanded' : ''}`}>
				{data.values.map(renderCell)}
				{(expandable || tools) && renderTools()}
			</Table.Tr>
			{isExpanded && renderExpandedRow()}
		</>
	);
};
