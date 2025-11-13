import { ApplicationNode, Datasource, HasLevels, PantherEntity } from '@gisatcz/ptr-be-core/browser';
import { RenderingLayer } from './models.layers';

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
		applicationNode &&
		(typeof applicationNode.configuration === 'string'
			? JSON.parse(applicationNode.configuration)
			: applicationNode.configuration);

	if (configurationJs) {
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
	}

	// If there is no configuration, we assume that all datasources are not active and have level 0
	// TODO: better conversion of datasources to rendering layers. Maybe not here? We need a style as well.
	else {
		return datasourceNodes.map((datasource) => {
			const renderingLayer: RenderingLayer = {
				datasource,
				key: datasource.key, // TODO: handle layer key
				isActive: false,
				level: 0, // TODO: Other default?
				interaction: null, // TODO: Other default?
			};

			return renderingLayer;
		});
	}
};
