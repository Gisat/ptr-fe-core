
/**
 * Fetch from API handler to backend service with value included in cookies
 * @param endpointUrl Endpoint URL
 * @param body Body for POST request
 * @param method Optional - method for fetch request
 * @returns Cookie header from response 
 */
export const fetchForCookies = async (endpointUrl: string, body: unknown, method="POST") => {
    
    // execute fetch request
    const response = await fetch(endpointUrl as string, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    // get session cookie from response
    const setCookieHeader = response.headers.get('set-cookie');

    // check for cookie header
    if (!setCookieHeader)
        throw new Error("Missing session cookie in response")

    // return cookie header
    return setCookieHeader
}