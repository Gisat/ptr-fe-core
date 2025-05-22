import React, { JSX } from 'react';

type TableProps = {
	data: Record<string, any>;
};

/**
 * TableDetails component renders the details of a table row.
 *
 * @param {TableProps} props - The props for the TableDetails component.
 * @param {any} props.data - The details data to be displayed.
 *
 * @returns {JSX.Element} The rendered TableDetails component.
 */
export const TableDetails: React.FC<TableProps> = ({ data }) => {
	/**
	 * Renders a single detail item.
	 *
	 * @param {string} name - The name of the detail item.
	 * @returns {JSX.Element} The rendered detail item.
	 */
	const renderDetailItem = (name: string): JSX.Element => {
		return (
			<div key={name}>
				<span>
					<b>{name.charAt(0).toUpperCase() + name.slice(1)}</b>: {data[name] || 'unknown'}
				</span>
			</div>
		);
	};

	const names = Object.keys(data);

	return <div>{names.map(renderDetailItem)}</div>;
};
