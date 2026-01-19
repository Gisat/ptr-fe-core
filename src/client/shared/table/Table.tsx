import { Table } from '@mantine/core';
import { TableContent } from './_components/TableContent';
import { TableHeader } from './_components/TableHeader';

import './Table.css';

/**
 * Table header definition.
 * @property key - The column key.
 * @property nameDisplay - Optional display name for the column.
 */
export type HeaderType = { key: string; nameDisplay?: string };

/**
 * Table row values: array of objects with value and key.
 * Each object represents a cell in the row.
 * @property value - The cell value (string, number, or React node).
 * @property key - The column key for this cell.
 */
export type TableRowValues = { value: string | number | React.ReactNode; key: string }[];

/**
 * Table row details: record of string keys to string | number | React.ReactNode.
 * Used for expandable details section.
 * @example
 * {
 *   description: "Extra info",
 *   count: 5
 * }
 */
export type TableRowDetails = Record<string, string | number | React.ReactNode>;

/**
 * Table row data: values and details.
 * @property values - The main row cell values.
 * @property details - The expandable details for the row.
 * @property isExpanded - Whether the row is expanded (optional).
 */
export type TableRowData = {
	values: TableRowValues;
	details: TableRowDetails;
	isExpanded?: boolean;
};

/**
 * Table row tools: React node or function returning a React node for a row.
 * Used to render custom controls or actions for each row.
 */
export type TableRowTools = React.ReactNode | ((data: TableRowData) => React.ReactNode);

/**
 * Generic TableComponent props.
 * @template T - The type of each row in the table data.
 * @property data - The array of row data objects.
 * @property className - Optional CSS class for the table.
 * @property expandable - If true, enables expandable rows.
 * @property highlightOnHover - If true, highlights rows on hover.
 * @property expandableSectionKey - The key in data objects for expandable details.
 * @property expandButtonTooltip - Tooltip text for the expand button.
 * @property headers - Optional array of header definitions.
 * @property rowTools - Optional custom tools for each row.
 * @property onExpandButtonClick - Optional callback when a row is expanded/collapsed.
 */
export type TableProps<T extends Record<string, unknown>> = {
	data: Array<T>;
	className?: string;
	expandable?: boolean;
	highlightOnHover?: boolean;
	expandableSectionKey?: string;
	expandButtonTooltip?: string;
	headers?: Array<HeaderType>;
	rowTools?: TableRowTools;
	onExpandButtonClick?: (data: TableRowData, expanded: boolean) => void;
};

/**
 * Extracts headers from data if not provided.
 *
 * @template T
 * @param {Array<T>} data - The table data.
 * @param {string} expandableSectionKey - The key for expandable details.
 * @param {boolean} expandable - If the table has expandable rows.
 * @returns {Array<HeaderType>} The extracted headers.
 */
const extractHeaders = <T extends Record<string, unknown>>(
	data: Array<T>,
	expandableSectionKey: string,
	expandable: boolean
): Array<HeaderType> =>
	data.reduce((acc: HeaderType[], item) => {
		Object.keys(item).forEach((key) => {
			const alreadyExists = acc.find((h) => h.key === key);
			const isDetailsKey = key === expandableSectionKey && expandable;
			if (!alreadyExists && !isDetailsKey) {
				acc.push({ key, nameDisplay: key.charAt(0).toUpperCase() + key.slice(1) });
			}
		});
		return acc;
	}, []);

/**
 * Maps data to row values and details.
 *
 * @template T
 * @param {Array<T>} data - The table data.
 * @param {Array<HeaderType>} headers - The table headers.
 * @param {string} expandableSectionKey - The key for expandable details.
 * @returns {TableRowData[]} The mapped rows.
 */
const extractRows = <T extends Record<string, unknown>>(
	data: Array<T>,
	headers: Array<HeaderType>,
	expandableSectionKey: string
): TableRowData[] =>
	data.map((item) => ({
		values: headers.map((header) => ({
			value: item[header.key] as string | number | React.ReactNode,
			key: header.key,
		})),
		details:
			item[expandableSectionKey] &&
			typeof item[expandableSectionKey] === 'object' &&
			!Array.isArray(item[expandableSectionKey])
				? (item[expandableSectionKey] as TableRowDetails)
				: {},
		isExpanded: item['isExpanded'] as boolean,
	}));

/**
 * TableComponent renders a table with optional expandable rows and custom tools.
 *
 * - Uses headers from props if provided, otherwise extracts from data.
 * - Supports expandable rows with details.
 * - Tools can be rendered in the last column.
 *
 * @template T - The type of each row in the table data.
 * @param {TableProps<T>} props - The props for the TableComponent.
 * @returns {JSX.Element} The rendered table.
 */
export const TableComponent = <T extends Record<string, unknown>>({
	data,
	className,
	headers,
	expandable = false,
	highlightOnHover = true,
	expandableSectionKey = 'details',
	expandButtonTooltip = 'Show details',
	rowTools,
	onExpandButtonClick,
}: TableProps<T>) => {
	// Use provided headers or extract from data
	let computedHeaders: Array<HeaderType> = [];
	if (headers && headers.length > 0) {
		computedHeaders = headers;
	} else if (data.length > 0) {
		computedHeaders = extractHeaders(data, expandableSectionKey, expandable);
	}

	// Prepare rows for rendering
	const rows = data && data.length > 0 ? extractRows(data, computedHeaders, expandableSectionKey) : [];

	return (
		<Table className={className} highlightOnHover={highlightOnHover} striped horizontalSpacing="sm" withTableBorder>
			<TableHeader data={computedHeaders} />
			<TableContent
				data={rows}
				tools={rowTools}
				expandable={expandable}
				expandButtonTooltip={expandButtonTooltip}
				onExpandButtonClick={onExpandButtonClick}
			/>
		</Table>
	);
};
