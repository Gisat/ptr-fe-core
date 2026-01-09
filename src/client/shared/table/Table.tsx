import { TableContent } from './_components/TableContent';
import { TableHeader } from './_components/TableHeader';
import { TableRowProps } from './_components/TableRow';
import { Table } from '@mantine/core';

/**
 * Table header definition.
 */
export type HeaderType = { key: string; nameDisplay?: string };

/**
 * Generic TableComponent props.
 */
export type TableProps<T extends Record<string, unknown>> = {
	data: Array<T>;
	className?: string;
	expandable?: boolean;
	expandableSectionKey?: string;
	expandButtonTooltip?: string;
	headers?: Array<HeaderType>;
	tools?: React.ReactNode | ((data: TableRowProps['data']) => React.ReactNode);
};

/**
 * Extracts headers from data if not provided.
 *
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
 * @param {Array<T>} data - The table data.
 * @param {Array<HeaderType>} headers - The table headers.
 * @param {string} expandableSectionKey - The key for expandable details.
 * @returns {Array<{ values: Array<{ value: unknown; key: string }>; details: Record<string, unknown> }>} The mapped rows.
 */
const extractRows = <T extends Record<string, unknown>>(
	data: Array<T>,
	headers: Array<HeaderType>,
	expandableSectionKey: string
): Array<{ values: Array<{ value: unknown; key: string }>; details: Record<string, unknown> }> =>
	data.map((item) => ({
		values: headers.map((header) => ({
			value: item[header.key],
			key: header.key,
		})),
		details:
			item[expandableSectionKey] &&
			typeof item[expandableSectionKey] === 'object' &&
			!Array.isArray(item[expandableSectionKey])
				? (item[expandableSectionKey] as Record<string, unknown>)
				: {},
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
	expandableSectionKey = 'details',
	expandButtonTooltip = 'Show details',
	tools,
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
		<Table className={className} highlightOnHover striped horizontalSpacing="sm" withTableBorder>
			<TableHeader data={computedHeaders} />
			<TableContent data={rows} tools={tools} expandable={expandable} expandButtonTooltip={expandButtonTooltip} />
		</Table>
	);
};
