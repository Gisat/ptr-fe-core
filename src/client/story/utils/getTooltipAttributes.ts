/**
 * Tooltip attribute definition.
 * @property {string} key - Unique key for the attribute.
 * @property {string} [label] - Optional label for display.
 * @property {string|number} [value] - Value to display.
 * @property {string} [unit] - Optional unit for the value.
 * @property {number} [decimalPlaces] - Optional decimal places for number formatting.
 */
export interface TooltipAttribute {
	key: string;
	label?: string;
	value?: string | number;
	unit?: string;
	decimalPlaces?: number;
}

/**
 * Optional tooltip processing settings.
 * @property {string} [labelTemplate] - Template applied to all labels (supports [key] substitution).
 * @property {string[]} [excludeKeys] - Attribute keys to exclude from tooltip output.
 */
export interface TooltipAttributeOptions {
	labelTemplate?: string;
	excludeKeys?: string[];
}

/**
 * Maps feature properties to tooltip attributes based on settings.
 * Rounds numbers if decimalPlaces is specified.
 * Supports label substitution for [key] placeholders.
 *
 * @param {TooltipAttribute[]} attributes - Array of attribute settings.
 * @param {Record<string, any>} featureProperties - Properties of the hovered feature.
 * @param {TooltipAttributeOptions} [options] - Optional label/exclusion settings.
 * @returns {TooltipAttribute[]} Array of tooltip attributes to display.
 */
export function getTooltipAttributes(
	attributes: TooltipAttribute[],
	featureProperties: Record<string, any>,
	options?: TooltipAttributeOptions
): TooltipAttribute[] {
	const properties = featureProperties ?? {};
	const excludeKeys = new Set(options?.excludeKeys ?? []);
	const labelTemplate = options?.labelTemplate;

	return attributes
		.filter((attribute) => !excludeKeys.has(attribute.key))
		.map((attribute: TooltipAttribute) => {
			let value = properties[attribute.key];
			// Round value if decimalPlaces is specified and value is a number
			if (typeof value === 'number' && typeof attribute.decimalPlaces === 'number') {
				value = Number(value.toFixed(attribute.decimalPlaces));
			}

			let label = labelTemplate ?? attribute.label ?? '';
			if (typeof label === 'string') {
				label = label.replace(/\[([^\]]+)\]/g, (_, key) =>
					properties[key] != null ? String(properties[key]) : `[${key}]`
				);
			}

			return {
				key: attribute.key,
				label,
				value,
				unit: attribute.unit ?? '',
			};
		})
		.filter((attr) => attr.value !== undefined && attr.value !== null);
}
