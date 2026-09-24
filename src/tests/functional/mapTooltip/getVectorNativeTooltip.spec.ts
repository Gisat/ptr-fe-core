import { getVectorNativeTooltip } from '../../../client/map/MapSet/MapTooltip/getVectorNativeTooltip';
import { TooltipType } from '../../../client/shared/models/models.tooltip';
import type { TooltipAttribute, VectorTooltipSettings } from '../../../client/shared/models/models.tooltip';

const buildInfo = (properties: Record<string, unknown>) => ({ x: 10, y: 20, object: { properties } });

const buildConfig = (tooltipSettings: Partial<VectorTooltipSettings>, extra: Record<string, unknown> = {}) => ({
	geojsonOptions: { tooltipSettings, ...extra },
});

/**
 * HTML for a tooltip built from a feature's properties. The fallback is an empty string
 * rather than `null` so a case that expects markup only has to assert on it.
 */
const getHtml = (
	properties: Record<string, unknown>,
	attributes: TooltipAttribute[],
	extra?: Record<string, unknown>
) =>
	getVectorNativeTooltip({
		info: buildInfo(properties) as any,
		config: buildConfig({ attributes }, extra),
		verticalOffset: 0,
	})?.html ?? '';

/**
 * A vector tooltip prints one row per configured attribute. These cases cover the row
 * markup the app's layers depend on, so a layer cannot silently lose a label, a unit or
 * the interpolation of its label.
 */
describe('getVectorNativeTooltip', () => {
	it('renders one row per attribute, with the label interpolated from the feature', () => {
		const html = getHtml({ DISTRICT: 'Lusaka', PROVINCE: 'Lusaka', area: 42 }, [
			{ key: 'DISTRICT', label: '[DISTRICT] ([PROVINCE])' },
			{ key: 'area', label: 'Area', unit: 'km²' },
		]);

		expect(html).toContain('Lusaka (Lusaka):');
		expect(html).toContain('Area:');
		expect(html).toContain('42 km²');
		expect(html.match(/ptr-NativeMapTooltip-row/g)).toHaveLength(2);
	});

	it('leaves a label placeholder in place when the feature lacks the property', () => {
		const html = getHtml({ DISTRICT: 'Lusaka' }, [{ key: 'DISTRICT', label: '[DISTRICT] ([PROVINCE])' }]);

		expect(html).toContain('Lusaka ([PROVINCE])');
	});

	/**
	 * A row's label is optional: leaving it out is how a tooltip shows one mapped value with
	 * its unit, without a caption the layer's name and legend already provide.
	 */
	it('renders a row without a label as the value and its unit alone', () => {
		const html = getHtml({ annual_burnt_pct_2025: 8.34 }, [
			{ key: 'annual_burnt_pct_2025', unit: '%', decimalPlaces: 1 },
		]);

		expect(html).toContain('<span class="ptr-NativeMapTooltip-value">8.3 %</span>');
		// No caption element, and so no colon dangling in front of the value.
		expect(html).not.toContain('ptr-NativeMapTooltip-label');
		expect(html).not.toContain(': 8.3');
	});

	it('keeps the label of a row that declares one', () => {
		const html = getHtml({ area: 42 }, [{ key: 'area', label: 'Area', unit: 'km²' }]);

		expect(html).toContain('<span class="ptr-NativeMapTooltip-label">Area:</span>');
		expect(html).toContain('42 km²');
	});

	it('handles only native tooltips, leaving the other types to getLayerTooltip', () => {
		const result = getVectorNativeTooltip({
			info: buildInfo({ a: 1 }) as any,
			config: buildConfig({ attributes: [{ key: 'a', label: 'A' }], type: TooltipType.Hover }),
			verticalOffset: 0,
		});

		expect(result).toBeNull();
	});

	it('does not build a tooltip at all when the layer disables them', () => {
		const result = getVectorNativeTooltip({
			info: buildInfo({ a: 1 }) as any,
			config: buildConfig({ attributes: [{ key: 'a', label: 'A' }] }, { disableTooltip: true }),
			verticalOffset: 0,
		});

		expect(result).toBeNull();
	});
});

/**
 * The swatch is opt-in per row, because a vector tooltip shows several values and only
 * some of them describe a mapped class. These cases pin that contract so a consumer
 * cannot find its colour ignored, or find a swatch on a row it did not ask for.
 */
describe('getVectorNativeTooltip - value swatch', () => {
	it('renders no swatch when the attribute declares no colour hook', () => {
		const html = getHtml({ Risk_Class: 'High' }, [{ key: 'Risk_Class', label: 'Flood Risk' }]);

		expect(html).not.toContain('ptr-NativeMapTooltip-swatch');
		expect(html).toContain('High');
	});

	it('renders the swatch in front of the value it belongs to', () => {
		const html = getHtml({ Risk_Class: 'High' }, [
			{
				key: 'Risk_Class',
				label: 'Flood Risk',
				resolveValueColor: ({ value }) => (value === 'High' ? '#d34d4d' : undefined),
			},
		]);

		expect(html).toContain(
			'<span class="ptr-NativeMapTooltip-value"><span class="ptr-NativeMapTooltip-swatch" style="background-color: #d34d4d"></span>High</span>'
		);
	});

	it('colours only the row that asked for it', () => {
		const html = getHtml({ Risk_Class: 'High', Risk_Index_Q100: 3.25 }, [
			{
				key: 'Risk_Class',
				label: 'Flood Risk',
				resolveValueColor: () => '#d34d4d',
			},
			{ key: 'Risk_Index_Q100', label: 'Q100 risk index', decimalPlaces: 2 },
		]);

		expect(html.match(/ptr-NativeMapTooltip-swatch/g)).toHaveLength(1);
	});

	it('hands the resolver the value as shown, after rounding', () => {
		const resolveValueColor = vi.fn(() => undefined);

		getHtml({ mean_ENT: 0.123456 }, [{ key: 'mean_ENT', label: 'Entropy Index', decimalPlaces: 2, resolveValueColor }]);

		expect(resolveValueColor).toHaveBeenCalledWith(expect.objectContaining({ value: 0.12 }));
	});

	it('hands the resolver the whole feature, for colours keyed on another property', () => {
		const resolveValueColor = vi.fn(() => '#8f1f1f');
		const properties = { pressure: 0.4, quadrant: 'Dual pressure' };

		getHtml(properties, [{ key: 'pressure', label: 'Degradation Pressure', decimalPlaces: 2, resolveValueColor }]);

		expect(resolveValueColor).toHaveBeenCalledWith(expect.objectContaining({ properties }));
	});

	it('renders no swatch when the resolver has no colour for the value', () => {
		const html = getHtml({ Risk_Class: 'Unknown' }, [
			{ key: 'Risk_Class', label: 'Flood Risk', resolveValueColor: () => undefined },
		]);

		expect(html).not.toContain('ptr-NativeMapTooltip-swatch');
		expect(html).toContain('Unknown');
	});

	it('renders no swatch for something that is not a CSS colour', () => {
		const html = getHtml({ Risk_Class: 'High' }, [
			{
				key: 'Risk_Class',
				label: 'Flood Risk',
				// Would break out of the style attribute if it were interpolated as-is.
				resolveValueColor: () => 'red" onmouseover="alert(1)',
			},
		]);

		expect(html).not.toContain('ptr-NativeMapTooltip-swatch');
		expect(html).not.toContain('onmouseover');
	});

	it('keeps the swatch on the value rather than on the label', () => {
		const html = getHtml({ Risk_Class: 'High' }, [
			{ key: 'Risk_Class', label: 'Flood Risk', resolveValueColor: () => 'rgba(1, 2, 3, 1)' },
		]);

		expect(html).toContain('Flood Risk:</span>');
		expect(html).toContain('background-color: rgba(1, 2, 3, 1)');
	});

	it('swatches a row that has no label', () => {
		const html = getHtml({ Risk_Class: 'High', Risk_Index_Q100: 3.25 }, [
			{ key: 'Risk_Class', resolveValueColor: () => '#d34d4d' },
		]);

		expect(html).toContain(
			'<span class="ptr-NativeMapTooltip-value"><span class="ptr-NativeMapTooltip-swatch" style="background-color: #d34d4d"></span>High</span>'
		);
	});

	it('does not build a tooltip at all when the layer disables them', () => {
		const result = getVectorNativeTooltip({
			info: buildInfo({ Risk_Class: 'High' }) as any,
			config: buildConfig({ attributes: [{ key: 'Risk_Class', label: 'Flood Risk' }] }, { disableTooltip: true }),
			verticalOffset: 0,
		});

		expect(result).toBeNull();
	});
});
