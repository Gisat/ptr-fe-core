import { TooltipType } from '../../../shared/models/models.tooltip';

/**
 * Resolves the effective tooltip type for a map layer.
 *
 * Priority rules:
 * 1. Explicit type from tooltipSettings takes precedence.
 * 2. If no explicit type and a CustomTooltip component is present -> Hover.
 * 3. Otherwise -> Native (let DeckGL handle it).
 *
 * Edge-case: if the resolved type is Native but a CustomTooltip component is
 * provided, upgrade to Hover so feature-info state is actually gathered.
 *
 * @param explicitType - The optional type field from tooltipSettings.
 * @param hasCustomTooltip - Whether a real React component is provided as CustomTooltip.
 * @returns The effective TooltipType to use for the layer.
 */
export function resolveTooltipType(explicitType: TooltipType | undefined, hasCustomTooltip: boolean): TooltipType {
	let tooltipType: TooltipType = explicitType ?? (hasCustomTooltip ? TooltipType.Hover : TooltipType.Native);

	// "Native" + custom component -> upgrade to Hover so the custom component gets rendered
	if (tooltipType === TooltipType.Native && hasCustomTooltip) {
		tooltipType = TooltipType.Hover;
	}

	return tooltipType;
}
