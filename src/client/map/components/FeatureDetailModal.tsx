import { Modal, Table } from '@mantine/core';
import React from 'react';
import { Nullable } from '../../../globals/shared/coding/code.types';

/**
 * State of the modal window with feature detail
 */
export interface FeatureModalState<T> {
	isVisible: boolean;
	featureRecord: Nullable<T>;
}

/**
 * Props of the modal window with feature detail
 */
interface FeatureModalProps {
	isVisible: boolean;
	detailEntity: Nullable<any>;
	onCloseHandler: () => void;
}

/**
 * Modal window with map feature detail information
 * @param props
 * @returns
 */
const FeatureDetailModal: React.FC<FeatureModalProps> = (props: FeatureModalProps) => {
	const renderModalRows = () => {
		if (!props.detailEntity) return <></>;

		return Object.entries(props.detailEntity).map(([key, value]) => (
			<Table.Tr key={key}>
				<Table.Th>{key}</Table.Th>
				<Table.Td>{value as any}</Table.Td>
			</Table.Tr>
		));
	};

	return (
		<Modal opened={props.isVisible} onClose={props.onCloseHandler} title="Selected Point">
			<Table>
				<Table.Thead>{renderModalRows()}</Table.Thead>
			</Table>
		</Modal>
	);
};

export default FeatureDetailModal;
