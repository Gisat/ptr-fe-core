import { getCogNativeTooltip } from '../../../client/map/MapSet/MapTooltip/getCogNativeTooltip';

/**
 * Builds the minimal picking info `readCogPixelValues` needs: a 1x1 tile holding
 * one float channel plus the UV coordinate of the picked pixel.
 */
const buildInfo = (value: number) => ({
	x: 100,
	y: 50,
	uv: [0, 0],
	tile: { content: { raw: new Float32Array([value]), width: 1, height: 1 } },
});

const buildConfig = (tooltipSettings: Record<string, unknown>, extra: Record<string, unknown> = {}) => ({
	cogBitmapOptions: { useChannel: 1, tooltipSettings, ...extra },
});

const getHtml = (value: number, tooltipSettings: Record<string, unknown>, extra?: Record<string, unknown>) =>
	getCogNativeTooltip({ info: buildInfo(value), config: buildConfig(tooltipSettings, extra), verticalOffset: 0 })
		?.html ?? null;

/**
 * The raster tooltip prints the cell value unless the app can name it. These cases
 * pin the contract of the two app-owned hooks so a consumer cannot accidentally
 * find its label ignored, or its no-data cells reported as measurements.
 */
describe('getCogNativeTooltip', () => {
	it('shows the raw pixel value when the app supplies no rules', () => {
		const html = getHtml(10.25, {});

		expect(html).toContain('ptr-NativeMapTooltip-value');
		expect(html).toContain('10.25');
	});

	it('rounds the value to the configured number of decimals', () => {
		expect(getHtml(10.126, { decimalPlaces: 2 })).toContain('10.13');
		expect(getHtml(10.126, { decimalPlaces: 0 })).toContain('10');
	});

	it('appends the configured unit to the value', () => {
		expect(getHtml(10.126, { decimalPlaces: 2, unit: '%' })).toContain('10.13 %');
	});

	it('renders the title above the value', () => {
		const html = getHtml(1, { title: 'Land cover classes' });

		expect(html).toContain('ptr-NativeMapTooltip-title');
		expect(html).toContain('Land cover classes');
	});

	it('replaces the raw value with the app-supplied label', () => {
		const html = getHtml(11, {
			resolveValueLabel: (value: number) => (value === 11 ? 'Tree cover (closed)' : undefined),
		});

		expect(html).toContain('ptr-NativeMapTooltip-valueLabel');
		expect(html).toContain('Tree cover (closed)');
		// The code would only repeat what the label already says.
		expect(html).not.toContain('ptr-NativeMapTooltip-value"');
		expect(html).not.toContain('>11<');
	});

	it('falls back to the raw value when the resolver has no label for it', () => {
		const html = getHtml(50, { resolveValueLabel: () => undefined });

		expect(html).toContain('ptr-NativeMapTooltip-value');
		expect(html).toContain('50');
	});

	it('renders no tooltip for cells the app reports as no data', () => {
		const result = getCogNativeTooltip({
			info: buildInfo(0),
			config: buildConfig({ isNoDataValue: (value: number) => value === 0 }),
			verticalOffset: 0,
		});

		expect(result).toBeNull();
	});

	it('still renders a tooltip for cells the app keeps', () => {
		const result = getCogNativeTooltip({
			info: buildInfo(11),
			config: buildConfig({ isNoDataValue: (value: number) => value === 0 }),
			verticalOffset: 0,
		});

		expect(result?.html).toContain('11');
	});

	it('renders nothing when the layer disables tooltips', () => {
		const result = getCogNativeTooltip({
			info: buildInfo(11),
			config: buildConfig({ resolveValueLabel: () => 'Class' }, { disableTooltip: true }),
			verticalOffset: 0,
		});

		expect(result).toBeNull();
	});
});

/**
 * The settle delay is not part of this tooltip's markup: `getMapTooltip` reads
 * `hoverDelay` and hides the layer's section until the pointer settles, so the content
 * built here is the same whether or not a delay applies. That separation is what keeps
 * this function reusable for a COG layer that is not being delayed.
 */
describe('getCogNativeTooltip - settle delay', () => {
	it('builds the same content regardless of hoverDelay', () => {
		const immediate = getHtml(10, { decimalPlaces: 2 });
		const delayed = getHtml(10, { decimalPlaces: 2, hoverDelay: 300 });

		expect(delayed).toBe(immediate);
	});

	it('leaves the hiding to getMapTooltip, not to the content', () => {
		const html = getHtml(10, { decimalPlaces: 2, hoverDelay: 300 });

		expect(html).not.toContain('ptr-NativeMapTooltip-settle');
		expect(html).not.toContain('ptr-NativeMapTooltip-pendingSection');
	});
});

/**
 * A layer can colour its value so it can be matched to the map legend. The colour is
 * app-supplied, so it must not be able to break out of the markup it is written into.
 */
describe('getCogNativeTooltip - value swatch', () => {
	it('renders no swatch when the layer supplies no colour', () => {
		expect(getHtml(10, { decimalPlaces: 2 })).not.toContain('ptr-NativeMapTooltip-swatch');
	});

	it('puts the swatch before a numeric value', () => {
		const html = getHtml(10, { decimalPlaces: 2, resolveValueColor: () => '#1b5e20' });

		const swatchIndex = html!.indexOf('ptr-NativeMapTooltip-swatch');
		const valueIndex = html!.indexOf('ptr-NativeMapTooltip-value"');

		expect(swatchIndex).toBeGreaterThanOrEqual(0);
		expect(html).toContain('background-color: #1b5e20');
		expect(valueIndex).toBeGreaterThan(swatchIndex);
	});

	it('puts the swatch before an app-supplied label', () => {
		const html = getHtml(11, {
			resolveValueColor: () => 'rgba(27, 94, 32, 1)',
			resolveValueLabel: () => 'Tree cover (closed)',
		});

		const swatchIndex = html!.indexOf('ptr-NativeMapTooltip-swatch');
		const labelIndex = html!.indexOf('Tree cover (closed)');

		expect(swatchIndex).toBeGreaterThanOrEqual(0);
		expect(html).toContain('background-color: rgba(27, 94, 32, 1)');
		expect(labelIndex).toBeGreaterThan(swatchIndex);
	});

	it('renders no swatch when the resolver returns nothing for the value', () => {
		const html = getHtml(10, { resolveValueColor: () => undefined });

		expect(html).not.toContain('ptr-NativeMapTooltip-swatch');
	});

	it('renders no swatch for a value that is not a plausible colour', () => {
		// The colour is interpolated into a style attribute, so anything outside a CSS
		// colour's character set is refused outright rather than escaped into the markup.
		for (const badColor of ['red" onload="alert(1)', '<script>x</script>', 'javascript:alert(1)']) {
			const html = getHtml(10, { resolveValueColor: () => badColor });

			expect(html).not.toContain('ptr-NativeMapTooltip-swatch');
			expect(html).not.toContain('alert');
			expect(html).not.toContain('script');
		}
	});

	it('accepts the colour notations the legends actually use', () => {
		for (const color of ['#4f694d', 'rgba(27, 94, 32, 0.63)', 'rgb(255, 0, 0)', 'red', 'hsl(120, 50%, 40%)']) {
			expect(getHtml(10, { resolveValueColor: () => color })).toContain(
				`background-color: ${color}`
			);
		}
	});

	it('keeps the swatch out of the title', () => {
		const html = getHtml(10, { title: 'Land cover classes', resolveValueColor: () => '#fff' });

		// The title names the layer, so a colour there would be meaningless.
		expect(html!.indexOf('ptr-NativeMapTooltip-title')).toBeLessThan(html!.indexOf('ptr-NativeMapTooltip-swatch'));
	});
});
