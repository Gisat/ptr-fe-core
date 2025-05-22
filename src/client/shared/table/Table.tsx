import { TableContent } from './_components/TableContent';
import { TableHeader } from './_components/TableHeader';
import { Table } from '@mantine/core';
import React from 'react';

type TableProps = {
	data: Array<object>;
	detailsName: string;
};

/**
 * TableComponent renders a table with headers and content based on the provided data.
 *
 * @param {TableProps} props - The props for the TableComponent.
 * @param {Array<Object>} props.data - The data to be displayed in the table.
 * @param {string} props.detailsName - The name of the property that contains details for each row.
 *
 * @returns {JSX.Element} The rendered TableComponent.
 */
export const TableComponent: React.FC<TableProps> = ({ data, detailsName }) => {
	/**
	 * Extracts headers from the data.
	 *
	 * @param {Array<Object>} data - The data to extract headers from.
	 * @param {string} detailsName - The name of the property that contains details for each row.
	 * @returns {Array<string>} The extracted headers.
	 */
	const extractHeaders = (data: Array<object>, detailsName: string): Array<string> => {
		return data.reduce((acc: string[], item: any) => {
			Object.keys(item).forEach((key) => {
				if (!acc.includes(key) && key !== detailsName) {
					acc.push(key);
				}
			});
			return acc;
		}, []);
	};

	/**
	 * Extracts rows from the data.
	 *
	 * @param {Array<Object>} data - The data to extract rows from.
	 * @param {Array<string>} headers - The headers to use for extracting row values.
	 * @param {string} detailsName - The name of the property that contains details for each row.
	 * @returns {Array<{values: Array<string>, details: Object}>} The extracted rows.
	 */
	const extractRows = (
		data: Array<object>,
		headers: Array<string>,
		detailsName: string
	): Array<{ values: Array<string>; details: object }> => {
		return data.map((item: any) => {
			const values = headers.map((header) => item[header]);
			const details = item[detailsName];
			return { values, details };
		});
	};

	const headers = data && data.length > 0 ? extractHeaders(data, detailsName) : [];
	const rows = data && data.length > 0 ? extractRows(data, headers, detailsName) : [];

	return (
		<div>
			<Table highlightOnHover striped horizontalSpacing="sm" withTableBorder>
				<TableHeader data={headers} />
				<TableContent data={rows} />
			</Table>
		</div>
	);
};
