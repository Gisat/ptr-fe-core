import { Table } from '@mantine/core';
import { TableRow } from './TableRow';
import { TableRowData, TableTools } from '../Table';

/**
 * TableContent props.
 * @property data - Array of row data, each with cell values and details.
 * @property tools - Optional React node or function for rendering row tools.
 * @property expandable - If true, rows can be expanded to show details.
 * @property expandButtonTooltip - Tooltip text for the expand/collapse button.
 */
export type TableContentProps = {
	data: TableRowData[];
	tools?: TableTools;
	expandable?: boolean;
	expandButtonTooltip?: string;
};

/**
 * TableContent renders all table rows.
 *
 * @param {TableProps} props - The props for the TableContent component.
 * @returns {JSX.Element} The rendered table body with all rows.
 */
export const TableContent: React.FC<TableContentProps> = ({ data, tools, expandable, expandButtonTooltip }) => (
	<Table.Tbody>
		{data.map((row, idx) => (
			<TableRow key={idx} data={row} tools={tools} expandable={expandable} expandButtonTooltip={expandButtonTooltip} />
		))}
	</Table.Tbody>
);
