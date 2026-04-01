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
 *   Must be a finite integer within `[0, channels-1]`; otherwise `null` is returned.
 * @returns {number[] | null} Array of values from all channels at the picked pixel,
 *   or `null` if the data is unavailable or the value on current channel contains NaN.
 */
export function readCogPixelValues(info: any, channelIndex: number): number[] | null {
	if (!Number.isInteger(channelIndex) || channelIndex < 0) return null;

	const uv: [number, number] | undefined = info.uv ?? info.bitmap?.uv;
	if (!info.tile?.content?.raw || !uv) return null;

	const { raw, width, height } = info.tile.content;
	const channels = raw.length / (width * height);

	// Validate that channels resolves to a positive integer and channelIndex is in range.
	if (!Number.isInteger(channels) || channels < 1 || channelIndex >= channels) return null;

	const [u, v] = uv;
	// Clamp to [0, dimension-1] so UV values of 0.0, 1.0 or out-of-range do not produce out-of-bounds indices.
	const px = Math.max(0, Math.min(Math.floor(u * width), width - 1));
	const py = Math.max(0, Math.min(Math.floor(v * height), height - 1));
	const pixelIndex = (py * width + px) * channels;
	const values: number[] = Array.from(raw.slice(pixelIndex, pixelIndex + channels));

	if (!values.length || Number.isNaN(values[channelIndex])) return null;

	return values;
}
