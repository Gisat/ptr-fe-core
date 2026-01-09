import { formatCellValue } from './TableRow';
import React from 'react';

/**
 * Props for TableDetails component.
 */
export type TableDetailsProps = {
	data: Record<string, unknown>;
};

/**
 * TableDetails component renders the details of a table row.
 *
 * @param {TableDetailsProps} props - The props for the TableDetails component.
 * @returns {JSX.Element} The rendered TableDetails component.
 */
export const TableDetails: React.FC<TableDetailsProps> = ({ data }) => {
	/**
	 * Renders a single detail item.
	 *
	 * @param {string} name - The name of the detail item.
	 * @returns {JSX.Element} The rendered detail item.
	 */
	const renderDetailItem = (name: string) => (
		<div key={name}>
			<span>
				<b>{name.charAt(0).toUpperCase() + name.slice(1)}</b>: {formatCellValue(data[name])}
			</span>
		</div>
	);

	const names = Object.keys(data);

	return <div>{names.map(renderDetailItem)}</div>;
};
