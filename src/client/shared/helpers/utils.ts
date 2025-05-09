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

export const enumToArray = (enumType: any) => Object.values(enumType);

export const enumIncludes = (enumType: any, value: string) => enumToArray(enumType).includes(value);

export const strCapitalizeFirstLetter = (str: string) => {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
};
