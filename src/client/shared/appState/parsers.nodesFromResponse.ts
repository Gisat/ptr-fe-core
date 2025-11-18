import { isArray } from 'lodash';
import { NodeWithNeighbours, UsedNodeLabels } from '@gisatcz/ptr-be-core/browser';
import { FullPantherEntity, Nullable } from '@gisatcz/ptr-be-core/browser';
import {
	ApplicationNodeWithNeighbours,
	DatasourceWithNeighbours,
	FullPantherEntityWithNeighboursAsProp,
	PantherEntityWithNeighbours,
	PeriodWithNeighbours,
	PlaceWithNeighbours,
} from '../models/models.metadata';

/**
 * Get unique items from an array of objects based on a specific key
 * @param items Array of objects with a key property
 * @returns Array of unique objects based on the key property
 */
const uniqueItemsByKey = (items: { key: string }[]) => [...new Map(items.map((p) => [p.key, p])).values()];

/**
 * Parse and validate all types of backend nodes from panther response
 * @param data Anything from panther
 * @returns Sorted and validated nodes from the response
 */
export const parseNodesFromPanther = (data: unknown) => {
	if (!data) throw new Error('Panther Fetch: No data recived');

	if (!isArray(data)) throw new Error('Panther Fetch: Data must be an array of nodes');

	// TODO: Add more node types here
	// TODO: what if one of the main nodes is in neighbours as well?
	const { applicationsNode, datasourceNodes, layerNodes, placeNodes, styleNodes, periodNodes } = (
		data as FullPantherEntity[] | NodeWithNeighbours<FullPantherEntity>[]
	).reduce(
		(acc, node) => {
			let nodes: FullPantherEntity[] = [];

			// If the node is an object with a node and neighbours, we need to handle it differently
			if ('node' in node && isArray(node.neighbours)) {
				const nodeWithLinks = {
					...node.node,
					neighbours: node.neighbours.map((n) => n.key),
				};
				nodes = [nodeWithLinks, ...node.neighbours];
			}

			// If the node is a single FullPantherEntity, we can use it directly
			else {
				nodes = [node as FullPantherEntity];
			}

			// Iterate through each node and categorize it based on its labels
			nodes.forEach((n) => {
				if (n.labels.includes(UsedNodeLabels.Application)) {
					acc.applicationsNode = n as ApplicationNodeWithNeighbours;
				} else if (n.labels.includes(UsedNodeLabels.Datasource)) {
					acc.datasourceNodes.push(n as DatasourceWithNeighbours);
				} else if (n.labels.includes(UsedNodeLabels.Layer)) {
					acc.layerNodes.push(n as PantherEntityWithNeighbours);
				} else if (n.labels.includes(UsedNodeLabels.Place)) {
					acc.placeNodes.push(n as PlaceWithNeighbours);
				} else if (n.labels.includes(UsedNodeLabels.Style)) {
					acc.styleNodes.push(n as FullPantherEntityWithNeighboursAsProp);
				} else if (n.labels.includes(UsedNodeLabels.Period)) {
					acc.periodNodes.push(n as PeriodWithNeighbours);
				}
			});

			return acc;
		},
		{
			applicationsNode: null as Nullable<ApplicationNodeWithNeighbours>,
			datasourceNodes: [] as DatasourceWithNeighbours[],
			layerNodes: [] as PantherEntityWithNeighbours[],
			placeNodes: [] as PlaceWithNeighbours[],
			styleNodes: [] as FullPantherEntityWithNeighboursAsProp[],
			periodNodes: [] as PeriodWithNeighbours[],
		}
	);

	// Get unique items by key for each type of node
	return {
		applicationsNode: applicationsNode as ApplicationNodeWithNeighbours,
		datasourceNodes: uniqueItemsByKey(datasourceNodes) as DatasourceWithNeighbours[],
		layerNodes: uniqueItemsByKey(layerNodes) as PantherEntityWithNeighbours[],
		placeNodes: uniqueItemsByKey(placeNodes) as PlaceWithNeighbours[],
		styleNodes: uniqueItemsByKey(styleNodes) as FullPantherEntityWithNeighboursAsProp[],
		periodNodes: uniqueItemsByKey(periodNodes) as PeriodWithNeighbours[],
	};
};
