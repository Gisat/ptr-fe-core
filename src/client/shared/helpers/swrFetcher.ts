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
			credentials: 'include',
			...options?.init,
		});
		const currentPath = window.location.pathname;
		if (res.status === 401 && res.statusText === 'Unauthorized') {
			const loginBasePath = options?.loginRedirectPath;
			if (loginBasePath && currentPath.startsWith(`${loginBasePath}/`) && currentPath !== `${loginBasePath}/login`) {
				window.location.href = `${loginBasePath}/login`;
				return;
			}
		} else if (res.status >= 400 && res.status < 600) {
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
