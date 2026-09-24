import { getMapTooltip } from '../../../client/map/MapSet/MapTooltip/getMapTooltip';
import type { RenderingLayer } from '../../../client';

/**
 * A COG tooltip is only produced for a layer carrying `cogBitmapOptions`, and the
 * raster path reads pixel data off the picking info. These helpers build the lightest
 * shapes that satisfy both, so the settle behaviour can be exercised without a
 * renderer.
 */
const buildCogPick = (layerId: string, value = 7) => ({
	layer: { id: layerId, props: { cogBitmapOptions: { useChannel: 1 } } },
	bitmap: { size: { width: 1, height: 1 }, uv: [0, 0] },
	uv: [0, 0],
	tile: { content: { raw: new Float32Array([value]), width: 1, height: 1 } },
	x: 10,
	y: 20,
});

const buildVectorPick = (layerId: string, properties: Record<string, unknown> = {}) => ({
	layer: { id: layerId, props: {} },
	object: { properties },
	x: 10,
	y: 20,
});

const buildMapLayer = (key: string, tooltipSettings: Record<string, unknown>, isCog: boolean): RenderingLayer =>
	({
		key,
		isActive: true,
		interaction: null,
		datasource: {
			key: `${key}-datasource`,
			labels: [],
			neighbours: [key],
			configuration: isCog
				? { cogBitmapOptions: { useChannel: 1, tooltipSettings } }
				: {
						geojsonOptions: {
							tooltipSettings: { attributes: [{ key: 'NAME', label: '[NAME]' }], ...tooltipSettings },
						},
					},
		},
	}) as unknown as RenderingLayer;

const getStyles = (tooltip: any) => tooltip?.style ?? {};

/** Counts how many pointer indicators the markup carries. */
const countIndicators = (tooltip: { html?: string } | null | undefined) =>
	(tooltip?.html ?? '').split('ptr-NativeMapTooltip-indicator').length - 1;

/**
 * `nativeClassName` is the supported seam for an app to restyle tooltip content, so the
 * classes have to reach the right element: a layer's own section in a merged tooltip,
 * never the shared box.
 */
describe('getMapTooltip - per-layer class names', () => {
	it('keeps a single layer\u2019s class on the tooltip element', () => {
		const vectorPick = buildVectorPick('districts', { NAME: 'Lusaka' });
		const tooltip = getMapTooltip({
			info: vectorPick,
			infos: [vectorPick],
			mapLayers: [buildMapLayer('districts', { nativeClassName: 'SLIM-Districts' }, false)],
			verticalOffset: 0,
		});

		expect(tooltip?.className).toContain('SLIM-Districts');
	});

	it('puts each merged layer\u2019s class on its own section', () => {
		const vectorPick = buildVectorPick('districts', { NAME: 'Lusaka' });
		const rasterPick = buildCogPick('raster-layer');
		const tooltip = getMapTooltip({
			info: vectorPick,
			infos: [vectorPick, rasterPick],
			mapLayers: [
				buildMapLayer('districts', { nativeClassName: 'SLIM-Districts' }, false),
				buildMapLayer('raster-layer', { nativeClassName: 'SLIM-LandCover', hoverDelay: 300 }, true),
			],
			verticalOffset: 0,
		});

		// Classes of every section element in the markup, in order.
		const sectionClasses = (tooltip!.html.match(/<div class="([^"]*ptr-NativeMapTooltip-section[^"]*)"/g) ?? []).map(
			(tag) => tag.replace(/<div class="|"/g, '').split(/\s+/)
		);

		const districtSection = sectionClasses.find((classes) => classes.includes('SLIM-Districts'));
		const rasterSection = sectionClasses.find((classes) => classes.includes('SLIM-LandCover'));

		// Scoping a rule to one layer only works if each class is on its own section.
		expect(districtSection).toBeDefined();
		expect(rasterSection).toBeDefined();
		expect(districtSection).not.toContain('SLIM-LandCover');
		expect(rasterSection).not.toContain('SLIM-Districts');
		// The raster sits below the district, so it is the spaced (lower) section.
		expect(rasterSection).toContain('ptr-NativeMapTooltip-sectionSpaced');
	});

	it('keeps a layer class off the shared box class', () => {
		const vectorPick = buildVectorPick('districts', { NAME: 'Lusaka' });
		const rasterPick = buildCogPick('raster-layer');
		const tooltip = getMapTooltip({
			info: vectorPick,
			infos: [vectorPick, rasterPick],
			mapLayers: [
				buildMapLayer('districts', { nativeClassName: 'SLIM-Districts' }, false),
				buildMapLayer('raster-layer', { hoverDelay: 300 }, true),
			],
			verticalOffset: 0,
		});

		// On a merged box a layer class would style every layer, so the element keeps only
		// the shared class while the layer's own class moves to its section.
		expect(tooltip?.className).toBe('ptr-NativeMapTooltip');
		expect(tooltip!.html).toContain('SLIM-Districts');
	});

	it('never puts the shared box class on a section', () => {
		const vectorPick = buildVectorPick('districts', { NAME: 'Lusaka' });
		const rasterPick = buildCogPick('raster-layer');
		const tooltip = getMapTooltip({
			info: vectorPick,
			infos: [vectorPick, rasterPick],
			mapLayers: [
				buildMapLayer('districts', {}, false),
				buildMapLayer('raster-layer', { hoverDelay: 300 }, true),
			],
			verticalOffset: 0,
		});

		// The box class carries background/padding/radius; on a section it would draw a
		// second box inside the tooltip, so it must appear exactly once - on the element.
		const boxClassOccurrences = (tooltip!.html.match(/ptr-NativeMapTooltip(?=["\s])/g) ?? []).length;
		const sectionTags = tooltip!.html.match(/<div class="[^"]*ptr-NativeMapTooltip-section[^"]*"/g) ?? [];

		expect(sectionTags.length).toBeGreaterThan(0);
		expect(boxClassOccurrences).toBe(0);
	});
});

/**
 * The indicator marks where the tooltip is anchored, so every tooltip must carry exactly
 * one - never none, and never one per merged layer.
 */
describe('getMapTooltip - pointer indicator', () => {
	it('keeps the indicator of a single layer shown right away', () => {
		const vectorPick = buildVectorPick('districts', { NAME: 'Lusaka' });
		const tooltip = getMapTooltip({
			info: vectorPick,
			infos: [vectorPick],
			mapLayers: [buildMapLayer('districts', {}, false)],
			verticalOffset: 0,
		});

		// Regression guard: the indicator used to be stripped while collecting layers, so
		// this path handed over content with no indicator at all.
		expect(tooltip?.html).toContain('Lusaka');
		expect(countIndicators(tooltip)).toBe(1);
	});

	it('keeps the indicator of a single layer that waits', () => {
		const pick = buildCogPick('raster-layer');
		const tooltip = getMapTooltip({
			info: pick,
			infos: [pick],
			mapLayers: [buildMapLayer('raster-layer', { hoverDelay: 300 }, true)],
			verticalOffset: 0,
		});

		expect(countIndicators(tooltip)).toBe(1);
	});

	it('emits one indicator when merging layers shown right away', () => {
		const firstPick = buildVectorPick('districts', { NAME: 'Lusaka' });
		const secondPick = buildVectorPick('wards', { WARD_NAME: 'Kabwata' });
		const tooltip = getMapTooltip({
			info: firstPick,
			infos: [firstPick, secondPick],
			mapLayers: [buildMapLayer('districts', {}, false), buildMapLayer('wards', {}, false)],
			verticalOffset: 0,
		});

		// Each layer arrives with its own indicator, so merging has to remove them.
		expect(countIndicators(tooltip)).toBe(1);
	});

	it('emits one indicator when merging a waiting layer with an immediate one', () => {
		const rasterPick = buildCogPick('raster-layer');
		const vectorPick = buildVectorPick('districts', { NAME: 'Lusaka' });
		const tooltip = getMapTooltip({
			info: vectorPick,
			infos: [vectorPick, rasterPick],
			mapLayers: [buildMapLayer('raster-layer', { hoverDelay: 300 }, true), buildMapLayer('districts', {}, false)],
			verticalOffset: 0,
		});

		expect(countIndicators(tooltip)).toBe(1);
	});

	it('emits one indicator when every merged layer waits', () => {
		const firstPick = buildCogPick('raster-layer');
		const secondPick = buildCogPick('slow-raster');
		const tooltip = getMapTooltip({
			info: firstPick,
			infos: [firstPick, secondPick],
			mapLayers: [
				buildMapLayer('raster-layer', { hoverDelay: 200 }, true),
				buildMapLayer('slow-raster', { hoverDelay: 500 }, true),
			],
			verticalOffset: 0,
		});

		expect(countIndicators(tooltip)).toBe(1);
	});
});

describe('getMapTooltip - settle reveal', () => {
	it('returns the tooltip untouched when no layer asks for a delay', () => {
		const pick = buildCogPick('raster-layer');
		const tooltip = getMapTooltip({
			info: pick,
			infos: [pick],
			mapLayers: [buildMapLayer('raster-layer', {}, true)],
			verticalOffset: 0,
		});

		expect(tooltip?.html).not.toContain('ptr-NativeMapTooltip-settle');
		expect(tooltip?.html).not.toContain('ptr-NativeMapTooltip-pendingSection');
		// The element keeps its own chrome when nothing settles.
		expect(getStyles(tooltip).backgroundColor).not.toBe('transparent');
		expect(getStyles(tooltip).padding).not.toBe(0);
	});

	it('hides a lone delayed raster tooltip completely until the pointer settles', () => {
		const pick = buildCogPick('raster-layer');
		const tooltip = getMapTooltip({
			info: pick,
			infos: [pick],
			mapLayers: [buildMapLayer('raster-layer', { hoverDelay: 300, title: 'Land cover classes' }, true)],
			verticalOffset: 0,
		});

		expect(tooltip?.html).toContain('ptr-NativeMapTooltip-settle');
		expect(tooltip?.html).toContain('--ptr-native-map-tooltip-hover-delay: 300ms');

		// The content, title included, waits inside the wrapper.
		const wrapperIndex = tooltip!.html.indexOf('ptr-NativeMapTooltip-settle"');
		expect(wrapperIndex).toBeGreaterThanOrEqual(0);
		expect(tooltip!.html.indexOf('Land cover classes')).toBeGreaterThan(wrapperIndex);

		// The wrapper paints, so the element must not paint anything of its own -
		// otherwise an empty box would track the cursor while the content is hidden.
		expect(getStyles(tooltip).backgroundColor).toBe('transparent');
		expect(getStyles(tooltip).boxShadow).toBe('none');
		expect(getStyles(tooltip).padding).toBe(0);
	});

	it('keeps the position styles while hiding, so the tooltip lands on the cursor', () => {
		const pick = buildCogPick('raster-layer');
		const tooltip = getMapTooltip({
			info: pick,
			infos: [pick],
			mapLayers: [buildMapLayer('raster-layer', { hoverDelay: 300 }, true)],
			verticalOffset: 0,
		});

		expect(getStyles(tooltip).left).toBeDefined();
		expect(getStyles(tooltip).top).toBeDefined();
		expect(getStyles(tooltip).transform).toBeDefined();
	});

	it('keeps the indicator inside the hidden wrapper, so it appears with the content', () => {
		const pick = buildCogPick('raster-layer');
		const tooltip = getMapTooltip({
			info: pick,
			infos: [pick],
			mapLayers: [buildMapLayer('raster-layer', { hoverDelay: 300 }, true)],
			verticalOffset: 0,
		});

		const wrapperIndex = tooltip!.html.indexOf('ptr-NativeMapTooltip-settle"');
		const indicatorIndex = tooltip!.html.indexOf('ptr-NativeMapTooltip-indicator');

		// Regression guard: outside the wrapper the triangle would be visible during the
		// delay while the content is not, hanging in the empty space the hidden content
		// still occupies. It belongs with the content it points from.
		expect(wrapperIndex).toBeGreaterThanOrEqual(0);
		expect(indicatorIndex).toBeGreaterThan(wrapperIndex);
		expect(countIndicators(tooltip)).toBe(1);
	});

	it('uses the longest delay when every layer asks for one', () => {
		const firstPick = buildCogPick('raster-layer');
		const secondPick = buildCogPick('slow-raster');
		const tooltip = getMapTooltip({
			info: firstPick,
			infos: [firstPick, secondPick],
			mapLayers: [
				buildMapLayer('raster-layer', { hoverDelay: 200 }, true),
				buildMapLayer('slow-raster', { hoverDelay: 500 }, true),
			],
			verticalOffset: 0,
		});

		// Nothing can be read while moving, so the tooltip appears in one piece.
		expect(tooltip?.html).toContain('ptr-NativeMapTooltip-settle');
		expect(tooltip?.html).toContain('--ptr-native-map-tooltip-hover-delay: 500ms');
	});

	it('keeps the indicator outside a waiting section, so it shows with the visible content', () => {
		// Order as the map renders it: the district overlay on top, the raster beneath.
		const rasterPick = buildCogPick('raster-layer');
		const vectorPick = buildVectorPick('districts', { NAME: 'Lusaka' });
		const tooltip = getMapTooltip({
			info: vectorPick,
			infos: [vectorPick, rasterPick],
			mapLayers: [buildMapLayer('raster-layer', { hoverDelay: 300 }, true), buildMapLayer('districts', {}, false)],
			verticalOffset: 0,
		});

		// The district block is readable while the raster waits, so the indicator must point
		// from the visible content rather than sit inside the waiting wrapper.
		expect(tooltip!.html.indexOf('Lusaka')).toBeLessThan(tooltip!.html.indexOf('ptr-NativeMapTooltip-indicator'));
		expect(tooltip!.html.indexOf('ptr-NativeMapTooltip-pendingSection"')).toBeLessThan(
			tooltip!.html.indexOf('ptr-NativeMapTooltip-indicator')
		);
	});

	it('keeps the vector tooltip visible while a raster underneath it waits', () => {
		const rasterPick = buildCogPick('raster-layer', 42.5);
		const vectorPick = buildVectorPick('districts', { NAME: 'Lusaka' });
		const tooltip = getMapTooltip({
			info: vectorPick,
			infos: [vectorPick, rasterPick],
			mapLayers: [buildMapLayer('raster-layer', { hoverDelay: 300 }, true), buildMapLayer('districts', {}, false)],
			verticalOffset: 0,
		});

		// The raster section hides on its own...
		expect(tooltip?.html).toContain('ptr-NativeMapTooltip-pendingSection');
		expect(tooltip?.html).toContain('--ptr-native-map-tooltip-hover-delay: 300ms');
		// ...so the whole tooltip is not hidden, and the vector text is readable now.
		expect(tooltip?.html).not.toContain('ptr-NativeMapTooltip-settle"');
		expect(tooltip?.html).toContain('Lusaka');
		expect(getStyles(tooltip).backgroundColor).not.toBe('transparent');
		expect(getStyles(tooltip).padding).not.toBe(0);
	});

	it('puts the gap on the waiting section, so nothing is left under the visible one', () => {
		const rasterPick = buildCogPick('raster-layer');
		const vectorPick = buildVectorPick('districts', { NAME: 'Lusaka' });
		const tooltip = getMapTooltip({
			info: vectorPick,
			infos: [vectorPick, rasterPick],
			mapLayers: [buildMapLayer('raster-layer', { hoverDelay: 300 }, true), buildMapLayer('districts', {}, false)],
			verticalOffset: 0,
		});

		// No rule between the layers: the sections are told apart by their titles and
		// formats, so only a gap separates them.
		expect(tooltip?.html).not.toContain('ptr-NativeMapTooltip-separator');

		const pendingIndex = tooltip!.html.indexOf('ptr-NativeMapTooltip-pendingSection"');
		const spacedIndex = tooltip!.html.indexOf('ptr-NativeMapTooltip-sectionSpaced');

		// The gap belongs to the raster - the lower, waiting section - so it sits inside the
		// waiting wrapper and disappears with it. The visible district section above carries
		// none, which is what keeps empty space from appearing under its value.
		expect(pendingIndex).toBeGreaterThanOrEqual(0);
		expect(spacedIndex).toBeGreaterThan(pendingIndex);
		expect(tooltip!.html.indexOf('Lusaka')).toBeLessThan(pendingIndex);
	});

	it('gives the lower section a gap when both sections are visible', () => {
		const firstPick = buildVectorPick('districts', { NAME: 'Lusaka' });
		const secondPick = buildVectorPick('wards', { WARD_NAME: 'Kabwata' });
		const tooltip = getMapTooltip({
			info: firstPick,
			infos: [firstPick, secondPick],
			mapLayers: [buildMapLayer('districts', {}, false), buildMapLayer('wards', {}, false)],
			verticalOffset: 0,
		});

		// Exactly one of the two sections is offset, so they do not read as one block.
		const spacedOccurrences = tooltip!.html.split('ptr-NativeMapTooltip-sectionSpaced').length - 1;

		expect(spacedOccurrences).toBe(1);
		expect(tooltip?.html).not.toContain('ptr-NativeMapTooltip-pendingSection');
	});

	it('gives no gap to the first section, so the tooltip starts at its content', () => {
		const firstPick = buildVectorPick('districts', { NAME: 'Lusaka' });
		const secondPick = buildVectorPick('wards', { WARD_NAME: 'Kabwata' });
		const tooltip = getMapTooltip({
			info: firstPick,
			infos: [firstPick, secondPick],
			mapLayers: [buildMapLayer('districts', {}, false), buildMapLayer('wards', {}, false)],
			verticalOffset: 0,
		});

		// The first section must not be indented, so nothing is left above the tooltip's
		// first line of content.
		const firstSectionHtml = tooltip!.html.slice(0, tooltip!.html.indexOf('Lusaka'));

		expect(firstSectionHtml).not.toContain('ptr-NativeMapTooltip-sectionSpaced');
	});

	it('ignores delays that cannot be applied', () => {
		const pick = buildCogPick('raster-layer');

		for (const hoverDelay of [0, -100, Number.NaN]) {
			const tooltip = getMapTooltip({
				info: pick,
				infos: [pick],
				mapLayers: [buildMapLayer('raster-layer', { hoverDelay }, true)],
				verticalOffset: 0,
			});

			expect(tooltip?.html).not.toContain('ptr-NativeMapTooltip-settle');
			expect(tooltip?.html).not.toContain('ptr-NativeMapTooltip-pendingSection');
		}
	});

	it('does not delay vector-only tooltips', () => {
		const vectorPick = buildVectorPick('districts', { NAME: 'Lusaka' });
		const tooltip = getMapTooltip({
			info: vectorPick,
			infos: [vectorPick],
			mapLayers: [buildMapLayer('districts', {}, false)],
			verticalOffset: 0,
		});

		expect(tooltip?.html).toContain('Lusaka');
		expect(tooltip?.html).not.toContain('ptr-NativeMapTooltip-settle');
		expect(tooltip?.html).not.toContain('ptr-NativeMapTooltip-pendingSection');
	});
});
