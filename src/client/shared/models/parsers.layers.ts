import { RenderingLayer } from './models.layers';
import { Datasource, ApplicationNode, PantherEntity } from '../../../globals/shared/panther/models.nodes';
import { HasLevels } from '../../../globals/shared/panther/models.nodes.properties';

/**
 * Parse backend datasource nodes into rendering layers usinf application configuration context (mainly layer tree)
 * @param datasourceNodes Panther datasource nodes for the application
 * @param applicationNode Application node from the Panther
 * @returns List of layers with full context needed to be rendered
 */
export const parseDatasourcesToRenderingLayers = (
	datasourceNodes: Datasource[],
	applicationNode: ApplicationNode
): RenderingLayer[] => {
	const configurationJs =
		typeof applicationNode.configuration === 'string'
			? JSON.parse(applicationNode.configuration)
			: applicationNode.configuration;

	if (datasourceNodes.length !== configurationJs?.layerTree?.length)
		throw new Error('Datasource Parsing: layerTree is different from datasource collection');

	// TODO validation
	const layertree = configurationJs?.layerTree as (PantherEntity & HasLevels)[];

	const mapped = layertree.map((layertreeElement) => {
		const equalDatasource = datasourceNodes.find((datasource) => datasource.key === layertreeElement.key);

		if (!equalDatasource) throw new Error('Datasource Parsing: missing datasource for layertree element');

		const renderingLayer: RenderingLayer = {
			datasource: equalDatasource,
			key: equalDatasource.key, // TODO: handle layer key
			isActive: true, // TODO: Other default? Handle this on the layer tree or on map itself?
			level: layertreeElement.level,
			interaction: null, // TODO: Other default?
		};

		return renderingLayer;
	});

	return mapped;

	// const sordedSources = webDatasources.sort(
	//     (a: Datasource, b: Datasource) => a.configuration["level"] - b.configuration["level"])

	// const parsed = sordedSources.map((source: Datasource) => {
	//     const mapped: RenderingLayer = {
	//         level: source.configuration["level"],
	//         isActive: true,
	//         datasource: source
	//     }

	//     return mapped
	// })

	// return parsed
};
