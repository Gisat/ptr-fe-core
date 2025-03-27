"use client";

import { ActionIcon, Table, Tooltip } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { TableDetails } from "./TableDetails";
import React, { JSX, useState } from "react";

type TableProps = {
    data: {
        values: Array<string>;
        details: object;
    };
}

/**
 * TableRow component renders a row of the table with expandable details.
 *
 * @param {TableProps} props - The props for the TableRow component.
 * @param {Array<string>} props.data.values - The values to be displayed in the table row.
 * @param {Object} props.data.details - The details to be displayed when the row is expanded.
 * 
 * @returns {JSX.Element} The rendered TableRow component.
 */
export const TableRow: React.FC<TableProps> = ({ 
    data,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    /**
     * Renders a single table cell.
     *
     * @param {string} item - The cell value.
     * @param {number} index - The index of the cell.
     * @returns {JSX.Element} The rendered table cell.
     */
    const renderCell = (item: string, index: number): JSX.Element => {
        return (
            <React.Fragment key={index}>
                <Table.Td>
                    {item || "unknown"}
                </Table.Td>
                {index === data.values.length - 1 && renderExpandButton(index)}
            </React.Fragment>
        );
    }

    /**
     * Renders the expand button cell.
     *
     * @param {number} index - The index of the cell.
     * @returns {JSX.Element} The rendered expand button cell.
     */
    const renderExpandButton = (index: number): JSX.Element => {
        return (
            <Table.Td key={`details-${index}`}>
                <Tooltip label="Show details" openDelay={500}>
                    <ActionIcon radius="md" size="md" variant="subtle" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                    </ActionIcon>
                </Tooltip>
            </Table.Td>
        );
    }

    /**
     * Renders the expanded details row.
     *
     * @returns {JSX.Element} The rendered expanded details row.
     */
    const renderExpandedRow = (): JSX.Element => {
        return (
            <Table.Tr>
                <Table.Td colSpan={7}>
                    <TableDetails data={data.details} />
                </Table.Td>
            </Table.Tr>
        );
    }

    return (
        <>
            <Table.Tr>
                {data.values.map(renderCell)}
            </Table.Tr>
            {isExpanded && renderExpandedRow()}
        </>
    )
};