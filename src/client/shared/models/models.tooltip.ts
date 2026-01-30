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

/**
 * Supported tooltip behavior modes.
 */
export enum TooltipType {
	Native = 'native',
	Hover = 'hover',
	Click = 'click',
	Selection = 'selection',
}
