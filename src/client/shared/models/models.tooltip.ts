/**
 * Defines the shape of a single attribute to be displayed in a map tooltip.
 */
export interface TooltipAttribute {
	key: string;
	label?: string;
	value?: string | number;
	unit?: string;
	decimalPlaces?: number;
}
