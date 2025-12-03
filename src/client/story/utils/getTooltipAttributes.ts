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
 * Maps feature properties to tooltip attributes based on settings.
 * Rounds numbers if decimalPlaces is specified.
 *
 * @param {TooltipAttribute[]} attributes - Array of attribute settings.
 * @param {Record<string, any>} featureProperties - Properties of the hovered feature.
 * @returns {TooltipAttribute[]} Array of tooltip attributes to display.
 */
export function getTooltipAttributes(
	attributes: TooltipAttribute[],
	featureProperties: Record<string, any>
): TooltipAttribute[] {
	return attributes
		.map((attribute: TooltipAttribute) => {
			let value = featureProperties[attribute.key];
			// Round value if decimalPlaces is specified and value is a number
			if (typeof value === 'number' && typeof attribute.decimalPlaces === 'number') {
				value = Number(value.toFixed(attribute.decimalPlaces));
			}
			return {
				key: attribute.key,
				label: attribute.label ?? 'Value',
				value,
				unit: attribute.unit ?? '',
			};
		})
		.filter((attr) => attr.value !== undefined && attr.value !== null);
}
