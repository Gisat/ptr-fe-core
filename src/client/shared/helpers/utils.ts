/**
 * Fetch function for SWR with redirect behavior
 * @param url - The endpoint to fetch data from
 * @param options - Redirect paths and optional fetch options
 */
export const swrFetcher = async (
	url: string,
	options?: {
		loginRedirectPath?: string;
		errorRedirectPath?: string;
		init?: RequestInit;
	}
) => {
	try {
		const res = await fetch(url, {
			redirect: 'manual',
			credentials: 'include', // Ensure cookies are sent
			...options?.init,
		});
		console.log(res);
		const currentPath = window.location.pathname;
		if (res.status === 401 && res.statusText === 'Unauthorized') {
			const loginBasePath = options?.loginRedirectPath;
			if (loginBasePath && currentPath.startsWith(`${loginBasePath}/`) && currentPath !== `${loginBasePath}/login`) {
				window.location.href = `${loginBasePath}/login`;
				return;
			}
		} else if (res.status >= 400 && res.status < 600) {
			// Handle client and server error responses
			const errorPath = options?.errorRedirectPath;
			if (errorPath && currentPath !== errorPath) {
				window.location.href = `${errorPath}?code=${res.status}&message=${encodeURIComponent(res.statusText)}`;
			}
		}
		return await res.json();
	} catch (error) {
		console.error('Fetch error:', error);
		throw error;
	}
};

/**
 * Converts a hex color string to an RGB array.
 *
 * @param {string} hex - The hex color string (e.g., "#ff0000" or "ff0000").
 * @returns {[number, number, number]} The RGB color array, where each value is in the range 0-255.
 */
export function hexToRgbArray(hex: string): [number, number, number] {
	hex = hex.replace(/^#/, '');
	if (hex.length === 3) {
		hex = hex
			.split('')
			.map((x) => x + x)
			.join('');
	}
	const num = parseInt(hex, 16);
	return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
