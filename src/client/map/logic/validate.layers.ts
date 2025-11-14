import { UsedDatasourceLabels } from '@gisatcz/ptr-be-core/browser';
import { DatasourceWithNeighbours } from '../../shared/models/models.metadata.js';

/**
 * Validates datasource node for required fields
 * @param source Data source node
 * @param requiredDatasourceType Expected datasource type
 * @param requireUrl Do we require URL in configuration?
 */
export const validateDatasource = (
	source: DatasourceWithNeighbours,
	requiredDatasourceType: UsedDatasourceLabels,
	requireUrl: boolean
) => {
	const { key, labels, url, configuration } = source;

	// datasource node validation
	if (!labels.includes(requiredDatasourceType))
		throw new Error(`Datasource error: Label of ${requiredDatasourceType} is required`);

	if (!key) throw new Error(`Datasource error: ${requiredDatasourceType} requires key`);

	if (requireUrl && !url) throw new Error(`Datasource error: ${requiredDatasourceType} requires URL`);

	const configurationJs =
		configuration && typeof configuration === 'string' ? JSON.parse(configuration) : configuration;

	return { url, source, configurationJs };
};
