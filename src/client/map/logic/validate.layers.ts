import { UsedDatasourceLabels } from '../../shared/panther/enums.panther';
import { Datasource } from '../../shared/panther/models.nodes';

/**
 * Validates datasource node for required fields
 * @param source Data source node
 * @param requiredDatasourceType Expected datasource type
 * @param requireUrl Do we require URL in configuration?
 */
export const validateDatasource = (
	source: Datasource,
	requiredDatasourceType: UsedDatasourceLabels,
	requireUrl: boolean
) => {
	const { key, configuration, labels } = source;

	// datasource node validation
	if (!labels.includes(requiredDatasourceType))
		throw new Error(`Datasource error: Label of ${requiredDatasourceType} is required`);

	if (!configuration) throw new Error(`Datasource error: ${requiredDatasourceType} requires congfiguration`);

	const configurationJs = typeof configuration === 'string' ? JSON.parse(configuration) : configuration;

	if (!key) throw new Error(`Datasource error: ${requiredDatasourceType} requires key`);

	if (requireUrl && !configurationJs.url)
		throw new Error(`Datasource error: ${requiredDatasourceType} requires URL in configuration`);

	return { configurationJs, source };
};
