import { Table } from '@mantine/core';
import React from 'react';

/**
 * Table header definition.
 * @property key - The key for the column.
 * @property nameDisplay - Optional display name for the column.
 */
type HeaderType = { key: string; nameDisplay?: string };

/**
 * Props for TableHeader component.
 * @property data - Array of header definitions for the table.
 */
type TableHeaderProps = {
	data: Array<HeaderType>;
};

/**
 * TableHeader renders the header row for a table.
 *
 * @param {TableHeaderProps} props - The props for the TableHeader component.
 * @returns {JSX.Element} The rendered table header.
 */
export const TableHeader: React.FC<TableHeaderProps> = ({ data }) => (
	<Table.Thead>
		<Table.Tr>
			{data.map(({ key, nameDisplay }) => (
				<Table.Th key={key}>{nameDisplay ? nameDisplay : key.charAt(0).toUpperCase() + key.slice(1)}</Table.Th>
			))}
		</Table.Tr>
	</Table.Thead>
);
