import { Table } from "@mantine/core";
import { JSX } from "react";

type TableProps = {
    data: Array<string>;
}

/**
 * TableHeader component renders the headers of a table.
 *
 * @param {TableProps} props - The props for the TableHeader component.
 * @param {Array<string>} props.data - The headers to be displayed in the table.
 * 
 * @returns {JSX.Element} The rendered TableHeader component.
 */
export const TableHeader: React.FC<TableProps> = ({ 
    data
}) => {

    /**
     * Renders a single table header.
     *
     * @param {string} value - The header value.
     * @returns {JSX.Element} The rendered table header.
     */
    const renderHeader = (value: string): JSX.Element => {
        return <Table.Th key={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</Table.Th>;
    }

    return (
        <Table.Thead>
            <Table.Tr>
                {data.map(renderHeader)}
            </Table.Tr>
        </Table.Thead>
    )
};