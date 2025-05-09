import { ErrorBehavior } from '../../shared/errors/enums.errorBehavior';
import { HttpStatusCode } from '../../shared/errors/enums.httpStatusCode';
import { BaseHttpError } from '../../shared/errors/models.error';
import { FaroConfigProps } from './models.faro';

/**
 * Check faro configuration parameters for empty values
 * @param faroProps Faro props creaef from uncertain sources (fetch, ENV, package.json)
 * @returns Checked and validated faro configuration properties
 */
export const parseFaroParameters = (faroProps: FaroConfigProps) => {
	if (!faroProps.appName)
		throw new BaseHttpError('Faro Config: App name is missing', HttpStatusCode.INTERNAL_SERVER_ERROR, ErrorBehavior.BE);

	if (!faroProps.environment)
		throw new BaseHttpError(
			'Faro Config: Environment is missing',
			HttpStatusCode.INTERNAL_SERVER_ERROR,
			ErrorBehavior.BE
		);

	if (!faroProps.faroUrl)
		throw new BaseHttpError('Faro Config: URL is missing', HttpStatusCode.INTERNAL_SERVER_ERROR, ErrorBehavior.BE);

	if (!faroProps.version)
		throw new BaseHttpError(
			'Faro Config: App version is missing',
			HttpStatusCode.INTERNAL_SERVER_ERROR,
			ErrorBehavior.BE
		);

	return faroProps;
};
