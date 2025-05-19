import { isArray } from 'lodash';
import { UsedNodeLabels } from '../../../globals/shared/panther/enums.panther';
import { ApplicationNode, Datasource, FullPantherEntity } from '../../../globals/shared/panther/models.nodes';
import { Nullable } from '../../../globals/shared/coding/code.types';

/**
 * Parse and validate all types of backend nodes from panther response
 * @param data Anything from panther
 * @returns Sorted and validated nodes from the response
 */
export const parseNodesFromPanther = (data: unknown) => {
	if (!data) throw new Error('Panther Fetch: No data recived');

	if (!isArray(data)) throw new Error('Panther Fetch: Data must be an array of nodes');

	// TODO: Add more node types here
	const { applicationsNode, datasourceNodes } = (data as FullPantherEntity[]).reduce(
		(acc, node) => {
			if (node.labels.includes(UsedNodeLabels.Application)) {
				acc.applicationsNode = node as ApplicationNode;
			} else if (node.labels.includes(UsedNodeLabels.Datasource)) {
				acc.datasourceNodes.push(node as Datasource);
			}
			return acc;
		},
		{ applicationsNode: null as Nullable<ApplicationNode>, datasourceNodes: [] as Datasource[] }
	);

	if (!applicationsNode) throw new Error('Panther Fetch: Missing application node');

	return {
		applicationsNode: applicationsNode as ApplicationNode,
		datasourceNodes: datasourceNodes as Datasource[],
	};
};
