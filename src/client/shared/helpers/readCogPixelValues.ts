/**
 * Reads pixel channel values from a COG (Cloud Optimized GeoTIFF) DeckGL picking-info object.
 *
 * Resolves the UV coordinate from `info.uv` or `info.bitmap.uv`, maps it to an (x, y)
 * pixel position within the raw tile buffer, and slices out the per-channel values.
 *
 * @param {any} info - DeckGL picking info (may contain `bitmap.uv` and `tile.content.raw`).
 * @returns {number[] | null} Array of channel values at the picked pixel, or `null` if the
 *   tile data is unavailable or the first channel value is NaN.
 */
export function readCogPixelValues(info: any): number[] | null {
	const uv: [number, number] | undefined = info.uv ?? info.bitmap?.uv;
	if (!info.tile?.content?.raw || !uv) return null;

	const { raw, width, height } = info.tile.content;
	const [u, v] = uv;
	const px = Math.floor(u * width);
	const py = Math.floor(v * height);
	const channels = raw.length / (width * height);
	const pixelIndex = Math.floor((py * width + px) * channels);
	const values: number[] = Array.from(raw.slice(pixelIndex, pixelIndex + channels));

	if (!values.length || Number.isNaN(values[0])) return null;
	return values;
}

