import { Table } from '@mantine/core';
import { TableRow } from './TableRow';
import { TableRowData, TableRowTools } from '../Table';

/**
 * Props for TableContent component.
 * @property data - Array of row data, each with cell values and details.
 * @property tools - Optional React node or function for rendering custom tools/actions for each row.
 * @property expandable - If true, rows can be expanded to show additional details.
 * @property expandButtonTooltip - Tooltip text for the expand/collapse button.
 * @property onExpandButtonClick - Optional callback when a row is expanded or collapsed.
 */
export type TableContentProps = {
	data: TableRowData[];
	tools?: TableRowTools;
	expandable?: boolean;
	expandButtonTooltip?: string;
	onExpandButtonClick?: (data: TableRowData, expanded: boolean) => void;
};

/**
 * TableContent renders all table rows for the table body.
 *
 * @param {TableContentProps} props - The props for the TableContent component.
 * @returns {JSX.Element} The rendered table body with all rows.
 */
export const TableContent: React.FC<TableContentProps> = ({
	data,
	tools,
	expandable,
	expandButtonTooltip,
	onExpandButtonClick,
}) => (
	<Table.Tbody>
		{data.map((row, idx) => (
			<TableRow
				key={idx}
				data={row}
				tools={tools}
				expandable={expandable}
				expandButtonTooltip={expandButtonTooltip}
				onExpandButtonClick={onExpandButtonClick}
			/>
		))}
	</Table.Tbody>
);
