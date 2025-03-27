import { Table } from "@mantine/core";
import { TableRow } from "./TableRow";
import { JSX } from "react";

type TableProps = {
    data: Array<{
        values: Array<string>;
        details: object;
    }>;
}

/**
 * TableContent component renders the content of a table.
 *
 * @param {TableProps} props - The props for the TableContent component.
 * @param {Array<{values: Array<string>, details: Object}>} props.data - The data to be displayed in the table rows.
 * 
 * @returns {JSX.Element} The rendered TableContent component.
 */
export const TableContent: React.FC<TableProps> = ({ 
    data
}) => {

    /**
     * Renders a single table row.
     *
     * @param {Object} value - The data for the row.
     * @param {number} index - The index of the row.
     * @returns {JSX.Element} The rendered table row.
     */
    const renderRow = (value: { values: Array<string>; details: object }, index: number): JSX.Element => {
        return <TableRow data={value} key={index} />;
    }

    return (
        <Table.Tbody>
            {data.map(renderRow)}
        </Table.Tbody>
    )
};