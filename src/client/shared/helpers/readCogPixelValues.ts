/**
 * Reads pixel values from a COG (Cloud Optimized GeoTIFF) from all channels DeckGL picking-info object.
 *
 * Resolves the UV coordinate from `info.uv` or `info.bitmap.uv`, maps it to an (x, y)
 * pixel position within the raw tile buffer, and slices out the per-channel values.
 * Returns `null` if tile data is unavailable or the value at `channelIndex` is NaN.
 *
 * @param {any} info - DeckGL picking info object. Expected to contain:
 *   - `info.uv` or `info.bitmap.uv` — normalised UV coordinates `[u, v]` within the tile.
 *   - `info.tile.content.raw` — flat typed array of raw pixel data.
 *   - `info.tile.content.width` / `height` — tile dimensions in pixels.
 * @param {number} channelIndex - Zero-based index of the channel whose value is validated.
 *   If the value at this index is NaN, or if `channelIndex < 0`, `null` is returned.
 * @returns {number[] | null} Array of values from all channels at the picked pixel,
 *   or `null` if the data is unavailable or the value on current channel contains NaN.
 */
export function readCogPixelValues(info: any, channelIndex): number[] | null {
	const uv: [number, number] | undefined = info.uv ?? info.bitmap?.uv;
	if (!info.tile?.content?.raw || !uv || channelIndex < 0) return null;

	const { raw, width, height } = info.tile.content;
	const [u, v] = uv;
	const px = Math.floor(u * width);
	const py = Math.floor(v * height);
	const channels = raw.length / (width * height);
	const pixelIndex = Math.floor((py * width + px) * channels);
	const values: number[] = Array.from(raw.slice(pixelIndex, pixelIndex + channels));

	if (!values.length || Number.isNaN(values[channelIndex])) return null;

	return values;
}
